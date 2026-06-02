export default function calculateDeadStock(
  salesDocs,
  inventoryDocs,
  productsDocs,
  selectedBranch = null
) {

  const DEAD_DAYS = 30;

  const inventoryMap = {};
  const productMeta = {};
  const lastSaleMap = {};

  // =========================
  // Products Meta
  // =========================

  productsDocs.forEach(doc => {

    productMeta[doc.id] =
      doc.data();

  });

  // =========================
  // Inventory
  // =========================

  inventoryDocs.forEach(doc => {

    const item = doc.data();

    // ✅ Branch filter
    if (
      selectedBranch &&
      item.branchId !== selectedBranch
    ) {
      return;
    }

    inventoryMap[item.productId] =

      (
        inventoryMap[item.productId] || 0
      ) + (item.quantity || 0);

  });

  // =========================
  // Last Sale Tracking
  // =========================

  salesDocs.forEach(doc => {

    const sale = doc.data();

    // ✅ Branch filter
    if (
      selectedBranch &&
      sale.branchId !== selectedBranch
    ) {
      return;
    }

    const saleDate =

      sale.createdAt?.toDate?.() ||

      new Date(sale.createdAt);

    if (!sale.items) return;

    sale.items.forEach(item => {

      const productId =
        item.productId;

      if (!productId) return;

      const currentLastSale =
        lastSaleMap[productId];

      if (
        !currentLastSale ||
        saleDate > currentLastSale
      ) {

        lastSaleMap[productId] =
          saleDate;

      }

    });

  });

  // =========================
  // Build Dead Stock
  // =========================

  const deadStock = [];

  Object.entries(
    inventoryMap
  ).forEach(([productId, qty]) => {

    // ✅ Ignore zero stock
    if (qty <= 0) return;

    const meta =
      productMeta[productId] || {};

    // ✅ Ignore archived
    if (meta.isArchived) {
      return;
    }

    const lastSale =
      lastSaleMap[productId];

    // ✅ Never sold
    if (!lastSale) {

      deadStock.push({

        name:
          meta.name ||
          productId,

        qty,

        days: "Never"

      });

      return;
    }

    const diffDays = Math.floor(

      (
        Date.now() -
        lastSale.getTime()
      )

      /

      (
        1000 * 60 * 60 * 24
      )

    );

    // ✅ Skip active products
    if (diffDays < DEAD_DAYS) {
      return;
    }

    deadStock.push({

      name:
        meta.name ||
        productId,

      qty,

      days: diffDays

    });

  });

  // =========================
  // Sort
  // =========================

  deadStock.sort((a, b) => {

    // Never sold first
    if (a.days === "Never") {
      return -1;
    }

    if (b.days === "Never") {
      return 1;
    }

    return b.days - a.days;

  });

  return deadStock.slice(0, 20);

}