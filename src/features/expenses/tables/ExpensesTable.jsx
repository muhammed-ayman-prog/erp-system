import {
  Pencil,
  CalendarDays,
  Tag,
  Wallet,
} from "lucide-react";

import AppBadge from "../../../components/ui/AppBadge";
import AppButton from "../../../components/ui/AppButton";
import AppTable from "../../../components/ui/AppTable";
import { theme } from "../../../theme";
import { useTranslate } from "../../../useTranslate";

const getOperationDate = (row, lang) => {
  const locale = lang === "ar" ? "ar-EG" : "en-GB";

  if (
    typeof row.businessDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(row.businessDate)
  ) {
    const [year, month, day] = row.businessDate.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  const value = row.createdAt;

  const date = value?.toDate
    ? value.toDate()
    : value?.seconds
      ? new Date(value.seconds * 1000)
      : value
        ? new Date(value)
        : null;

  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleString(locale)
    : "-";
};

export default function ExpensesTable({
  tableSort,
  handleTableSort,
  filteredExpenses,
  sortItems,
  formatMoney,

  setEditingExpense,
  setEditAmount,
  setEditNote,
  setEditCategory,
  setCustomCategory,
}) {
  const { t, lang } = useTranslate();

  const sortIcon = (key) => {
    if (tableSort.key !== key) return "";

    return tableSort.direction === "asc" ? " ▲" : " ▼";
  };

  const columns = [
    {
      key: "amount",
      title: t("expenses.amount") + sortIcon("amount"),
      onClick: () => handleTableSort("amount"),
    },
    {
      key: "category",
      title: t("expenses.category") + sortIcon("category"),
      onClick: () => handleTableSort("category"),
    },
    {
      key: "note",
      title: t("expenses.note"),
    },
    {
      key: "date",
      title: t("common.date") + sortIcon("date"),
      onClick: () => handleTableSort("date"),
    },
    {
      key: "actions",
      title: t("common.actions"),
      align: "center",
      width: 70,
    },
  ];

  return (
    <AppTable
      stickyHeader
      hover
      striped
      columns={columns}
      rows={sortItems(filteredExpenses)}
      emptyText={t("expenses.noExpenses")}
      renderCell={(row, col) => {
        switch (col.key) {
          case "amount":
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700,
                  color: theme.colors.danger,
                  whiteSpace: "nowrap",
                }}
              >
                <Wallet size={16} />
                {formatMoney(row.amount)} EGP
              </div>
            );

          case "category":
            return (
              <AppBadge
                size="sm"
                color="primary"
                icon={<Tag size={12} />}
              >
                {row.category || "-"}
              </AppBadge>
            );

          case "note":
            return (
              <span
                style={{
                  color: row.note
                    ? theme.colors.text
                    : theme.colors.textSecondary,
                }}
              >
                {row.note || "-"}
              </span>
            );

          case "date":
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: theme.colors.textSecondary,
                  whiteSpace: "nowrap",
                }}
              >
                <CalendarDays size={15} />
                {getOperationDate(row, lang)}
              </div>
            );

          case "actions":
            return (
              <AppButton
                size="sm"
                variant="secondary"
                title={t("common.edit")}
                leftIcon={<Pencil size={15} />}
                onClick={(e) => {
                  e.stopPropagation();

                  setEditingExpense(row);
                  setCustomCategory("");
                  setEditAmount(row.amount || "");
                  setEditNote(row.note || "");
                  setEditCategory(row.category || "");
                }}
              />
            );

          default:
            return row[col.key];
        }
      }}
    />
  );
}