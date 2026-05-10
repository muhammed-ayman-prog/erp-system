export default function
calculateProfitableOils(
  salesDocs,
  range
) {

  const oilProfitMap = {};

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

      const oilName =
        item.oilName ||
        item.name ||
        "Unknown";

      const oilProfit =
        item.profit || 0;

      oilProfitMap[oilName] =
        (oilProfitMap[oilName] || 0)
        + oilProfit;

    });

  });

  return Object.entries(oilProfitMap)

    .map(([name, total]) => ({
      name,
      total
    }))

    .sort((a, b) =>
      b.total - a.total
    )

    .slice(0, 5);

}