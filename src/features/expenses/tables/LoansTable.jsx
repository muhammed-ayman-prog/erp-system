import {
  Pencil,
  CalendarDays,
  User,
  Wallet,
} from "lucide-react";

import AppBadge from "../../../components/ui/AppBadge";
import AppButton from "../../../components/ui/AppButton";
import AppTable from "../../../components/ui/AppTable";
import { theme } from "../../../theme";
import { useTranslate } from "../../../useTranslate";

export default function LoansTable({
  employeeLoans,
  sortItems,
  tableSort,
  handleTableSort,
  formatMoney,

  setEditingLoan,
  setEditEmployeeData,
  setEditAmount,
  setEditNote,
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
      key: "employee",
      title:
        t("employees.employee") +
        sortIcon("employee"),
      onClick: () =>
        handleTableSort("employee"),
    },

    {
      key: "amount",
      title:
        t("common.amount") +
        sortIcon("amount"),
      onClick: () =>
        handleTableSort("amount"),
    },

    {
      key: "note",
      title: t("common.note"),
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
      rows={sortItems(employeeLoans)}
      emptyText={t("expenses.noLoans")}
      renderCell={(row, col) => {
        switch (col.key) {
          case "employee":
            return (
              <AppBadge
                size="sm"
                color="warning"
                icon={<User size={12} />}
              >
                {row.employeeName}
              </AppBadge>
            );

          case "amount":
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700,
                  color: theme.colors.warning,
                  whiteSpace: "nowrap",
                }}
              >
                <Wallet size={16} />

                {formatMoney(row.amount)} EGP
              </div>
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

                  setEditingLoan(row);

                  setEditEmployeeData({
                    id: row.employeeId,
                    name: row.employeeName,
                  });

                  setEditAmount(
                    row.amount || ""
                  );

                  setEditNote(
                    row.note || ""
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