
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
    <AppCard
      padding="lg"
      style={{ marginBottom: 20 }}
    >
      <h3 style={{ marginBottom: 18 }}>
        {t("expenses.addBonus")}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
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
              ? t("employees.noEmployees")
              : t("employees.selectEmployee")}
          </option>

          {branchEmployees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </AppSelect>

        <AppInput
          type="number"
          inputMode="decimal"
          placeholder={t("common.amount")}
          value={bonusAmount}
          onChange={(e) => setBonusAmount(e.target.value)}
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

        <AppInput
          placeholder={t("common.note")}
          value={bonusNote}
          onChange={(e) => setBonusNote(e.target.value)}
        />

        <AppButton
          fullWidth
          loading={loading}
          onClick={onSubmit}
        >
          {t("expenses.addBonus")}
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
