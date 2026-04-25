const fs = require("fs");
const path = require("path");

const exts = [".js", ".jsx", ".ts", ".tsx"];

const replacements = [
  // Cart
  [/t\("cart"\)/g, 't("cart.title")'],
  [/t\("cartEmpty"\)/g, 't("cart.empty")'],

  // Customer
  [/t\("customerName"\)/g, 't("customer.name")'],
  [/t\("phone"\)/g, 't("customer.phone")'],
  [/t\("customerInfo"\)/g, 't("customer.info")'],

  // Totals
  [/t\("subtotal"\)/g, 't("cart.subtotal")'],
  [/t\("discount"\)/g, 't("cart.discount")'],
  [/t\("total"\)/g, 't("cart.total")'],

  // Payment
  [/t\("paymentMethod"\)/g, 't("payment.method")'],
  [/t\("cash"\)/g, 't("payment.cash")'],
  [/t\("visa"\)/g, 't("payment.visa")'],
  [/t\("instapay"\)/g, 't("payment.instapay")'],

  // Buttons
  [/t\("checkout"\)/g, 't("cart.checkout")'],
  [/t\("processing"\)/g, 't("common.processing")'],
  [/t\("clearCart"\)/g, 't("cart.clear")'],
  [/t\("Clear Cart"\)/g, 't("cart.clear")'],

  // Navigation
  [/t\("sales"\)/g, 't("navigation.sales")'],
  [/t\("expenses"\)/g, 't("navigation.expenses")'],
  [/t\("waste"\)/g, 't("navigation.waste")'],
  [/t\("inventory"\)/g, 't("navigation.inventory")'],
  [/t\("reports"\)/g, 't("navigation.reports")'],
  [/t\("customers"\)/g, 't("navigation.customers")'],
  [/t\("branches"\)/g, 't("navigation.branches")'],
  [/t\("users"\)/g, 't("navigation.users")'],
  [/t\("settings"\)/g, 't("navigation.settings")'],

  // Products
  [/t\("products"\)/g, 't("products.title")'],
  [/t\("categories"\)/g, 't("products.categories")'],
  [/t\("searchProduct"\)/g, 't("products.search")'],
  [/t\("outOfStock"\)/g, 't("products.outOfStock")'],
  [/t\("inStock"\)/g, 't("products.inStock")'],
  [/t\("lowStock"\)/g, 't("products.lowStock")'],
  [/t\("french"\)/g, 't("products.french")'],
  [/t\("oriental"\)/g, 't("products.oriental")'],
  [/t\("body"\)/g, 't("products.body")'],
  [/t\("original"\)/g, 't("products.original")'],
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  let original = content;

  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("✔ Updated:", filePath);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file === "node_modules" || file === ".git") return;
      walk(fullPath);
    } else {
      if (exts.includes(path.extname(file))) {
        processFile(fullPath);
      }
    }
  });
}

// 🔥 شغل من هنا
const srcPath = path.join(__dirname, "src"); // غيرها لو مختلف
walk(srcPath);

console.log("\n🎯 Done! All keys updated.");