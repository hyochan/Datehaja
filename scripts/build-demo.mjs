#!/usr/bin/env node
/**
 * Cuts the raw Playwright capture into the submission film.
 *
 * The recording spec marks where each storyboard beat starts and ends. This
 * trims those spans out of the raw capture and time-scales each one to exactly
 * the duration `submission/demo-beats.json` asks for. That is what keeps the
 * finished film the same length whatever the models did that day — and it is
 * why DEMO_CAPTIONS.srt can be written once instead of retimed after every
 * take.
 *
 *   bun run demo:build            # burn the captions in
 *   bun run demo:build --no-burn  # clean footage, captions as a sidecar file
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const BEATS = "submission/demo-beats.json";
const MARKS = "test-results/demo-marks.json";
const CAPTIONS = "submission/DEMO_CAPTIONS.srt";
const WORK = "test-results/demo-build";
const OUTPUT = "submission/Datehaja-demo.mp4";
const CEILING_SECONDS = 180; // the rules say under three minutes

const burnCaptions = !process.argv.includes("--no-burn");

function die(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

function ffmpeg(args, { allowFailure = false } = {}) {
  const run = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  if (run.error || run.status !== 0) {
    if (allowFailure) return false;
    die(`ffmpeg failed:\n  ffmpeg ${args.join(" ")}`);
  }
  return true;
}

if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) {
  die(
    "ffmpeg is not on PATH. Install it (macOS: brew install ffmpeg, " +
      "Windows: winget install Gyan.FFmpeg) and run this again.",
  );
}

if (!existsSync(MARKS)) {
  die(
    `No recording found at ${MARKS}.\n  Record one first:  DATEHAJA_DEMO_RECORD=1 bun run demo:record`,
  );
}

const storyboard = JSON.parse(readFileSync(BEATS, "utf8"));
const recording = JSON.parse(readFileSync(MARKS, "utf8"));
const marks = new Map(recording.marks.map((mark) => [mark.id, mark]));

if (!recording.rawPath || !existsSync(recording.rawPath)) {
  die(
    `The raw capture named by ${MARKS} is missing (${recording.rawPath ?? "none"}).\n` +
      "  Playwright writes it when the run finishes; re-record rather than " +
      "building from a partial run.",
  );
}

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

const parts = [];
let planned = 0;

for (const beat of storyboard.beats) {
  const mark = marks.get(beat.id);
  if (!mark) die(`The recording has no beat called "${beat.id}".`);

  const rawSeconds = mark.end - mark.start;
  if (rawSeconds <= 0.5) {
    die(`Beat "${beat.id}" recorded only ${rawSeconds.toFixed(2)}s — re-record.`);
  }

  // setpts scales presentation timestamps: below 1 speeds the span up, above
  // 1 slows it down. Either way the beat lands on its target length.
  const factor = beat.targetSeconds / rawSeconds;
  const part = `${WORK}/${beat.id}.mp4`;

  ffmpeg([
    "-y",
    "-ss",
    mark.start.toFixed(3),
    "-to",
    mark.end.toFixed(3),
    "-i",
    recording.rawPath,
    "-an",
    "-filter:v",
    [
      `setpts=${factor.toFixed(6)}*PTS`,
      `scale=${storyboard.width}:${storyboard.height}:force_original_aspect_ratio=decrease`,
      `pad=${storyboard.width}:${storyboard.height}:-1:-1:color=black`,
      "fps=30",
    ].join(","),
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    part,
  ]);

  parts.push(part);
  planned += beat.targetSeconds;
  const speed = rawSeconds / beat.targetSeconds;
  console.log(
    `  ${beat.id.padEnd(9)} ${rawSeconds.toFixed(1)}s → ${beat.targetSeconds}s ` +
      `(${speed >= 1 ? `${speed.toFixed(2)}× faster` : `${(1 / speed).toFixed(2)}× slower`})`,
  );
}

if (planned >= CEILING_SECONDS) {
  die(
    `The storyboard adds up to ${planned}s, which is not under the ${CEILING_SECONDS}s the rules require. Shorten a beat in ${BEATS}.`,
  );
}

const listPath = `${WORK}/parts.txt`;
writeFileSync(
  listPath,
  `${parts.map((part) => `file '${resolve(part).replace(/'/g, "'\\''")}'`).join("\n")}\n`,
);

const joined = `${WORK}/joined.mp4`;
ffmpeg(["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", joined]);

let burned = false;
if (burnCaptions && existsSync(CAPTIONS)) {
  // A judge may well watch this muted, so the words should be on the picture
  // rather than in a sidecar nobody loads. libass is not everywhere, so a
  // failure here is a downgrade, not an error.
  burned = ffmpeg(
    [
      "-y",
      "-i",
      joined,
      "-vf",
      `subtitles=${CAPTIONS}:force_style='FontName=Arial,FontSize=19,PrimaryColour=&H00FFFFFF&,OutlineColour=&H90000000&,BorderStyle=3,Outline=1,Shadow=0,MarginV=54'`,
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      OUTPUT,
    ],
    { allowFailure: true },
  );
  if (!burned) {
    console.warn(
      "  captions could not be burned in (no libass?) — shipping clean footage",
    );
  }
}

if (!burned) {
  ffmpeg(["-y", "-i", joined, "-c", "copy", OUTPUT]);
}

const probe = spawnSync(
  "ffprobe",
  [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    OUTPUT,
  ],
  { encoding: "utf8" },
);
const seconds = Number.parseFloat(probe.stdout ?? "0");

console.log(`\n  ${OUTPUT}`);
console.log(
  `  ${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")} · ` +
    `${storyboard.width}×${storyboard.height} · captions ${burned ? "burned in" : "sidecar only"}`,
);

if (seconds >= CEILING_SECONDS) {
  die(
    `The finished film is ${seconds.toFixed(1)}s. The rules require under ${CEILING_SECONDS}s.`,
  );
}
console.log(`  Under the three-minute limit by ${(CEILING_SECONDS - seconds).toFixed(0)}s.\n`);
