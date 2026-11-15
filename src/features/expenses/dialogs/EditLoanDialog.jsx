
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
      title={t("expenses.editLoan")}
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
          <option key={item.id} value={item.id}>
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
