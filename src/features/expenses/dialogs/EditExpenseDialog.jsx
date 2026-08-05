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

  loading,

  onSubmit,
}) {
  const { t } = useTranslate();

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
          <option
            key={item}
            value={item}
          >
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
            onChange={(e) =>
              setCustomCategory(e.target.value)
            }
          />
        </>
      )}

      <div style={{ height: 12 }} />

      <AppInput
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("expenses.note")}
      />
    </AppFormDialog>
  );
}