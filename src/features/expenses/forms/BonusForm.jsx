import AppButton from "../../../components/ui/AppButton";
import AppCard from "../../../components/ui/AppCard";
import AppInput from "../../../components/ui/AppInput";
import AppSelect from "../../../components/ui/AppSelect";
import { useTranslate } from "../../../useTranslate";

export default function BonusForm({
  branchEmployees = [],

  selectedBonusEmployee,
  setSelectedBonusEmployee,

  bonusAmount,
  setBonusAmount,

  bonusNote,
  setBonusNote,

  loading,

  onSubmit,
}) {
  const { t } = useTranslate();

  return (
    <AppCard>
      <h3 style={{ marginBottom: 16 }}>
        {t("expenses.addBonus")}
      </h3>

      <AppSelect
        value={selectedBonusEmployee?.id || ""}
        disabled={branchEmployees.length === 0}
        onChange={(e) => {
          const employee = branchEmployees.find(
            (emp) => emp.id === e.target.value
          );

          setSelectedBonusEmployee(employee || null);
        }}
      >
        <option value="">
          {branchEmployees.length === 0
            ? "لا يوجد موظفون"
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
        value={bonusAmount}
        onChange={(e) =>
          setBonusAmount(e.target.value)
        }
      />

      <AppInput
        placeholder={t("common.note")}
        value={bonusNote}
        onChange={(e) =>
          setBonusNote(e.target.value)
        }
      />

      <AppButton
        fullWidth
        loading={loading}
        onClick={onSubmit}
      >
        {t("expenses.addBonus")}
      </AppButton>
    </AppCard>
  );
}