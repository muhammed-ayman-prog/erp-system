const { HttpsError } = require("firebase-functions/v2/https");

function validateBranch(branchId) {
  if (!branchId) {
    throw new HttpsError(
      "invalid-argument",
      "Branch is required"
    );
  }
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "Items are required"
    );
  }

  const ids = new Set();

  for (const item of items) {

    if (!item.productId) {
      throw new HttpsError(
        "invalid-argument",
        "Product is required"
      );
    }

    if (
      !item.quantity ||
      Number(item.quantity) <= 0
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid quantity"
      );
    }

    if (ids.has(item.productId)) {
      throw new HttpsError(
        "invalid-argument",
        "Duplicate product"
      );
    }

    ids.add(item.productId);
  }
}

module.exports = {
  validateBranch,
  validateItems
};