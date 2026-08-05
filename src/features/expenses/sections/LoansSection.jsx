import LoanStats from "../components/LoanStats";
import LoanForm from "../forms/LoanForm";
import LoansTable from "../tables/LoansTable";

export default function LoansSection(props) {
  return (
    <>
      <LoanStats
        employeeLoans={props.employeeLoans}
        formatMoney={props.formatMoney}
      />

      <LoansTable
        employeeLoans={props.employeeLoans}
        sortItems={props.sortItems}
        tableSort={props.tableSort}
        handleTableSort={props.handleTableSort}
        formatMoney={props.formatMoney}
        setEditingLoan={props.setEditingLoan}
        setEditEmployeeData={props.setEditEmployeeData}
        setEditAmount={props.setEditAmount}
        setEditNote={props.setEditNote}
      />

      <LoanForm
        branchEmployees={props.branchEmployees}
        selectedLoanEmployee={props.selectedLoanEmployee}
        setSelectedLoanEmployee={
          props.setSelectedLoanEmployee
        }
        loanAmount={props.loanAmount}
        setLoanAmount={props.setLoanAmount}
        loanNote={props.loanNote}
        setLoanNote={props.setLoanNote}
        loading={props.isAddingLoan}
        onSubmit={props.handleAddLoan}
      />
    </>
  );
}