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

  onSubmit,

  loading,
}) {
  const { t } = useTranslate();

  return (
    <AppCard
      padding="lg"
      style={{
        marginBottom: 20,
      }}
    >
      <h3
        style={{
          marginBottom: 18,
        }}
      >
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
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          {expenseCategories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </AppSelect>

        <AppInput
          type="number"
          inputMode="decimal"
          value={amount}
          placeholder={t("expenses.amount")}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        {category === "➕ تصنيف جديد" && (
          <AppInput
            value={customCategory}
            placeholder={t("expenses.newCategory")}
            onChange={(e) =>
              setCustomCategory(e.target.value)
            }
          />
        )}

        <AppInput
          value={note}
          placeholder={t("expenses.note")}
          onChange={(e) =>
            setNote(e.target.value)
          }
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