#!/usr/bin/env node
// Encode frames captured through the in-app browser. These are actual product
// screens replaying saved fictional dates; this film never claims a live run.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root = '.scratch/learning-proof/capture';
const beats = JSON.parse(readFileSync(`${root}/beats.json`, 'utf8'));
assert(beats.length === 6, 'Capture all six proof beats before encoding');
mkdirSync('public/demo', { recursive: true });
const run = args => {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  assert(result.status === 0, 'ffmpeg failed');
};
const captions = [
  'One Agent. Four scheduled dates. Fictional test users, actual saved dialogue.',
  'Owner feedback: use polite Korean, keep replies brief, and leave room for silence.',
  'The request, linked reply and cumulative memory are saved privately.',
  'A new partner, a new conversation. Past dialogue is never rewritten.',
  'Both withheld reviews were corrected and verified. The original dialogue and human decisions stay unchanged.',
  'Another correction, another date. The same Agent carries earlier guidance forward.',
];
for (const [index, beat] of beats.entries()) {
  assert(/^[a-z0-9-]+$/.test(beat.name) && beat.frames > 0);
  writeFileSync(`${root}/caption-${index}.txt`, captions[index]);
  run(['-framerate', String(beat.frames / 9), '-i', `${root}/${beat.name}/%04d.jpg`, '-vf', `scale=1280:900:force_original_aspect_ratio=decrease,pad=1280:960:(ow-iw)/2:0:color=0x21171d,drawtext=textfile=${root}/caption-${index}.txt:font=Arial:fontsize=17:fontcolor=white:x=(w-tw)/2:y=925`, '-t', '9', '-r', '24', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', `${root}/part-${index}.mp4`]);
}
writeFileSync(`${root}/parts.txt`, beats.map((_beat, index) => `file 'part-${index}.mp4'`).join('\n'));
run(['-f', 'concat', '-safe', '0', '-i', `${root}/parts.txt`, '-c', 'copy', '-movflags', '+faststart', 'public/demo/learning-proof.mp4']);
console.log('Built a 54-second walkthrough of real product screens and saved learning records.');
