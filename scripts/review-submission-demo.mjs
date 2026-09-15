/**
 * Lay the film out as one frame per caption, so the picture can be read
 * against the words.
 *
 *   bun run demo:review
 *
 * Every automated check the film had was about the file: duration, captions
 * present, decodes end to end, hash recorded. None of them could notice that a
 * beat was narrating private letters while showing a transcript, a journal
 * belonging to a different date, or a sponsor list that appeared nowhere on the
 * screen it was spoken over. Four beats shipped that way.
 *
 * This cannot judge a frame either — but it puts each caption's middle frame
 * next to its own text, nine at a time, which takes about a minute to read and
 * would have caught all four.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const optional = (path, select = (v) => v) => { try { return select(require(path)); } catch { return undefined; } };
const ffmpeg = process.env.DATEHAJA_FFMPEG || optional("../.scratch/media-tools/node_modules/ffmpeg-static") || "ffmpeg";

const run = (binary, args) => {
  const result = spawnSync(binary, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr.slice(-3000) || `Failed: ${binary}`);
  return result.stdout;
};

const film = resolve(process.argv[2] || "public/demo/Datehaja-demo.mp4");
const out = resolve(".scratch/submission/review");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const toSeconds = (stamp) => {
  const [h, m, rest] = stamp.split(":");
  const [s, ms] = rest.split(".");
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
};
const cues = [...readFileSync("public/demo/Datehaja-demo.vtt", "utf8")
  .matchAll(/(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)\n(.+)/g)]
  .map((m, i) => ({ n: i + 1, at: (toSeconds(m[1]) + toSeconds(m[2])) / 2, text: m[3].trim() }));
if (!cues.length) throw new Error("No caption cues in public/demo/Datehaja-demo.vtt");

for (const cue of cues) {
  run(ffmpeg, ["-y", "-v", "error", "-ss", String(cue.at), "-i", film,
    "-frames:v", "1", "-update", "1", resolve(out, `${String(cue.n).padStart(2, "0")}.png`)]);
}

// Nine to a sheet: enough to see a run of beats together, still large enough to
// read the burned caption under each frame.
const sheets = Math.ceil(cues.length / 9);
run(ffmpeg, ["-y", "-v", "error", "-start_number", "1", "-i", resolve(out, "%02d.png"),
  "-vf", "scale=560:-1,drawtext=text='%{eif\\:n+1\\:d}':x=10:y=10:fontsize=34:fontcolor=yellow:box=1:boxcolor=black@0.75:boxborderw=6,tile=3x3:margin=6:padding=6:color=0x222222",
  "-frames:v", String(sheets), resolve(out, "sheet%d.png")]);

writeFileSync(resolve(out, "captions.txt"),
  cues.map((c) => `${String(c.n).padStart(2)}  ${c.at.toFixed(1).padStart(6)}s  ${c.text}`).join("\n") + "\n");

console.log(`${cues.length} frames, ${sheets} sheets in ${out}`);
console.log("Read each sheet and ask of every frame: is this the screen the caption is describing?");
