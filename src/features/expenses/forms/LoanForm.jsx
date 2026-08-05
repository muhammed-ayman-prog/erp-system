import AppButton from "../../../components/ui/AppButton";
import AppCard from "../../../components/ui/AppCard";
import AppInput from "../../../components/ui/AppInput";
import AppSelect from "../../../components/ui/AppSelect";
import { useTranslate } from "../../../useTranslate";

export default function LoanForm({
  branchEmployees = [],

  selectedLoanEmployee,
  setSelectedLoanEmployee,

  loanAmount,
  setLoanAmount,

  loanNote,
  setLoanNote,

  loading,

  onSubmit,
}) {
  const { t } = useTranslate();

  return (
    <AppCard>
      <h3 style={{ marginBottom: 16 }}>
        {t("expenses.addLoan")}
      </h3>

      <AppSelect
        value={selectedLoanEmployee?.id || ""}
        disabled={branchEmployees.length === 0}
        onChange={(e) => {
          const employee = branchEmployees.find(
            (emp) => emp.id === e.target.value
          );

          setSelectedLoanEmployee(employee || null);
        }}
      >
        <option value="">
          {branchEmployees.length === 0
            ? t("employees.noEmployees")
            : t("employees.selectEmployee")}
        </option>

        {branchEmployees.map((employee) => (
          <option
            key={employee.id}
            value={employee.id}
          >
            {employee.name}
          </option>
        ))}
      </AppSelect>

      <AppInput
        type="number"
        placeholder={t("common.amount")}
        value={loanAmount}
        onChange={(e) =>
          setLoanAmount(e.target.value)
        }
      />

      <AppInput
        placeholder={t("common.note")}
        value={loanNote}
        onChange={(e) =>
          setLoanNote(e.target.value)
        }
      />

      <AppButton
        fullWidth
        loading={loading}
        onClick={onSubmit}
      >
        {t("expenses.addLoan")}
      </AppButton>
    </AppCard>
  );
}