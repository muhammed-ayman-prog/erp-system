export default function
calculateDeadStock(
  productsDocs,
  inventoryDocs,
  salesDocs
) {

  const soldMap = {};

  // 🧾 آخر بيع لكل منتج
  salesDocs.forEach(doc => {

    const d = doc.data();

    if (!d.items) return;

    const createdAt =
      d.createdAt?.seconds
        ? d.createdAt.seconds * 1000
        : Date.now();

    d.items.forEach(item => {

      const id =
        item.productId;

      if (!id) return;

      if (
        !soldMap[id] ||
        createdAt >
        soldMap[id]
      ) {

        soldMap[id] =
          createdAt;

      }

    });

  });

  const deadStock = [];

  productsDocs.forEach(doc => {

    const product =
      doc.data();

    const productId =
      doc.id;

    // 📦 إجمالي الكمية
    const totalQty =
      inventoryDocs
        .filter(inv =>
          inv.data().productId ===
          productId
        )

        .reduce(
          (sum, inv) =>
            sum +
            (
              inv.data().quantity || 0
            ),

          0
        );

    // مفيش stock
    if (totalQty <= 0) return;

    const lastSale =
      soldMap[productId];

    // عمره ما اتباع
    if (!lastSale) {

      deadStock.push({
        name: product.name,
        days: "Never",
        qty: totalQty
      });

      return;

    }

    const daysSinceSale =
      Math.floor(
        (
          Date.now()
          - lastSale
        ) /
        (
          1000 * 60 * 60 * 24
        )
      );

    // 🔥 أكثر من 14 يوم
    if (daysSinceSale >= 14) {

      deadStock.push({
        name: product.name,
        days: daysSinceSale,
        qty: totalQty
      });

    }

  });

  return deadStock

    .sort((a, b) => {

      if (a.days === "Never")
        return -1;

      if (b.days === "Never")
        return 1;

      return b.days - a.days;

    })

    .slice(0, 10);

}