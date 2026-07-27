import { useMemo } from "react";
import { useTranslate } from "../../useTranslate";

const moduleLabels = {
  Users: "المستخدمين",
  Sales: "المبيعات",
  Inventory: "المخزون",
  Customers: "العملاء",
  Branches: "الفروع",
  Pricing: "التسعير",
  Expenses: "المصروفات",
  Reports: "التقارير",
  Waste: "الهالك",
  Operations: "العمليات",
  Finance: "المالية",
  Products: "المنتجات",
};

export default function LogsFilters({

  logs = [],

  search = "",
  setSearch = () => {},

  moduleFilter = "all",
  setModuleFilter = () => {},

  actionFilter = "all",
  setActionFilter = () => {},

  statusFilter = "all",
  setStatusFilter = () => {},
}) {

  const { t } = useTranslate();

  const modules = useMemo(() => {

    return [
      ...new Set(
        logs
          .map(l => l.module)
          .filter(Boolean)
      )
    ].sort();

  }, [logs]);

  const actions = useMemo(() => {

    return [
      ...new Set(
        logs
          .map(l => l.action)
          .filter(Boolean)
      )
    ].sort();

  }, [logs]);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "18px",
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "12px"
      }}
    >
      <input
        type="text"
        placeholder={t("logs.search")}
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={inputStyle}
      />

      <select
        value={moduleFilter}
        onChange={(e) =>
          setModuleFilter(e.target.value)
        }
        style={inputStyle}
      >
        <option value="all">
          {t("logs.allModules")}
        </option>

        {modules.map(module => (
          <option
            key={module}
            value={module}
          >
            {moduleLabels[module] || module}
          </option>
        ))}
      </select>

      <select
        value={actionFilter}
        onChange={(e) =>
          setActionFilter(e.target.value)
        }
        style={inputStyle}
      >
        <option value="all">
          {t("logs.allActions")}
        </option>

        {actions.map(action => (
  <option
    key={action}
    value={action}
  >
    {t(`logs.logActions.${action}`)}
  </option>
))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
        style={inputStyle}
      >
        <option value="all">
          {t("logs.allStatus")}
        </option>

        <option value="success">
          {t("logs.success")}
        </option>

        <option value="error">
          {t("logs.error")}
        </option>

        <option value="pending">
          {t("logs.pending")}
        </option>
      </select>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "14px"
};