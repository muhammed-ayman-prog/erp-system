export default function
calculateFastMoving(
  salesDocs
) {

  const soldMap = {};

  salesDocs.forEach(doc => {

    const d =
      doc.data();

    if (!d.items) return;

    d.items.forEach(item => {

      const name =
        item.name ||
        "Unknown";

      // ✅ Count orders
      soldMap[name] =
        (
          soldMap[name] || 0
        ) + 1;

    });

  });

  return Object.entries(
    soldMap
  )

    .map(([name, qty]) => ({
      name,
      qty
    }))

    .sort(
      (a, b) =>
        b.qty - a.qty
    )

    .slice(0, 10);

}