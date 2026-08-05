export function formatMoney(num) {
  return new Intl.NumberFormat("en-US").format(
    num || 0
  );
}

export function sortItems(
  items,
  tableSort
) {
  return [...items].sort((a, b) => {
    let aValue;
    let bValue;

    switch (tableSort.key) {
      case "amount":
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;

      case "category":
        aValue = a.category || "";
        bValue = b.category || "";
        break;

      case "employee":
        aValue = a.employeeName || "";
        bValue = b.employeeName || "";
        break;

      default:
        aValue = a.createdAt?.seconds || 0;
        bValue = b.createdAt?.seconds || 0;
    }

    if (typeof aValue === "string") {
      return tableSort.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return tableSort.direction === "asc"
      ? aValue - bValue
      : bValue - aValue;
  });
}

export function calculateCategoryTotals(
  expenses
) {
  const totals = {};

  expenses.forEach((expense) => {
    const category =
      expense.category || "عام";

    totals[category] =
      (totals[category] || 0) +
      (expense.amount || 0);
  });

  return totals;
}

export function getTopCategory(
  categoryTotals
) {
  if (
    !Object.keys(categoryTotals).length
  ) {
    return "—";
  }

  return Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0][0];
}

export function getEmployeeNames(
  loans,
  bonuses
) {
  return [
    ...new Set([
      ...loans.map(
        (loan) => loan.employeeName
      ),
      ...bonuses.map(
        (bonus) => bonus.employeeName
      ),
    ]),
  ].filter(Boolean);
}