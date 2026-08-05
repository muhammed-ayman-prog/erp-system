import { Download, Search } from "lucide-react";

import AppButton from "../../../components/ui/AppButton";
import AppFilterBar from "../../../components/ui/AppFilterBar";
import AppInput from "../../../components/ui/AppInput";
import AppSelect from "../../../components/ui/AppSelect";
import { useTranslate } from "../../../useTranslate";

export default function ExpenseToolbar({
  tab,

  fromDate,
  toDate,
  setFromDate,
  setToDate,

  search,
  setSearch,

  selectedCategory,
  setSelectedCategory,

  selectedEmployee,
  setSelectedEmployee,

  filterCategories,
  employeeNames,

  onExport,
}) {
  const { t } = useTranslate();

  return (
    <AppFilterBar>
      {/* From Date */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {t("common.from")}
        </label>

        <AppInput
          type="date"
          value={fromDate}
          onChange={(e) =>
            setFromDate(e.target.value)
          }
        />
      </div>

      {/* To Date */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {t("common.to")}
        </label>

        <AppInput
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(e.target.value)
          }
        />
      </div>

      {/* Search */}
      <AppInput
        value={search}
        startIcon={<Search size={18} />}
        placeholder={t("common.search")}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          minWidth: 320,
        }}
      />

      {/* Category / Employee */}
      {tab === "expenses" ? (
        <AppSelect
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(
              e.target.value
            )
          }
        >
          <option value="all">
            {t(
              "expenses.filters.allCategories"
            )}
          </option>

          {filterCategories.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            )
          )}
        </AppSelect>
      ) : (
        <AppSelect
          value={selectedEmployee}
          onChange={(e) =>
            setSelectedEmployee(
              e.target.value
            )
          }
        >
          <option value="all">
            {t(
              "expenses.filters.allEmployees"
            )}
          </option>

          {employeeNames.map(
            (employee) => (
              <option
                key={employee}
                value={employee}
              >
                {employee}
              </option>
            )
          )}
        </AppSelect>
      )}

      {/* Export */}
      <AppButton
        variant="outline"
        leftIcon={<Download size={18} />}
        onClick={onExport}
      >
        {t("common.exportExcel")}
      </AppButton>
    </AppFilterBar>
  );
}