
import AppButton from "../../../components/ui/AppButton";
import AppCard from "../../../components/ui/AppCard";
import AppInput from "../../../components/ui/AppInput";
import AppSelect from "../../../components/ui/AppSelect";
import { useTranslate } from "../../../useTranslate";

export default function ExpenseForm({
  amount,
  setAmount,
  category,
  setCategory,
  expenseCategories,
  customCategory,
  setCustomCategory,
  note,
  setNote,
  businessDate,
  setBusinessDate,
  onSubmit,
  loading,
}) {
  const { t } = useTranslate();

  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <AppCard
      padding="lg"
      style={{ marginBottom: 20 }}
    >
      <h3 style={{ marginBottom: 18 }}>
        {t("expenses.addExpense")}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <AppSelect
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {expenseCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </AppSelect>

        <AppInput
          type="number"
          inputMode="decimal"
          value={amount}
          placeholder={t("expenses.amount")}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div>
          <label style={dateLabelStyle}>
            تاريخ العملية
          </label>
          <AppInput
            type="date"
            value={businessDate}
            max={todayDate}
            onChange={(e) => {
              const value = e.target.value;
              if (value && value <= todayDate) {
                setBusinessDate(value);
              }
            }}
          />
        </div>

        {category === "➕ تصنيف جديد" && (
          <AppInput
            value={customCategory}
            placeholder={t("expenses.newCategory")}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        <AppInput
          value={note}
          placeholder={t("expenses.note")}
          onChange={(e) => setNote(e.target.value)}
        />

        <AppButton
          fullWidth
          loading={loading}
          onClick={onSubmit}
        >
          {t("expenses.addExpense")}
        </AppButton>
      </div>
    </AppCard>
  );
}

const dateLabelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#64748b",
  marginBottom: 7,
};
