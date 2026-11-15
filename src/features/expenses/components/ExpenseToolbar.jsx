
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

  // تجهيز قائمة التصنيفات
  const categories = [
    ...new Set([
      "إيجار",
      "مرتبات",
      "مواصلات",
      "فواتير",
      ...(Array.isArray(filterCategories)
        ? filterCategories
        : []),
      ...(selectedCategory !== "all" && selectedCategory
        ? [selectedCategory]
        : []),
    ]),
  ].filter(
    (category) =>
      typeof category === "string" &&
      category.trim() !== "" &&
      category !== "➕ تصنيف جديد"
  );

  // ضمان ظهور اسم كل التصنيفات
  const translatedLabel = t(
    "expenses.filters.allCategories"
  );

  const allCategoriesLabel =
    translatedLabel &&
    translatedLabel !== "expenses.filters.allCategories"
      ? translatedLabel
      : "كل التصنيفات";

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
          onChange={(e) => setFromDate(e.target.value)}
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
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      {/* Search */}
<div
  style={{
    width: "100%",
    minWidth: 0,
  }}
>
  <AppInput
    value={search}
    startIcon={<Search size={18} />}
    placeholder={t("common.search")}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    style={{
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
    }}
  />
</div>

      {/* Category / Employee */}
      {tab === "expenses" ? (
        <AppSelect
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value)
          }
        >
          <option value="all">
            {allCategoriesLabel}
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </AppSelect>
      ) : (
        <AppSelect
          value={selectedEmployee}
          onChange={(e) =>
            setSelectedEmployee(e.target.value)
          }
        >
          <option value="all">
            {t("expenses.filters.allEmployees")}
          </option>

          {employeeNames.map((employee) => (
            <option
              key={employee}
              value={employee}
            >
              {employee}
            </option>
          ))}
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
