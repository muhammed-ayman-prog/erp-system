export default function
calculateTopProducts(
  salesDocs,
  range
) {

  const productMap = {};

  salesDocs.forEach(doc => {

    const d = doc.data();

    const date = new Date(
      d.createdAt?.seconds * 1000 ||
      Date.now()
    );

    const day =
      date.toLocaleDateString(
        "en-CA"
      );

    if (
      range.from &&
      day < range.from
    ) return;

    if (
      range.to &&
      day > range.to
    ) return;

    if (!d.items) return;

    d.items.forEach(item => {

      const name =
        item.name || "Unknown";

      const itemProfit =
        item.profit || 0;

      productMap[name] =
        (productMap[name] || 0)
        + itemProfit;

    });

  });

  return Object.entries(productMap)

    .map(([name, total]) => ({
      name,
      total
    }))

    .sort((a, b) =>
      b.total - a.total
    )

    .slice(0, 5);

}