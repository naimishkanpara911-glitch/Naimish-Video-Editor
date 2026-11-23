import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const root = fileURLToPath(new URL("../", import.meta.url));
const files = {};
async function addDirectory(name) {
  for (const file of await readdir(join(root, name), { withFileTypes: true })) {
    const relative = name + "/" + file.name;
    if (file.isDirectory()) await addDirectory(relative);
    else await addFile(relative);
  }
}
async function addFile(relative) {
  try {
    const bytes = await readFile(join(root, relative));
    files[relative] = [bytes, { level: /\.(mp4|webp|pdf)$/i.test(relative) ? 0 : 6 }];
  } catch (err) {
    if (err?.code !== "ENOENT") throw err;
  }
}
for (const dir of ["portfolio", "src", "public", "scripts", "upstream", "licenses"]) await addDirectory(dir);
for (const file of ["index.html", "package.json", "package-lock.json", "vite.config.mjs", "README.md", ".gitignore"]) await addFile(file);
const output = join(root, "dist/downloads");
await mkdir(output, { recursive: true });
await writeFile(join(output, "Naimish_Kanpata_Portfolio.zip"), zipSync(files));
console.log("Exported editable portfolio project.");
