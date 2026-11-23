// news-image-20261123-entry — main.ts
// Copies the pre-rendered image (entry.png, beside this file) to the
// output directory as entry.png. Node 22, standard library only,
// no network, no dependencies. Deterministic: byte-identical output.
const fs = require("fs");
const path = require("path");

const MAX_BYTES = 1048576;

const scriptDir = __dirname;
const sourcePath = path.join(scriptDir, "entry.png");

function resolveOutputDir() {
  const raw = process.env.MAKEFUN_OUTPUT_DIR;
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim();
  }
  return "/output";
}

const outputDir = resolveOutputDir();
const outputPath = path.join(outputDir, "entry.png");

let data;
try {
  data = fs.readFileSync(sourcePath);
} catch (err) {
  console.error("error: cannot read source image: " + sourcePath + " (" + err.message + ")");
  process.exit(1);
}

if (data.length < 4) {
  console.error("error: source image is only " + data.length + " bytes, too small to be a JPEG");
  process.exit(1);
}

if (data.length > MAX_BYTES) {
  console.error("error: source image is " + data.length + " bytes, over the 1048576 byte limit");
  process.exit(1);
}

if (data[0] !== 0xff || data[1] !== 0xd8) {
  console.error("error: source image is not a valid JPEG (must start with FF D8)");
  process.exit(1);
}

if (data[data.length - 2] !== 0xff || data[data.length - 1] !== 0xd9) {
  console.error("error: source image is not a valid JPEG (must end with FF D9)");
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, data);
console.log("wrote " + outputPath + " (" + data.length + " bytes)");
