export default function
calculateTopOils(
  salesDocs,
  range
) {

  const oilMap = {};

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

      const oilQty =
        (item.oilQtyML || 0)
        * (item.qty || 1);

      oilMap[oilName] =
        (oilMap[oilName] || 0)
        + oilQty;

    });

  });

  return Object.entries(oilMap)

    .map(([name, total]) => ({
      name,
      total
    }))

    .sort((a, b) =>
      b.total - a.total
    )

    .slice(0, 5);

}