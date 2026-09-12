import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, mkdtempSync } from "node:fs";
import { resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

// Frames are captured through the browser UI. This builder never creates dialogue
// or alters an outcome. Keep the private capture directory outside git.
const root = process.cwd();
const require = createRequire(import.meta.url);
const optional = (path, select = value => value) => { try { return select(require(path)); } catch { return undefined; } };
const ffmpeg = process.env.DATEHAJA_FFMPEG || optional("../.scratch/media-tools/node_modules/ffmpeg-static") || "ffmpeg";
const ffprobe = process.env.DATEHAJA_FFPROBE || optional("../.scratch/media-tools/node_modules/ffprobe-static", value => value.path) || "ffprobe";
const captures = resolve(process.argv[2] || ".scratch/submission/capture");
const beats = JSON.parse(readFileSync(resolve(captures, "beats.json"), "utf8"));
const story = JSON.parse(readFileSync("submission/film-storyboard.json", "utf8"));
assert(new Set(beats.map(b => b.name)).size === beats.length, "Duplicate captured beats");
const total = story.reduce((n, beat) => n + beat.seconds, 0);
assert(total > 0 && total < 180, "Submission must be under three minutes");
mkdirSync(".scratch/submission", { recursive: true });
mkdirSync("public/demo", { recursive: true });
const scratch = mkdtempSync(resolve(".scratch/submission/encode-"));
const run = (binary, args) => {
  const result = spawnSync(binary, args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr.slice(-4000) || `Failed: ${binary}`);
  return result.stdout;
};
const time = (seconds, separator = ".") => {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2,"0")}:${String(Math.floor(ms / 60000) % 60).padStart(2,"0")}:${String(Math.floor(ms / 1000) % 60).padStart(2,"0")}${separator}${String(ms % 1000).padStart(3,"0")}`;
};
const assTime = seconds => time(seconds).replace(/^(\d)0:/, "$1:").slice(0, -1);
const cues = [], segments = [];
let offset = 0;
for (const [index, beat] of story.entries()) {
  const source = beats.find(value => value.name === beat.name);
  assert(source && Number.isInteger(source.frames) && source.frames > 1, `Missing capture: ${beat.name}`);
  assert(beat.captions?.length > 0, `Missing captions: ${beat.name}`);
  for (let n = 1; n <= source.frames; n++) assert(existsSync(resolve(captures, beat.name, `${String(n).padStart(4,"0")}.png`)), `Missing frame ${beat.name}/${n}`);
  const output = resolve(scratch, `${index}.mp4`);
  // Browser screenshot bytes may be JPEG despite the capture filename suffix.
  const magic = readFileSync(resolve(captures, beat.name, "0001.png"));
  const codec = magic[0] === 0xff && magic[1] === 0xd8 ? "mjpeg" : "png";
  run(ffmpeg, ["-y", "-v", "error", "-framerate", String(source.frames / beat.seconds), "-c:v", codec, "-i", resolve(captures, beat.name, "%04d.png"), "-vf", "scale=1280:720:flags=lanczos,pad=1280:840:0:0:color=0x151014,fps=24,setsar=1", "-t", String(beat.seconds), "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "21", "-pix_fmt", "yuv420p", "-threads", "4", output]);
  segments.push(`file '${output.replaceAll("\\", "/").replaceAll("'", "'\\''")}'`);
  beat.captions.forEach((caption, i) => cues.push({ start: offset + beat.seconds * i / beat.captions.length, end: offset + beat.seconds * (i + 1) / beat.captions.length, caption }));
  offset += beat.seconds;
  console.log(`Encoded ${index + 1}/${story.length}: ${beat.name}`);
}
writeFileSync(resolve(scratch, "concat.txt"), segments.join("\n"));
const joined = resolve(scratch, "joined.mp4");
run(ffmpeg, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", resolve(scratch, "concat.txt"), "-c", "copy", joined]);
const ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1280\nPlayResY: 840\nWrapStyle: 2\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,24,&H00FFFFFF,&H00FFFFFF,&H00151014,&H00151014,0,0,0,0,100,100,0,0,1,0,0,2,25,25,29,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n` + cues.map(cue => `Dialogue: 0,${assTime(cue.start)},${assTime(cue.end)},Default,,0,0,0,,${cue.caption.replaceAll("\n", "\\N")}`).join("\n");
const assPath = resolve(scratch, "captions.ass");
writeFileSync(assPath, ass);
const film = resolve("public/demo/Datehaja-demo.mp4");
// Subtitle failures are fatal. Never silently publish an uncaptioned film.
run(ffmpeg, ["-y", "-v", "error", "-i", joined, "-vf", `ass=${relative(root, assPath).replaceAll("\\", "/")}`, "-c:v", "libx264", "-preset", "fast", "-crf", "21", "-pix_fmt", "yuv420p", "-threads", "4", "-an", "-movflags", "+faststart", film]);
const metadata = JSON.parse(run(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", film]));
assert(Number(metadata.format.duration) < 180 && Math.abs(Number(metadata.format.duration) - total) < 0.2, "Unexpected film duration");
run(ffmpeg, ["-v", "error", "-i", film, "-f", "null", "-"]);
writeFileSync("public/demo/Datehaja-demo.vtt", "WEBVTT\n\n" + cues.map((cue, i) => `${i + 1}\n${time(cue.start)} --> ${time(cue.end)}\n${cue.caption}\n`).join("\n"));
writeFileSync("public/demo/transcript.txt", "Datehaja — saved-record product walkthrough\nFictional test people. English translations identified on screen. Timing edited.\nNo narration; English captions are burned into the film.\n\n" + cues.map(cue => `${time(cue.start)}\n${cue.caption}\n`).join("\n"));
run(ffmpeg, ["-y", "-v", "error", "-ss", "3", "-i", film, "-frames:v", "1", "-update", "1", "public/demo/submission-poster.jpg"]);
copyFileSync(film, "submission/Datehaja-demo.mp4");
const report = { durationSeconds: Number(metadata.format.duration), width: metadata.streams[0].width, height: metadata.streams[0].height, fps: metadata.streams[0].avg_frame_rate, bytes: Number(metadata.format.size), sha256: createHash("sha256").update(readFileSync(film)).digest("hex"), captions: "Burned English; VTT and transcript also provided", audio: "None", decodedCompletely: true, source: "Browser UI screenshots of saved fictional records; playback retimed", chapters: story.map(beat => ({ name: beat.name, seconds: beat.seconds })) };
writeFileSync("submission/film-verification.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
