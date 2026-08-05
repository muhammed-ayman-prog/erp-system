import ExpenseStats from "../components/ExpenseStats";
import ExpenseForm from "../forms/ExpenseForm";
import ExpensesTable from "../tables/ExpensesTable";

export default function ExpensesSection(props) {
  const {
    totalExpenses,
    topCategory,
    formatMoney,

    amount,
    setAmount,
    category,
    setCategory,
    expenseCategories,
    customCategory,
    setCustomCategory,
    note,
    setNote,
    isAddingExpense,
    handleAddExpense,

    tableSort,
    handleTableSort,
    filteredExpenses,
    sortItems,

    setEditingExpense,
    setEditAmount,
    setEditNote,
    setEditCategory,
  } = props;

  return (
    <>
      <ExpenseStats
        totalExpenses={totalExpenses}
        topCategory={topCategory}
        totalTransactions={filteredExpenses.length}
        averageExpense={
          filteredExpenses.length
            ? totalExpenses / filteredExpenses.length
            : 0
        }
        formatMoney={formatMoney}
      />

      <ExpensesTable
        tableSort={tableSort}
        handleTableSort={handleTableSort}
        filteredExpenses={filteredExpenses}
        sortItems={sortItems}
        formatMoney={formatMoney}
        setEditingExpense={setEditingExpense}
        setEditAmount={setEditAmount}
        setEditNote={setEditNote}
        setEditCategory={setEditCategory}
        setCustomCategory={setCustomCategory}
      />

      <ExpenseForm
        amount={amount}
        setAmount={setAmount}
        category={category}
        setCategory={setCategory}
        expenseCategories={expenseCategories}
        customCategory={customCategory}
        setCustomCategory={setCustomCategory}
        note={note}
        setNote={setNote}
        loading={isAddingExpense}
        onSubmit={handleAddExpense}
      />
    </>
  );
}