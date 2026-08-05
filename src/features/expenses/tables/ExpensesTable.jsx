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
  const { t } = useTranslate();

  const sortIcon = (key) => {
    if (tableSort.key !== key) return "";

    return tableSort.direction === "asc"
      ? " ▲"
      : " ▼";
  };

  const columns = [
    {
      key: "amount",
      title:
        t("expenses.amount") +
        sortIcon("amount"),
      onClick: () =>
        handleTableSort("amount"),
    },

    {
      key: "category",
      title:
        t("expenses.category") +
        sortIcon("category"),
      onClick: () =>
        handleTableSort("category"),
    },

    {
      key: "note",
      title: t("expenses.note"),
    },

    {
      key: "date",
      title:
        t("common.date") +
        sortIcon("date"),
      onClick: () =>
        handleTableSort("date"),
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
                  color:
                    theme.colors.textSecondary,
                  whiteSpace: "nowrap",
                }}
              >
                <CalendarDays size={15} />

                {new Date(
                  row.createdAt?.seconds
                    ? row.createdAt.seconds *
                        1000
                    : row.createdAt
                ).toLocaleString()}
              </div>
            );

          case "actions":
            return (
              <AppButton
                size="sm"
                variant="secondary"
                title={t("common.edit")}
                leftIcon={
                  <Pencil size={15} />
                }
                onClick={(e) => {
                  e.stopPropagation();

                  setEditingExpense(row);

                  setCustomCategory("");

                  setEditAmount(
                    row.amount || ""
                  );

                  setEditNote(
                    row.note || ""
                  );

                  setEditCategory(
                    row.category || ""
                  );
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