import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const SOURCE_NAME = "entry.png";

function fail(message: string): never {
  console.error("main.ts: " + message);
  process.exit(1);
}

function pickOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  try {
    fs.accessSync("/output", fs.constants.W_OK);
    return "/output";
  } catch {
    return path.join(process.cwd(), "out");
  }
}

const here = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(here, SOURCE_NAME);

let bytes: Buffer;
try {
  bytes = fs.readFileSync(sourcePath);
} catch {
  fail("cannot read rendered image next to main.ts: " + sourcePath);
}

if (bytes.length < 4) {
  fail("image too small: " + bytes.length + " bytes in " + sourcePath);
}
if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
  fail("not a JPEG: missing SOI marker (FF D8) in " + sourcePath);
}
if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
  fail("not a JPEG: missing EOI marker (FF D9) in " + sourcePath);
}
if (bytes.length > MAX_BYTES) {
  fail(
    "rendered image is " +
      bytes.length +
      " bytes, over the 1 MiB limit (" +
      MAX_BYTES +
      " bytes)",
  );
}

const outputDir = pickOutputDir();
try {
  fs.mkdirSync(outputDir, { recursive: true });
} catch {
  fail("cannot create output directory: " + outputDir);
}

const targetPath = path.join(outputDir, SOURCE_NAME);
try {
  fs.writeFileSync(targetPath, bytes);
} catch {
  fail("cannot write output image: " + targetPath);
}

console.log("wrote " + targetPath + " (" + bytes.length + " bytes)");
