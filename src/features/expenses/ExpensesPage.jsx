import {
  formatMoney,
  sortItems,
  calculateCategoryTotals,
  getTopCategory,
  getEmployeeNames,
} from "./utils/expenseHelpers";
import {
  useState,
  useMemo
} from "react";
import { useAuth } from "../../store/useAuth";
import { useApp } from "../../store/useApp";
import { theme } from "../../theme";
import { useTranslate } from "../../useTranslate";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExpenseHeader from "./components/ExpenseHeader";
import ExpenseTabs from "./components/ExpenseTabs";
import ExpenseToolbar from "./components/ExpenseToolbar"; 
import EditExpenseDialog from "./dialogs/EditExpenseDialog";
import EditLoanDialog from "./dialogs/EditLoanDialog";
import EditBonusDialog from "./dialogs/EditBonusDialog";
import ExpensesSection from "./sections/ExpensesSection";
import LoansSection from "./sections/LoansSection";
import BonusesSection from "./sections/BonusesSection";
import useExpenses from "./hooks/useExpenses";
import useLoans from "./hooks/useLoans";
import useBonuses from "./hooks/useBonuses";
import toast from "react-hot-toast";
import { isDateInRange } from "../../utils/dateFilter";
import AppFilterChips from "../../components/ui/AppFilterChips";
import { getTodayRange } from "../../utils/dateFilter";
export default function Expenses() {
  const { t } = useTranslate(); 
  const { user } = useAuth();
  const { selectedBranch } = useApp();
 


  const [tab, setTab] = useState("expenses");
const todayRange = getTodayRange();

const [fromDate, setFromDate] =
  useState(todayRange.fromDate);

const [toDate, setToDate] =
  useState(todayRange.toDate);
  const branchToUse =
    user?.role === "owner"
  ? selectedBranch
  : user?.branchIds?.[0];
 const expensesHook = useExpenses({
  branchId: branchToUse,
  role: user?.role,
  t,
});

const loansHook = useLoans({
  branchId: branchToUse,
  role: user?.role,
});
const {
  expenses,
  amount,
  setAmount,
  note,
  setNote,
  category,
  setCategory,
  customCategory,
  setCustomCategory,
  editingExpense,
  setEditingExpense,
  editAmount,
  setEditAmount,
  editNote,
  setEditNote,
  editCategory,
  setEditCategory,
  isAddingExpense,
  isUpdatingExpense,
  handleAddExpense,
  handleUpdateExpense,
  expenseCategories,
  filterCategories,
} = expensesHook;
const bonusesHook = useBonuses({
  branchId: branchToUse,
  role: user?.role,
});
const {
  loans,
  branchEmployees,

  selectedLoanEmployee,
  setSelectedLoanEmployee,

  loanAmount,
  setLoanAmount,

  loanNote,
  setLoanNote,

  editingLoan,
  setEditingLoan,

  editEmployeeData,
  setEditEmployeeData,

  editAmount: loanEditAmount,
  setEditAmount: setLoanEditAmount,

  editNote: loanEditNote,
  setEditNote: setLoanEditNote,

  isAddingLoan,
  isUpdatingLoan,

  handleAddLoan,
  handleUpdateLoan,

  getFilteredLoans,
} = loansHook;

const {
  bonuses,
  selectedBonusEmployee,
  setSelectedBonusEmployee,

  bonusAmount,
  setBonusAmount,

  bonusNote,
  setBonusNote,

  editingBonus,
  setEditingBonus,

  editAmount: bonusEditAmount,
  setEditAmount: setBonusEditAmount,

  editNote: bonusEditNote,
  setEditNote: setBonusEditNote,

  isAddingBonus,
  isUpdatingBonus,

  handleAddBonus,
  handleUpdateBonus,

  getFilteredBonuses,
} = bonusesHook;

  const [search, setSearch] = useState("");
  const [tableSort, setTableSort] =
  useState({
    key: "date",
    direction: "desc"
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");

const handleTableSort = (key) => {

  setTableSort(prev => ({

    key,

    direction:
      prev.key === key &&
      prev.direction === "asc"
        ? "desc"
        : "asc"

  }));

};
const filteredExpenses = useMemo(() => {

  return expenses.filter(e =>

  (
    (!fromDate && !toDate) ||
    isDateInRange(
      e.createdAt,
      fromDate,
      toDate
    )
  )

  &&

  (selectedCategory === "all" ||
    e.category === selectedCategory)

  &&

  (
    (e.note || "")
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    (e.category || "")
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    String(e.amount || "")
      .includes(search)
  )

  );

},[
  expenses,
  fromDate,
  toDate,
  selectedCategory,
  search
]);
const totalExpenses = filteredExpenses.reduce(
  (sum, expense) => sum + (expense.amount || 0),
  0
);



const categoryTotals = useMemo(
  () => calculateCategoryTotals(filteredExpenses),
  [filteredExpenses]
);

const topCategory = useMemo(
  () => getTopCategory(categoryTotals),
  [categoryTotals]
);

const employeeNames = useMemo(
  () => getEmployeeNames(loans, bonuses),
  [loans, bonuses]
);

const filteredLoans = getFilteredLoans({
  selectedEmployee,
  fromDate,
  toDate,
});

const filteredBonuses = getFilteredBonuses({
  selectedEmployee,
  fromDate,
  toDate,
});






const exportToExcel = () => {

  let data = [];

  if (tab === "expenses") {
    data = filteredExpenses.map(e => ({
      amount: e.amount,
      category: e.category || "عام",
      note: e.note || "",
      date: new Date(
        e.createdAt?.seconds
          ? e.createdAt.seconds * 1000
          : e.createdAt
      ).toLocaleString()
    }));
  }

  if (tab === "loans") {
    data = filteredLoans.map(l => ({
      employee: l.employeeName,
      amount: l.amount,
      note: l.note || "",
      date: new Date(
        l.createdAt?.seconds
          ? l.createdAt.seconds * 1000
          : l.createdAt
      ).toLocaleString()
    }));
  }

  if (tab === "bonus") {
    data = filteredBonuses.map(b => ({
      employee: b.employeeName,
      amount: b.amount,
      note: b.note || "",
      date: new Date(
        b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : b.createdAt
      ).toLocaleString()
    }));
  }

  const worksheet =
    XLSX.utils.json_to_sheet(data);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    tab
  );

  const excelBuffer = XLSX.write(
    workbook,
    {
      bookType: "xlsx",
      type: "array"
    }
  );

  const fileData = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  );

  saveAs(
    fileData,
    `${tab}-${new Date()
  .toISOString()
  .slice(0,10)}.xlsx`
  );

  toast.success("تم تصدير التقرير");
};


  return (
    <div style={page}>
  <div style={container}>

      <ExpenseHeader />
      <ExpenseTabs
  activeTab={tab}
  onChange={setTab}
  resetFilters={() => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedEmployee("all");
  }}
/>
<ExpenseToolbar
  tab={tab}
  fromDate={fromDate}
  toDate={toDate}
  setFromDate={setFromDate}
  setToDate={setToDate}
  search={search}
  setSearch={setSearch}
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
  selectedEmployee={selectedEmployee}
  setSelectedEmployee={setSelectedEmployee}
  filterCategories={filterCategories}
  employeeNames={employeeNames}
  onExport={exportToExcel}
/>
<AppFilterChips
  filters={[
    fromDate && {
      key: "fromDate",
      label: `${t("common.from")}: ${fromDate}`,
    },

    toDate && {
      key: "toDate",
      label: `${t("common.to")}: ${toDate}`,
    },

    search && {
      key: "search",
      label: `${t("common.search")}: ${search}`,
    },

    tab === "expenses" &&
      selectedCategory !== "all" && {
        key: "category",
        label: selectedCategory,
      },

    tab !== "expenses" &&
      selectedEmployee !== "all" && {
        key: "employee",
        label: selectedEmployee,
      },
  ].filter(Boolean)}
  onRemove={(key) => {
    switch (key) {
      case "fromDate":
        setFromDate("");
        break;

      case "toDate":
        setToDate("");
        break;

      case "search":
        setSearch("");
        break;

      case "category":
        setSelectedCategory("all");
        break;

      case "employee":
        setSelectedEmployee("all");
        break;

      default:
        break;
    }
  }}
  onClear={() => {
    setFromDate("");
    setToDate("");
    setSearch("");
    setSelectedCategory("all");
    setSelectedEmployee("all");
  }}
/>
{tab === "expenses" && (
  <ExpensesSection
    totalExpenses={totalExpenses}
    topCategory={topCategory}
    categoryTotals={categoryTotals}
    formatMoney={formatMoney}

    amount={amount}
    setAmount={setAmount}
    category={category}
    setCategory={setCategory}
    expenseCategories={expenseCategories}
    customCategory={customCategory}
    setCustomCategory={setCustomCategory}
    note={note}
    setNote={setNote}
    isAddingExpense={isAddingExpense}
    handleAddExpense={handleAddExpense}
    selectedEmployee={selectedEmployee}
    tableSort={tableSort}
    handleTableSort={handleTableSort}
    filteredExpenses={filteredExpenses}
    sortItems={(items) =>
  sortItems(items, tableSort)
}

    setEditingExpense={setEditingExpense}
    setEditAmount={setEditAmount}
    setEditNote={setEditNote}
    setEditCategory={setEditCategory}
  />
)}

      {/* ⚠️ اختار فرع */}
      {user?.role === "owner" && !selectedBranch && (
        <p style={{ color: theme.colors.muted }}>
          {t("branches.select")}
        </p>
      )}

      {/* ➕ Add */}
      
<EditExpenseDialog
  open={!!editingExpense}
  onClose={() => setEditingExpense(null)}
  amount={editAmount}
  setAmount={setEditAmount}
  note={editNote}
  setNote={setEditNote}
  category={editCategory}
  setCategory={setEditCategory}
  customCategory={customCategory}
  setCustomCategory={setCustomCategory}
  categories={expenseCategories}
  loading={isUpdatingExpense}
  onSubmit={handleUpdateExpense}
/>
<EditLoanDialog
  open={!!editingLoan}
  onClose={() => setEditingLoan(null)}
  employee={editEmployeeData}
  setEmployee={setEditEmployeeData}
  employees={branchEmployees}
  amount={loanEditAmount}
  setAmount={setLoanEditAmount}

  note={loanEditNote}
  setNote={setLoanEditNote}
  loading={isUpdatingLoan}
  onSubmit={handleUpdateLoan}
/>
<EditBonusDialog
  open={!!editingBonus}
  onClose={() => setEditingBonus(null)}
  employee={editEmployeeData}
  setEmployee={setEditEmployeeData}
  employees={branchEmployees}
  amount={bonusEditAmount}
  setAmount={setBonusEditAmount}

  note={bonusEditNote}
  setNote={setBonusEditNote}
  loading={isUpdatingBonus}
  onSubmit={handleUpdateBonus}
/>

{tab === "loans" && (
  <LoansSection
    employeeLoans={filteredLoans}
    formatMoney={formatMoney}

    branchEmployees={branchEmployees}

    selectedLoanEmployee={selectedLoanEmployee}
    setSelectedLoanEmployee={setSelectedLoanEmployee}

    loanAmount={loanAmount}
    setLoanAmount={setLoanAmount}

    loanNote={loanNote}
    setLoanNote={setLoanNote}

    isAddingLoan={isAddingLoan}
    handleAddLoan={handleAddLoan}

    tableSort={tableSort}
    handleTableSort={handleTableSort}
    sortItems={(items) =>
  sortItems(items, tableSort)
}

    setEditingLoan={setEditingLoan}
    setEditEmployeeData={setEditEmployeeData}
    setEditAmount={setLoanEditAmount}
    setEditNote={setLoanEditNote}
/>
)}

 
{tab === "bonus" && (
  <BonusesSection
     employeeBonuses={filteredBonuses}
    formatMoney={formatMoney}

    branchEmployees={branchEmployees}

    selectedBonusEmployee={selectedBonusEmployee}
    setSelectedBonusEmployee={setSelectedBonusEmployee}

    bonusAmount={bonusAmount}
    setBonusAmount={setBonusAmount}

    bonusNote={bonusNote}
    setBonusNote={setBonusNote}

    isAddingBonus={isAddingBonus}
    handleAddBonus={handleAddBonus}

    tableSort={tableSort}
    handleTableSort={handleTableSort}
    sortItems={(items) =>
  sortItems(items, tableSort)
}

    setEditingBonus={setEditingBonus}
    setEditEmployeeData={setEditEmployeeData}
    setEditAmount={setBonusEditAmount}
    setEditNote={setBonusEditNote}
  />
)}
    
    </div>
      </div>
  );
}


const page = {
  background: "#f8fafc",
  minHeight: "100vh",
  padding: "20px"
};

const container = {
  width: "100%",
  maxWidth: 1600,
  margin: "0 auto",
  padding: "0 20px"
};
