const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = __dirname;
const CONTENT_DIR   = path.join(ROOT, "content");
const PUBLIC_DIR    = path.join(ROOT, "public");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const DIST_DIR      = path.join(ROOT, "dist");

// --- helpers ---

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), "utf8");
}

function render(template, data) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const val = key.split(".").reduce((o, k) => (o == null ? o : o[k]), data);
    return val == null ? "" : String(val);
  });
}

function writeFile(relPath, content) {
  const full = path.join(DIST_DIR, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function readContentDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".md") && !f.startsWith("_"))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(raw);
      return { ...data, content, filename: f };
    });
}

function toIsoDate(d) {
  if (!d) return "";
  if (d instanceof Date) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return String(d);
}

function formatDate(d) {
  const iso = toIsoDate(d);
  if (!iso) return "";
  const [y, m, day] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[+m - 1]} ${+day}, ${y}`;
}

function yearOf(d) {
  const iso = toIsoDate(d);
  return iso ? iso.split("-")[0] : "";
}

// safe JSON for embedding inside <script> tags
function safeJson(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

// --- build ---

console.log("Cleaning dist/...");
rmrf(DIST_DIR);

console.log("Copying public/ → dist/...");
copyDir(PUBLIC_DIR, DIST_DIR);

// load content (newest first by date)
function byDateDesc(a, b) {
  return toIsoDate(b.date).localeCompare(toIsoDate(a.date));
}

const works    = readContentDir(path.join(CONTENT_DIR, "works")).sort(byDateDesc);
const thoughts = readContentDir(path.join(CONTENT_DIR, "thoughts")).sort(byDateDesc);

// derive year + prev/next for both lists
[works, thoughts].forEach(list => {
  list.forEach((item, i) => {
    item.date          = toIsoDate(item.date);
    item.year          = yearOf(item.date);
    item.dateFormatted = formatDate(item.date);
    item.prev = i < list.length - 1 ? list[i + 1].id : null;
    item.next = i > 0                ? list[i - 1].id : null;
  });
});

// --- home ---
console.log("Building home...");
const projectsForHome = works.map(w => ({
  id: w.id, title: w.title, year: w.year, cover: w.cover
}));
writeFile("index.html", render(readTemplate("home.html"), {
  projectsJson: safeJson(projectsForHome)
}));

// --- work details ---
console.log(`Building ${works.length} work pages...`);
const workTpl = readTemplate("work-detail.html");
works.forEach(w => {
const cleanedParagraphs = (w.paragraphs || []).map(p => {
  const out = {};
  if (p.model) {
    out.model = p.model;
    if (p.customCanvas) out.customCanvas = p.customCanvas;
  } else if (p.video) {
    out.video = p.video;
    if (p.poster) out.poster = p.poster;
  } else if (p.image) {
    out.image = p.image;
  }
  if (p.label && String(p.label).trim()) out.label = p.label;
  if (p.text) out.text = marked.parse(String(p.text));
  return out;
});

  writeFile(`works/${w.id}/index.html`, render(workTpl, {
    id:        w.id,
    title:     w.title,
    year:      w.year,
    prevHref:  w.prev ? `/works/${w.prev}/` : "#",
    prevClass: w.prev ? "" : "nav-link--disabled",
    nextHref:  w.next ? `/works/${w.next}/` : "#",
    nextClass: w.next ? "" : "nav-link--disabled",
    projectJson: safeJson({
      id: w.id, title: w.title, year: w.year,
      paragraphs: cleanedParagraphs
    })
  }));
});

// --- thoughts list ---
console.log("Building thoughts list...");
const thoughtsForList = thoughts.map(t => ({
  id: t.id, title: t.title, date: t.date, cover: t.cover || ""
}));
writeFile("thoughts/index.html", render(readTemplate("thoughts.html"), {
  thoughtsJson: safeJson(thoughtsForList)
}));

// --- thought details ---
console.log(`Building ${thoughts.length} thought pages...`);
const thoughtTpl = readTemplate("thought-detail.html");
thoughts.forEach(t => {
  writeFile(`thoughts/${t.id}/index.html`, render(thoughtTpl, {
    id:        t.id,
    title:     t.title,
    date:      t.dateFormatted,
    prevHref:  t.prev ? `/thoughts/${t.prev}/` : "#",
    prevClass: t.prev ? "" : "nav-link--disabled",
    nextHref:  t.next ? `/thoughts/${t.next}/` : "#",
    nextClass: t.next ? "" : "nav-link--disabled",
    body:      marked.parse(t.content)
  }));
});

// --- about ---
const aboutPath = path.join(CONTENT_DIR, "about.md");
if (fs.existsSync(aboutPath)) {
  console.log("Building about...");
  const { data, content } = matter(fs.readFileSync(aboutPath, "utf8"));
  writeFile("about/index.html", render(readTemplate("about.html"), {
    title:    data.title || "About",
    portrait: data.portrait || "",
    body:     marked.parse(content)
  }));
}

// --- data files (handy if you ever want fetch-based loading later) ---
writeFile("data/projects.json", JSON.stringify(works, null, 2));
writeFile("data/thoughts.json", JSON.stringify(thoughts, null, 2));

console.log("\nDone. Output in dist/");
console.log(`  works:    ${works.length}`);
console.log(`  thoughts: ${thoughts.length}`);