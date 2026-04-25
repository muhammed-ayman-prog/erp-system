const fs = require("fs");
const path = require("path");

const SRC_PATH = path.join(__dirname, "src");

function getRelativeImport(filePath) {
  const rel = path.relative(path.dirname(filePath), path.join(SRC_PATH, "useTranslate.js"));
  return rel.replace(/\\/g, "/").replace(".js", "");
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  const isMain = filePath.endsWith("main.jsx");

  // 🧹 امسح أي import قديم
  content = content.replace(/import\s+{\s*useTranslate\s*}.*?;\n?/g, "");

  // ❌ main.jsx ملوش ترجمة
  if (isMain) {
    fs.writeFileSync(filePath, content);
    console.log("🧹 Cleaned main:", filePath);
    return;
  }

  // لو الملف فيه t(
  if (content.includes("t(")) {
    const importPath = getRelativeImport(filePath);

    // ✅ ضيف import
    content = `import { useTranslate } from "${importPath}";\n` + content;

    // ✅ ضيف const t
    if (!content.includes("const t = useTranslate")) {
      content = content.replace(
        /export default function (\w+)\(/,
        (match) => `${match}\n  const t = useTranslate();`
      );
    }

    fs.writeFileSync(filePath, content);
    console.log("✅ Fixed:", filePath);
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
      if (/\.(js|jsx)$/.test(file)) {
        processFile(fullPath);
      }
    }
  });
}

walk(SRC_PATH);

console.log("🚀 DONE fixing imports!");