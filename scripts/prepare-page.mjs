import { createHash } from "node:crypto";
import { readFile, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const at = (...parts) => resolve(root, ...parts);
const text = name => readFile(at(name), "utf8");

// Check every registered text and binary file against ThreeUI's pinned revision.
const sums = (await text("upstream/SHA256SUMS")).trim().split("\n");
for (const line of sums) {
  const [expected, relative] = line.split(/\s{2,}/);
  const file = relative.startsWith("src/") || relative.endsWith("/kage.html")
    ? at("upstream", relative) : at(relative);
  const actual = createHash("sha256").update(await readFile(file)).digest("hex");
  if (actual !== expected) throw new Error("Source checksum mismatch in " + relative);
}

const original = await text("upstream/public/landing-pages/kage.html");
const media = JSON.parse(await text("portfolio/media.json"));
if (media.videos.length !== 4 || new Set(media.videos.map(v => v.driveId)).size !== 4) {
  throw new Error("Choose four distinct video samples in portfolio/media.json.");
}
const html = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const driveUrl = id => "https://drive.google.com/file/d/" + encodeURIComponent(id) + "/view";
for (const video of media.videos) {
  for (const name of [video.file, video.poster, video.videoPoster]) {
    if (!/^\/media\/[\w.-]+$/.test(name)) throw new Error("Invalid media path: " + name);
    await access(at("public", name.slice(1)));
  }
}
const featured = media.videos.find(video => video.driveId === media.featuredVideoId);
if (!featured) throw new Error("The featured video must be one of the four samples.");

function playerLink(video, feature) {
  const attr = feature ? "data-featured-video" : "data-video";
  return attr + '="' + html(video.driveId) + '" data-file="' + html(video.file) +
    '" data-poster="' + html(video.videoPoster) + '" data-title="' + html(video.title) +
    '" href="' + html(driveUrl(video.driveId)) + '" target="_blank" rel="noopener noreferrer" data-cursor aria-label="Play ' + html(video.title) + '"';
}
const play = '<span class="play-icon" aria-hidden="true"></span>';
const clips = media.videos.map(video => {
  return '<a class="work-card" ' + playerLink(video, false) + '>' +
    '<span class="work-poster"><img loading="lazy" width="960" height="540" alt="" src="' + html(video.poster) + '">' + play + '</span>' +
    '<span class="work-info"><small>' + html(video.category) + '</small><strong>' + html(video.title) +
    '</strong><time>' + html(video.length) + '</time></span></a>';
}).join("\n");
let portrait;
if (media.portrait) {
  if (!/^\/media\/[\w.-]+$/.test(media.portrait)) throw new Error("Invalid portrait path");
  await access(at("public", media.portrait.slice(1)));
  portrait = '<figure class="peek portfolio-peek hero-portrait"><img src="' + html(media.portrait) + '" alt="Naimish Kanpara"></figure>';
} else {
  portrait = '<a class="peek portfolio-peek" ' + playerLink(featured, true) + '><span class="feature-image"><img width="480" height="270" src="' +
    html(featured.poster) + '" alt="">' + play + '</span><span class="feature-caption"><small>Featured edit</small><span>' +
    html(featured.title) + '</span></span></a>';
}
let body = (await text("portfolio/page.html")).replace("{{PORTRAIT}}", portrait)
  .replace("{{WORK}}", clips).replace("{{DRIVE}}", html(media.driveFolder));
for (const name of ["gate", "pathways", "lessons", "eternity", "foot"]) {
  const start = original.indexOf('<div class="fg" data-fg="' + name + '"');
  const end = original.indexOf("</div>", start);
  if (start < 0 || end < 0) throw new Error("Missing original foreground: " + name);
  body = body.replace("{{FG_" + name.toUpperCase() + "}}", original.slice(start, end + 6));
}
if (/\{\{\w+\}\}/.test(body)) throw new Error("Unfilled portfolio placeholder");

const firstBody = original.match(/<body\b[^>]*>/);
const firstScript = original.indexOf('<script src="secret-pathways-assets/three.min.js">');
if (!firstBody || firstScript < 0) throw new Error("The pinned HTML frame is incomplete");
const head = original.slice(0, firstBody.index + firstBody[0].length)
  .replace(/<title>.*?<\/title>/, "<title>Naimish Kanpara — Video Editor</title>")
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Video and reel editing portfolio of Naimish Kanpara in Surat.">')
  .replace(/<link rel="icon"[^>]*>/, '<link rel="icon" href="/mark.svg">')
  .replace("</head>", '<link rel="stylesheet" href="portfolio.css">\n</head>')
  .replace("<body ", '<body class="portfolio" ');
const scripts = original.slice(firstScript)
  .replace("['The Hidden Gate', 'The Sanmon', 'Still Gardens', 'Sacred Craft', 'Afterlight', 'Colophon']", "['Home', 'Profile', 'Work', 'Skills', 'Contact', 'Footer']")
  .replace("const word = 'KAGE'", "const word = 'EDITOR'")
  .replace("function fallback(err) {", "function fallback(err) {\n  measure();\n  addEventListener('resize', measure, { passive: true });")
  .replace("</body>", '<script type="module" src="portfolio-player.js"></script>\n</body>');
await writeFile(at("public/landing-pages/kage.html"), head + "\n" + body + "\n" + scripts);
await writeFile(at("public/landing-pages/kage-original.html"), original);
console.log("Verified " + sums.length + " registered files and prepared four portfolio videos.");
