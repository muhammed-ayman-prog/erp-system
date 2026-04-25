const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const translationsPath = path.join(__dirname, "src/i18n.js");

let translations = require(translationsPath).translations;

function toKey(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");
}

function addKey(key, value) {
  if (!translations.en.common[key]) {
    translations.en.common[key] = value;
    translations.ar.common[key] = value; // مؤقت لحد ما تترجم
  }
}

function processFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"]
  });

  traverse(ast, {
    JSXText(path) {
      const text = path.node.value.trim();

      if (!text || text.length < 2) return;

      const key = toKey(text);
      addKey(key, text);

      path.replaceWith(
        t.jsxExpressionContainer(
          t.callExpression(t.identifier("t"), [t.stringLiteral(key)])
        )
      );
    }
  });

  const output = generate(ast, {}, code);
  fs.writeFileSync(filePath, output.code);
  console.log("🔥 Updated:", filePath);
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

walk(path.join(__dirname, "src"));

// حفظ الترجمة
fs.writeFileSync(
  translationsPath,
  "export const translations = " + JSON.stringify(translations, null, 2)
);

console.log("🚀 DONE SMART I18N");