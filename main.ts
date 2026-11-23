// News-image entry for Monday 23 November 2026: the rendered broadsheet
// (entry.png beside this file) is copied to /output/entry.png. The file is a
// JPEG held under the name entry.png, which the competition allows: the
// image is told apart by its first bytes, not its name.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = new URL('./entry.png', import.meta.url);
const data = readFileSync(src);

// Validate the magic bytes: JPEG (FF D8 FF) or PNG (89 50 4E 47).
const isJpeg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
const isPng = data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47;
if (!isJpeg && !isPng) {
  throw new Error('entry.png is neither a JPEG nor a PNG image');
}

// The competition caps the image at 1 MiB (1048576 bytes); refuse to ship
// an oversize file rather than let the gate reject the entry.
if (data.length > 1048576) {
  throw new Error(`entry.png is ${data.length} bytes, over the 1048576-byte cap`);
}

const dest = join(outDir, 'entry.png');
copyFileSync(src, dest);
console.log(`copied entry.png (${statSync(src).size} bytes, ${isJpeg ? 'JPEG' : 'PNG'}) to ${dest}`);
