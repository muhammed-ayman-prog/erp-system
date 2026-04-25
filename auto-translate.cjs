const fs = require("fs");
const path = require("path");

const exts = [".js", ".jsx", ".ts", ".tsx"];

const ignore = [
  "className",
  "style",
  "http",
  "px",
  "flex",
  "center"
];

function isText(str) {
  if (!str) return false;
  if (str.length < 2) return false;
  if (/^\d+$/.test(str)) return false;
  if (ignore.some(i => str.includes(i))) return false;
  return /^[A-Za-z ]+$/.test(str);
}

function toKey(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let original = content;

  // يلقط النصوص داخل ""
  content = content.replace(/"([^"]+)"/g, (match, p1) => {
    if (isText(p1)) {
      return `{t("${toKey(p1)}")}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("🔥 Translated:", filePath);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (["node_modules", ".git"].includes(file)) return;
      walk(fullPath);
    } else {
      if (exts.includes(path.extname(file))) {
        processFile(fullPath);
      }
    }
  });
}

walk(path.join(__dirname, "src"));

console.log("🚀 Done auto translate!");