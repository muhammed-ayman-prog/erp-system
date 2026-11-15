
import AppFormDialog from "../../../components/ui/AppFormDialog";
import AppInput from "../../../components/ui/AppInput";
import AppSelect from "../../../components/ui/AppSelect";
import { useTranslate } from "../../../useTranslate";

export default function EditExpenseDialog({
  open,
  onClose,
  amount,
  setAmount,
  note,
  setNote,
  category,
  setCategory,
  customCategory,
  setCustomCategory,
  categories,
  businessDate,
  setBusinessDate,
  loading,
  onSubmit,
}) {
  const { t } = useTranslate();

  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <AppFormDialog
      open={open}
      onClose={onClose}
      title={t("expenses.editExpense")}
      onSubmit={onSubmit}
      loading={loading}
    >
      <AppInput
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={t("expenses.amount")}
      />

      <div style={{ height: 12 }} />

      <AppSelect
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </AppSelect>

      {category === "➕ تصنيف جديد" && (
        <>
          <div style={{ height: 12 }} />
          <AppInput
            value={customCategory}
            placeholder={t("expenses.newCategory")}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        </>
      )}

      <div style={{ height: 12 }} />

      <div>
        <label style={dateLabelStyle}>تاريخ العملية</label>
        <AppInput
          type="date"
          value={businessDate || ""}
          max={todayDate}
          onChange={(e) => {
            const value = e.target.value;
            if (value && value <= todayDate) {
              setBusinessDate(value);
            }
          }}
        />
      </div>

      <div style={{ height: 12 }} />

      <AppInput
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("expenses.note")}
      />
    </AppFormDialog>
  );
}

const dateLabelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#64748b",
  marginBottom: 7,
};
