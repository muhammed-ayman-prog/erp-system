import BonusStats from "../components/BonusStats";
import BonusForm from "../forms/BonusForm";
import BonusesTable from "../tables/BonusesTable";

export default function BonusSection(props) {
  return (
    <>
      <BonusStats
        employeeBonuses={props.employeeBonuses}
        formatMoney={props.formatMoney}
      />

      <BonusesTable
        employeeBonuses={props.employeeBonuses}
        tableSort={props.tableSort}
        handleTableSort={props.handleTableSort}
        sortItems={props.sortItems}
        formatMoney={props.formatMoney}
        setEditingBonus={props.setEditingBonus}
        setEditEmployeeData={props.setEditEmployeeData}
        setEditAmount={props.setEditAmount}
        setEditNote={props.setEditNote}
      />

      <BonusForm
        branchEmployees={props.branchEmployees}
        selectedBonusEmployee={
          props.selectedBonusEmployee
        }
        setSelectedBonusEmployee={
          props.setSelectedBonusEmployee
        }
        bonusAmount={props.bonusAmount}
        setBonusAmount={props.setBonusAmount}
        bonusNote={props.bonusNote}
        setBonusNote={props.setBonusNote}
        loading={props.isAddingBonus}
        onSubmit={props.handleAddBonus}
      />
    </>
  );
}