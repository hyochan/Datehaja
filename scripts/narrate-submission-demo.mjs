/**
 * Speak the film's captions with ElevenLabs and mux the result onto the video.
 *
 *   ELEVENLABS_API_KEY=... bun run demo:narrate
 *
 * Runs after `demo:submission`. The burned captions are the script, read from
 * the VTT the builder just wrote, so the voice can never drift from the words
 * on screen — and a viewer with the sound off loses nothing.
 *
 * Each line is placed at its own caption's start. A line that would outrun its
 * caption is slowed or quickened to fit rather than allowed to spill into the
 * next one, because a voice describing the previous screen is worse than no
 * voice at all.
 */
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const optional = (path, select = (v) => v) => { try { return select(require(path)); } catch { return undefined; } };
const ffmpeg = process.env.DATEHAJA_FFMPEG || optional("../.scratch/media-tools/node_modules/ffmpeg-static") || "ffmpeg";
const ffprobe = process.env.DATEHAJA_FFPROBE || optional("../.scratch/media-tools/node_modules/ffprobe-static", (v) => v.path) || "ffprobe";

/** Environment first, then `.env.local`, which is gitignored and stays local. */
const localEnv = (name) => {
  if (process.env[name]) return process.env[name];
  try {
    const source = readFileSync(".env.local", "utf8");
    return source.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim().replace(/^['"]|['"]$/g, "");
  } catch {
    return undefined;
  }
};

const KEY = localEnv("ELEVENLABS_API_KEY");
const MODEL = localEnv("ELEVENLABS_MODEL") || "eleven_multilingual_v2";
const VOICE_NAME = localEnv("ELEVENLABS_VOICE") || "Rachel";
// ElevenLabs when a key exists, otherwise the voice built into macOS. The
// local one is not as good, but it is the difference between hearing the
// pacing today and waiting on a credential — and swapping engines later only
// re-runs this step, never the capture.
const ENGINE = localEnv("DATEHAJA_TTS") || (KEY ? "elevenlabs" : "say");
assert(["elevenlabs", "say"].includes(ENGINE), `Unknown DATEHAJA_TTS: ${ENGINE}`);
assert(ENGINE !== "elevenlabs" || KEY, "Set ELEVENLABS_API_KEY, in the environment or .env.local.");
const SAY_VOICE = localEnv("DATEHAJA_SAY_VOICE") || "Samantha";

const run = (binary, args) => {
  const result = spawnSync(binary, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr.slice(-4000) || `Failed: ${binary}`);
  return result.stdout;
};
const seconds = (path) => Number(JSON.parse(run(ffprobe, ["-v", "error", "-show_format", "-of", "json", path])).format.duration);

/* ------------------------------- the script ------------------------------ */
const vtt = readFileSync("public/demo/Datehaja-demo.vtt", "utf8");
const toSeconds = (stamp) => {
  const [h, m, rest] = stamp.split(":");
  const [s, ms] = rest.split(".");
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
};
const cues = [...vtt.matchAll(/(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)\n(.+)/g)].map((m) => ({
  start: toSeconds(m[1]),
  window: toSeconds(m[2]) - toSeconds(m[1]),
  // The captions carry typographic quotes and a middot list separator, which
  // are read aloud as noise by some voices.
  text: m[3].replaceAll("·", ",").replaceAll("—", "-").trim(),
}));
assert(cues.length > 0, "No caption cues in public/demo/Datehaja-demo.vtt");

/* --------------------------------- voice --------------------------------- */
let voice = { name: SAY_VOICE };
if (ENGINE === "elevenlabs") {
  const voices = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": KEY } });
  assert(voices.ok, `ElevenLabs voices lookup failed (${voices.status})`);
  const list = (await voices.json()).voices ?? [];
  voice = list.find((v) => v.name?.toLowerCase() === VOICE_NAME.toLowerCase()) ?? list[0];
  assert(voice, "The ElevenLabs account has no voices available.");
  console.log(`Voice: ${voice.name} (${voice.voice_id}), ElevenLabs ${MODEL}`);
} else {
  console.log(`Voice: ${voice.name}, macOS say`);
}

/** Write one spoken line, whichever engine is in play. */
async function synthesize(text, index) {
  if (ENGINE === "say") {
    const aiff = resolve(scratch, `${index}.aiff`);
    const file = resolve(scratch, `${index}.mp3`);
    run("say", ["-v", SAY_VOICE, "-o", aiff, text]);
    run(ffmpeg, ["-y", "-v", "error", "-i", aiff, "-ar", "44100", "-ac", "1", file]);
    return file;
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    }),
  });
  assert(res.ok, `Speech failed for cue ${index + 1} (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const file = resolve(scratch, `${index}.mp3`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

const scratch = mkdtempSync(resolve(".scratch/submission/narrate-"));
mkdirSync(".scratch/submission", { recursive: true });

/* ------------------------------ synthesise ------------------------------- */
const clips = [];
for (const [i, cue] of cues.entries()) {
  const file = await synthesize(cue.text, i);
  const spoken = seconds(file);
  // Keep a breath at the end of the caption rather than butting up against it.
  const room = Math.max(0.4, cue.window - 0.25);
  const tempo = spoken > room ? Math.min(1.35, spoken / room) : 1;
  clips.push({ file, start: cue.start, spoken, tempo });
  console.log(`${String(i + 1).padStart(2)}. ${spoken.toFixed(1)}s in ${cue.window.toFixed(1)}s${tempo > 1 ? ` (tempo ${tempo.toFixed(2)})` : ""}  ${cue.text.slice(0, 46)}`);
}

/* --------------------------------- mux ----------------------------------- */
const film = resolve("public/demo/Datehaja-demo.mp4");
const duration = seconds(film);
const inputs = clips.flatMap((c) => ["-i", c.file]);
const chains = clips.map((c, i) => {
  const delay = Math.round(c.start * 1000);
  const tempo = c.tempo > 1 ? `atempo=${c.tempo.toFixed(4)},` : "";
  return `[${i + 1}:a]${tempo}adelay=${delay}|${delay},apad[a${i}]`;
});
const mix = `${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:duration=longest:dropout_transition=0,volume=${clips.length},atrim=0:${duration},asetpts=N/SR/TB[out]`;
const narrated = resolve(scratch, "narrated.mp4");
run(ffmpeg, ["-y", "-v", "error", "-i", film, ...inputs,
  "-filter_complex", [...chains, mix].join(";"),
  "-map", "0:v", "-map", "[out]",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ac", "2", "-ar", "44100",
  "-movflags", "+faststart", "-shortest", narrated]);

const probe = JSON.parse(run(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", narrated]));
const audio = probe.streams.find((s) => s.codec_type === "audio");
assert(audio, "The muxed film has no audio stream.");
assert(Math.abs(Number(probe.format.duration) - duration) < 0.5, "Narration changed the film's length");
// A film that cannot be decoded end to end is not a film anyone can watch.
run(ffmpeg, ["-v", "error", "-i", narrated, "-f", "null", "-"]);

copyFileSync(narrated, film);
copyFileSync(narrated, "submission/Datehaja-demo.mp4");

// The builder writes the transcript for a silent film. It is not one any more.
const transcript = readFileSync("public/demo/transcript.txt", "utf8");
writeFileSync("public/demo/transcript.txt", transcript.replace(
  "No narration; English captions are burned into the film.",
  `Narrated by ${voice.name}, reading the burned English captions verbatim.`,
));

const report = JSON.parse(readFileSync("submission/film-verification.json", "utf8"));
report.durationSeconds = Number(probe.format.duration);
report.bytes = Number(probe.format.size);
report.sha256 = createHash("sha256").update(readFileSync(film)).digest("hex");
report.audio = ENGINE === "elevenlabs"
  ? `ElevenLabs ${MODEL}, voice ${voice.name}; reads the burned captions verbatim`
  : `macOS speech synthesis, voice ${voice.name}; reads the burned captions verbatim`;
report.decodedCompletely = true;
writeFileSync("submission/film-verification.json", JSON.stringify(report, null, 2) + "\n");
console.log(`\n${report.durationSeconds.toFixed(1)}s, ${audio.codec_name} ${audio.sample_rate}Hz, ${report.bytes} bytes`);
console.log(`sha256 ${report.sha256}`);
