import AppFormDialog from "../../../components/ui/AppFormDialog";
import AppInput from "../../../components/ui/AppInput";
import AppSelect from "../../../components/ui/AppSelect";
import { useTranslate } from "../../../useTranslate";

export default function EditLoanDialog({
  open,
  onClose,

  employee,
  setEmployee,

  employees,

  amount,
  setAmount,

  note,
  setNote,

  loading,

  onSubmit,
}) {
  const { t } = useTranslate();

  return (
    <AppFormDialog
      open={open}
      onClose={onClose}
      title={t("expenses.editBonus")}
      onSubmit={onSubmit}
      loading={loading}
    >
      <AppSelect
        value={employee?.id || ""}
        onChange={(e) => {
          const selected = employees.find(
            (item) => item.id === e.target.value
          );

          setEmployee(selected || null);
        }}
      >
        <option value="">
          {t("expenses.selectEmployee")}
        </option>

        {employees.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name}
          </option>
        ))}
      </AppSelect>

      <div style={{ height: 12 }} />

      <AppInput
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={t("expenses.amount")}
      />

      <div style={{ height: 12 }} />

      <AppInput
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("expenses.note")}
      />
    </AppFormDialog>
  );
}