import {
  useState,
  useEffect,
  useMemo
} from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { serverTimestamp } from "firebase/firestore";
import { useTranslate } from "../useTranslate";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
export default function Expenses() {
  const { t, tt, lang } = useTranslate();
  const { user } = useAuth();
  const { selectedBranch } = useApp();
  const [employeeName, setEmployeeName] = useState("");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("إيجار");
  const [customCategory, setCustomCategory] = useState("");
  const [savedCategories, setSavedCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState("expenses");

  // loans
  const [loanAmount, setLoanAmount] = useState("");
  const [loanNote, setLoanNote] = useState("");
  const [loans, setLoans] = useState([]);

  // bonus
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusNote, setBonusNote] = useState("");
  const [bonuses, setBonuses] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const branchToUse =
    user?.role === "owner"
  ? selectedBranch
  : user?.branchIds?.[0];
  const [search, setSearch] = useState("");
  const [tableSort, setTableSort] =
  useState({
    key: "date",
    direction: "desc"
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingLoan, setEditingLoan] =
  useState(null);

const [editingBonus, setEditingBonus] =
  useState(null);

const [editEmployeeName,
  setEditEmployeeName] =
  useState("");

const [editAmount, setEditAmount] = useState("");
const [editNote, setEditNote] = useState("");
const [editCategory, setEditCategory] = useState("عام");
  // 📥 fetch expenses
  useEffect(() => {

  if (!branchToUse)
    return;

  const q =

  user?.role === "owner" &&
  branchToUse === "all"

    ? query(
        collection(db, "expenses"),
        orderBy("createdAt", "desc")
      )

    : query(
        collection(db, "expenses"),

        where(
          "branchId",
          "==",
          branchToUse
        ),

        orderBy(
          "createdAt",
          "desc"
        )
      );

  const unsubscribe = onSnapshot(q, snap => {

    setExpenses(
      snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );

  });

  return () => unsubscribe();

}, [branchToUse, user?.role]);
  useEffect(() => {

  if (!branchToUse)
    return;

  const loansQuery =

  user?.role === "owner" &&
  branchToUse === "all"

    ? query(
        collection(db, "loans"),
        orderBy("createdAt", "desc")
      )

    : query(
        collection(db, "loans"),

        where(
          "branchId",
          "==",
          branchToUse
        ),

        orderBy(
          "createdAt",
          "desc"
        )
      );

  const bonusQuery =

  user?.role === "owner" &&
  branchToUse === "all"

    ? query(
        collection(db, "bonuses"),
        orderBy("createdAt", "desc")
      )

    : query(
        collection(db, "bonuses"),

        where(
          "branchId",
          "==",
          branchToUse
        ),

        orderBy(
          "createdAt",
          "desc"
        )
      );

  const unsubscribeLoans =
    onSnapshot(loansQuery, snap => {

      setLoans(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    });

  const unsubscribeBonus =
    onSnapshot(bonusQuery, snap => {

      setBonuses(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    });

  return () => {
    unsubscribeLoans();
    unsubscribeBonus();
  };

}, [branchToUse, user?.role]);
const handleAddLoan = async () => {
  if (!branchToUse || branchToUse === "all") {
  toast.error("اختر فرع محدد أولًا");
  return;
}
  if (!employeeName || !loanAmount) {
  toast.error("اكتب اسم الموظف والمبلغ");
  return;
}

await addDoc(collection(db, "loans"), {
  employeeName,
  amount: Number(loanAmount),
  note: loanNote,
  branchId: branchToUse,
  createdAt: serverTimestamp()
});

  setEmployeeName("");
  setLoanAmount("");
  setLoanNote("");
  toast.success("تم إضافة السلفة");
  setSelectedEmployee("all");
  await addLog({
    action: "ADD_LOAN",

    details: {
      employee: employeeName,
      amount: loanAmount,
      note: loanNote
    },

    targetName: employeeName
  });

};
const handleAddBonus = async () => {
  if (!branchToUse || branchToUse === "all") {
  toast.error("اختر فرع محدد أولًا");
  return;
}
  if (!employeeName || !bonusAmount) {
  toast.error("اكتب اسم الموظف والمبلغ");
  return;
}

await addDoc(collection(db, "bonuses"), {
  employeeName,
  amount: Number(bonusAmount),
  note: bonusNote,
  branchId: branchToUse,
  createdAt: serverTimestamp()
});

  setEmployeeName("");
  setBonusAmount("");
  setBonusNote("");
  toast.success("تم إضافة الحافز");
  setSelectedEmployee("all");
  await addLog({
    action: "ADD_BONUS",

    details: {
      employee: employeeName,
      amount: bonusAmount,
      note: bonusNote
    },

    targetName: employeeName
  });

  
};
  // ➕ add expense
  const handleAddExpense = async () => {
    if (!branchToUse || branchToUse === "all") {
      toast.error("اختر فرع محدد أولًا");
      return;
    }

    if (!amount) {
      toast.error(t("expenses.enterAmount"));
      return;
    }

    try {
      const finalCategory =
        category === "➕ تصنيف جديد"
          ? customCategory
          : category;

      if (!finalCategory) {
        toast.error("اكتب التصنيف");
        return;
      }
      await addDoc(collection(db, "expenses"), {
      amount: Number(amount),
      note,
      category: finalCategory,
      branchId: branchToUse,
      userId: user.uid,
      createdAt: serverTimestamp()
    });

      setAmount("");
      setNote("");
      setCategory("إيجار");
      setCustomCategory("");

      toast.success("تم إضافة المصروف");
      await addLog({
        action: "ADD_EXPENSE",

        details: {
          amount,
          category: finalCategory,
          note
        },

        targetName: finalCategory
      });
      
    } catch (err) {
      toast.error(t("common.error"));
    }
  };
const isInRange = (date) => {
  if (!date) return true;

  const d = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);

  if (fromDate && new Date(fromDate) > d) return false;
  if (toDate && new Date(toDate + "T23:59:59") < d) return false;

  return true;
};
const totalExpenses = expenses
  .filter(e => isInRange(e.createdAt))
  .reduce((acc, e) => acc + (e.amount || 0), 0);

const totalLoans = loans
  .filter(l => isInRange(l.createdAt))
  .reduce((acc, l) => acc + (l.amount || 0), 0);

const totalBonus = bonuses
  .filter(b => isInRange(b.createdAt))
  .reduce((acc, b) => acc + (b.amount || 0), 0);

  const formatMoney = (num) => {
  return new Intl.NumberFormat("en-US").format(num || 0);
};

const sortItems = (items) => {

  return [...items].sort((a, b) => {

    let aValue;
    let bValue;

    switch (tableSort.key) {

      case "amount":
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;

      case "category":
        aValue = a.category || "";
        bValue = b.category || "";
        break;

      case "employee":
        aValue = a.employeeName || "";
        bValue = b.employeeName || "";
        break;

      default:
        aValue = a.createdAt?.seconds || 0;
        bValue = b.createdAt?.seconds || 0;
    }

    if (typeof aValue === "string") {

      return tableSort.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);

    }

    return tableSort.direction === "asc"
      ? aValue - bValue
      : bValue - aValue;

  });

};
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
const defaultCategories = [
  "إيجار",
  "مرتبات",
  "مواصلات",
  "فواتير",
  
];

const expenseCategories = [
  ...new Set([
    ...defaultCategories,
    ...savedCategories,
    "➕ تصنيف جديد"
  ])
];
const filterCategories =
  expenseCategories.filter(
    c => c !== "➕ تصنيف جديد"
  );
useEffect(() => {
  const existingCategories = expenses
    .map(e => e.category)
    .filter(Boolean);

  setSavedCategories([
  ...new Set(existingCategories)
]);
}, [expenses]);
const filteredExpenses = useMemo(() => {

  return expenses.filter(e =>
  isInRange(e.createdAt) &&

  (selectedCategory === "all" ||
    e.category === selectedCategory) &&

  (
    (
  (e.note || "")
    .toLowerCase()
    .includes(search.toLowerCase())

  ||

  (e.category || "")
    .toLowerCase()
    .includes(search.toLowerCase())
)
  ||
String(e.amount || "")
  .includes(search)
  )
  );

}, [
  expenses,
  fromDate,
  toDate,
  selectedCategory,
  search
]);



const categoryTotals = {};

filteredExpenses.forEach(e => {
  const cat = e.category || "عام";

  categoryTotals[cat] =
    (categoryTotals[cat] || 0) + (e.amount || 0);
});

const topCategory =
  Object.keys(categoryTotals).length > 0
    ? Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0][0]
    : "—";


const chartData = Object.entries(categoryTotals).map(
  ([name, value]) => ({
    name,
    value
  })
);

const monthlyTotals = {};

filteredExpenses.forEach(e => {

  const date = new Date(
    e.createdAt?.seconds
      ? e.createdAt.seconds * 1000
      : e.createdAt
  );

  const month =
    `${date.getMonth() + 1}/${date.getFullYear()}`;

  monthlyTotals[month] =
    (monthlyTotals[month] || 0) +
    (e.amount || 0);
});

const monthlyChartData =
  Object.entries(monthlyTotals).map(
    ([month, amount]) => ({
      month,
      amount
    })
  );
const employeeNames = [
  ...new Set([
    ...loans.map(l => l.employeeName),
    ...bonuses.map(b => b.employeeName)
  ])
].filter(Boolean);

const employeeLoans = loans.filter(
  l =>
    isInRange(l.createdAt) &&

    (
      selectedEmployee === "all" ||
      l.employeeName === selectedEmployee
    ) &&

    (
      (l.employeeName || "")
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      (l.note || "")
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      String(l.amount || "")
        .includes(search)
    )
);

const employeeBonuses = bonuses.filter(
  b =>
    isInRange(b.createdAt) &&

    (
      selectedEmployee === "all" ||
      b.employeeName === selectedEmployee
    ) &&

    (
      (b.employeeName || "")
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      (b.note || "")
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      String(b.amount || "")
        .includes(search)
    )
);


const employeeActivities = useMemo(() => [
  ...employeeLoans.map(l => ({
    type: "loan",
    employeeName: l.employeeName,
    amount: l.amount,
    note: l.note,
    createdAt: l.createdAt
  })),

  ...employeeBonuses.map(b => ({
    type: "bonus",
    employeeName: b.employeeName,
    amount: b.amount,
    note: b.note,
    createdAt: b.createdAt
  }))
].sort((a, b) => {
  const aDate = a.createdAt?.seconds || 0;
  const bDate = b.createdAt?.seconds || 0;

  return bDate - aDate;
}), [
  employeeLoans,
  employeeBonuses
]);
 
const handleDeleteExpense = async (id) => {
  const confirmDelete = window.confirm(
    "هل أنت متأكد من حذف المصروف؟"
  );

  if (!confirmDelete) return;

  try {
    const expenseToDelete =
     expenses.find(e => e.id === id);
    await deleteDoc(doc(db, "expenses", id));
    toast.success("تم حذف المصروف");
    await addLog({
      action: "DELETE_EXPENSE",

      details: {
        amount: expenseToDelete?.amount,
        category: expenseToDelete?.category,
        note: expenseToDelete?.note
      },

      targetName:
        expenseToDelete?.category
    });

  } catch (err) {
    toast.error("حصل خطأ أثناء الحذف");
  }
};
const handleUpdateExpense = async () => {
  if (!editingExpense) return;

  try {
    const finalEditCategory =
      editCategory === "➕ تصنيف جديد"
        ? customCategory
        : editCategory;
    await updateDoc(
      doc(db, "expenses", editingExpense.id),
      {
        amount: Number(editAmount),
        note: editNote,
        category: finalEditCategory
      }
    );
    setEditingExpense(null);
    toast.success("تم تعديل المصروف");
    await addLog({
      action: "UPDATE_EXPENSE",

      details: {
        amount: editAmount,
        category: finalEditCategory,
        note: editNote
      },

      targetName: finalEditCategory
    });
  } catch (err) {
    toast.error("حصل خطأ أثناء التعديل");
  }
};
const handleUpdateLoan = async () => {

  if (!editingLoan) return;

  try {

    await updateDoc(
      doc(db, "loans", editingLoan.id),
      {
        employeeName: editEmployeeName,
        amount: Number(editAmount),
        note: editNote
      }
    );

    toast.success("تم تعديل السلفة");

    await addLog({
      action: "UPDATE_LOAN",

      details: {
        employee: editEmployeeName,
        amount: editAmount,
        note: editNote
      },

      targetName: editEmployeeName
    });

    setEditingLoan(null);

  } catch (err) {

    toast.error("حصل خطأ أثناء التعديل");

  }

};
const handleUpdateBonus = async () => {

  if (!editingBonus) return;

  try {

    await updateDoc(
      doc(db, "bonuses", editingBonus.id),
      {
        employeeName: editEmployeeName,
        amount: Number(editAmount),
        note: editNote
      }
    );

    toast.success("تم تعديل الحافز");

    await addLog({
      action: "UPDATE_BONUS",

      details: {
        employee: editEmployeeName,
        amount: editAmount,
        note: editNote
      },

      targetName: editEmployeeName
    });

    setEditingBonus(null);

  } catch (err) {

    toast.error("حصل خطأ أثناء التعديل");

  }

};
const addLog = async ({
  action,
  details,
  module = "Expenses",
  status = "success",
  targetName = "",
  targetId = ""
}) => {
if (!branchToUse) return;
  try {
    const autoSeverity =
      action?.includes("DELETE")
        ? "danger"
        : action?.includes("UPDATE")
        ? "warning"
        : "success";
    await addDoc(collection(db, "logs"), {

      action,

      module,

      status,

      severity: autoSeverity,

      targetName,

      targetId,

      byName:
        user?.email || "Unknown",

      userId:
        user?.uid || null,

      branchId:
        branchToUse === "all"
          ? null
          : branchToUse || null,
        
      userAgent:
         navigator.userAgent,

      details,

      createdAt:
        serverTimestamp()

    });

  } catch (err) {

    console.error(
      "log error",
      err
    );

  }

};
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
    data = employeeLoans.map(l => ({
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
    data = employeeBonuses.map(b => ({
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
      <Toaster
  position="top-right"
  toastOptions={{
    duration: 3000,
    style: {
      borderRadius: "12px",
      background: "#111827",
      color: "#fff"
    }
  }}
/>
  <div style={container}>

      <h2 style={{ marginBottom: 15, fontWeight: "600" }}>
        📊 إدارة المصروفات
      </h2>
      <div style={tabsContainer}>
      {[
        { key: "expenses", label: "💸 المصروفات" },
        { key: "loans", label: "🧾 السلف" },
        { key: "bonus", label: "🎁 الحوافز" }
      ].map(t => (
        <button
          key={t.key}
          onClick={() => {
  setTab(t.key);

  setSearch("");
  setSelectedCategory("all");
  setSelectedEmployee("all");
}}
          style={{
            ...tabBtn,
            background: tab === t.key ? "#111827" : "#f1f5f9",
            color: tab === t.key ? "#fff" : "#374151"
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    style={input}
  />
  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    style={input}
  />
</div>
<div
  style={{
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 20,

    background: "#f8fafc",
    padding: 10,
    borderRadius: 14
  }}
>
  <input
  placeholder="🔎 بحث..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    ...input,
    marginBottom: 0,
    maxWidth: 250
  }}
/>
  {tab === "expenses" && (
  <select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  style={{
    ...input,
    marginBottom: 0,
    maxWidth: 180
  }}
>
  <option value="all">كل التصنيفات</option>

  {filterCategories.map(cat => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>
)}
{tab !== "expenses" && (
<select
  value={selectedEmployee}
  onChange={(e) =>
    setSelectedEmployee(e.target.value)
  }
  style={{
    ...input,
    marginBottom: 0,
    maxWidth: 220
  }}
>
  <option value="all">
  كل الموظفين ({employeeNames.length})
</option>

  {employeeNames.map(name => (
    <option key={name} value={name}>
      {name}
    </option>
  ))}
</select>
)}

  
  <button
  onClick={exportToExcel}
  style={{
    ...tabBtn,
    background: "#16a34a",
    color: "#fff"
  }}
>
  📤 Export Excel
</button>

</div>
{tab === "expenses" && (
  <>
  <div style={summaryGrid}>

  {/* 💸 Expenses */}
  <div
    style={{
      ...summaryCard,
      borderLeft: "5px solid #ef4444"
    }}
  >
    <div style={summaryTop}>
      <span>💸 اجمالي المصروفات</span>
      <span>📉</span>
    </div>

    <strong>
      {formatMoney(totalExpenses)} EGP
    </strong>
  </div>

  {/* 🏆 Top Category */}
  <div
    style={{
      ...summaryCard,
      borderLeft: "5px solid #f59e0b"
    }}
  >
    <div style={summaryTop}>
      <span>🏆 الأعلى صرفًا</span>
      <span>💸</span>
    </div>

    <strong>
      {topCategory}
    </strong>

    <span
      style={{
        fontSize: 13,
        color: "#6b7280"
      }}
    >
      {formatMoney(
        categoryTotals[topCategory]
      )} EGP
    </span>
  </div>

</div>  
    {/* 💸 FORM */}
    <div style={{
        ...box,

        maxWidth: "100%",

        marginBottom: 20
      }}>
      <h3 style={{ marginBottom: 10 }}>💸 إضافة مصروف</h3>

      <input
        type="number"
        placeholder={t("expenses.amount")}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={input}
      />
      <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  style={input}
>
  {expenseCategories.map(cat => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>

{category === "➕ تصنيف جديد" && (
  <input
    placeholder="اكتب التصنيف الجديد"
    value={customCategory}
    onChange={(e) =>
      setCustomCategory(e.target.value)
    }
    style={input}
  />
)}

      <input
        placeholder={t("expenses.note")}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={input}
      />

      <button style={btnRed} onClick={handleAddExpense}>
        {t("expenses.add")}
      </button>
    </div>



{selectedEmployee !== "all" &&
 employeeActivities.length > 0 && (
<div style={chartCard}>
  <div style={chartHeader}>
    <h3 style={{ margin: 0 }}>
     🧾 سجل السلف والحوافز
    </h3>

    <span style={{ color: "#6b7280", fontSize: 13 }}>
      Loans & Bonus History
    </span>
  </div>

  <div style={tableWrapper}>
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>النوع</th>
          <th style={th}>الموظف</th>
          <th style={th}>المبلغ</th>
          <th style={th}>الملاحظة</th>
          <th style={th}>التاريخ</th>
        </tr>
      </thead>

      <tbody>

        {employeeActivities.length === 0 && (
          <tr>
            <td
              colSpan="5"
              style={{
                padding: 30,
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14
              }}
            >
              📭 لا توجد حركات للموظف المحدد
            </td>
          </tr>
        )}
        {employeeActivities.map((item, index) => (
          <tr key={index}>

            <td style={td}>
              {item.type === "loan"
                ? "🧾 سلفة"
                : "🎁 حافز"}
            </td>

            <td style={td}>
              {item.employeeName}
            </td>

            <td style={td}>
              {item.type === "loan"
                ? "-"
                : "+"}

              {formatMoney(item.amount)} EGP
            </td>

            <td style={td}>
              {item.note || "—"}
            </td>

            <td style={td}>
              {new Date(
                item.createdAt?.seconds
                  ? item.createdAt.seconds * 1000
                  : item.createdAt
              ).toLocaleString()}
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
  </div>
  )}
  <div style={{ marginTop: 20 }}>

  <div style={modernTableWrapper}>

    <table style={modernTable}>

      <thead>

        <tr>

          <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("amount")
  }
>
  المبلغ
  {" "}
  {tableSort.key === "amount"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}
</th>

          <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("category")
  }
>
  التصنيف
  {" "}
  {tableSort.key === "category"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}
</th>

          <th style={modernTh}>
            الملاحظة
          </th>

          <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("date")
  }
>
  التاريخ
  {" "}
  {tableSort.key === "date"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}
</th>

          <th style={stickyActionTh}>
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {filteredExpenses.length === 0 && (

          <tr>

            <td
              colSpan="5"
              style={emptyState}
            >
              📭 مفيش مصروفات
            </td>

          </tr>

        )}

        {sortItems(filteredExpenses)
          .map(e => (

          <tr
  key={e.id}

  onMouseEnter={(e) => {
   e.currentTarget.style.background =
  "#f8fafc";

e.currentTarget.style.transform =
  "scale(0.998)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.background =
  "#fff";

e.currentTarget.style.transform =
  "scale(1)";
  }}

  style={{
    transition: "all 0.2s ease",
    cursor: "pointer"
  }}
>

            <td style={modernTd}>

              <span style={{
                fontWeight: "700",
                color: "#dc2626"
              }}>
                {formatMoney(e.amount)} EGP
              </span>

            </td>

            <td style={modernTd}>

              <span style={{
                background: "#f1f5f9",

                padding: "6px 12px",

                borderRadius: "999px",

                fontSize: 12,

                fontWeight: "600"
              }}>
                {e.category || "عام"}
              </span>

            </td>

            <td style={modernTd}>
              {e.note || "—"}
            </td>

            <td style={modernTd}>

              {new Date(
                e.createdAt?.seconds
                  ? e.createdAt.seconds * 1000
                  : e.createdAt
              ).toLocaleString()}

            </td>

            <td style={stickyActionTd}>

              <div style={{
                display: "flex",
                gap: 8,
                justifyContent: "center"
              }}>

                <button
                  onClick={() => {

                    setEditingExpense(e);

                    setCustomCategory("");

                    setEditAmount(
                      e.amount || ""
                    );

                    setEditNote(
                      e.note || ""
                    );

                    setEditCategory(
                      e.category || "عام"
                    );

                  }}

                  style={{
                    ...actionBtn,
                    background: "#dbeafe",
                    color: "#1d4ed8"
                  }}
                >
                  ✏️ تعديل
                </button>

                <button
                  onClick={() =>
                    handleDeleteExpense(e.id)
                  }

                  style={{
                    ...actionBtn,
                    background: "#fee2e2",
                    color: "#dc2626"
                  }}
                >
                  🗑️ حذف
                </button>

              </div>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>
{chartData.length > 0 && (
<div style={chartsGrid}>
<div style={chartCard}>
  <div style={chartHeader}>
    <h3 style={{ margin: 0 }}>
      📊 توزيع المصروفات
    </h3>

    <span style={{ color: "#6b7280", fontSize: 13 }}>
      حسب التصنيف
    </span>
  </div>

  <div style={{ width: "100%", height: 300 }}>
    {chartData.length === 0 ? (

  <div
    style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#9ca3af",
      fontSize: 15
    }}
  >
    📊 لا توجد بيانات للعرض
  </div>

) : (

  <ResponsiveContainer>
    <PieChart>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        outerRadius={120}
        label
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} />
        ))}
      </Pie>

      <Tooltip />
    </PieChart>
  </ResponsiveContainer>

)}
  </div>
</div>

<div style={chartCard}>
  <div style={chartHeader}>
    <h3 style={{ margin: 0 }}>
      📅 التحليل الشهري
    </h3>

    <span style={{ color: "#6b7280", fontSize: 13 }}>
      Monthly Analytics
    </span>
  </div>

  <div style={{ width: "100%", height: 300 }}>

    {monthlyChartData.length === 0 ? (

      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af"
        }}
      >
        📭 لا توجد بيانات شهرية
      </div>

    ) : (

      <ResponsiveContainer>
        <BarChart data={monthlyChartData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="amount"
            radius={[8, 8, 0, 0]}
          />

        </BarChart>
      </ResponsiveContainer>

    )}

  </div>
</div>

</div>
)}
</>
)}


      {/* ⚠️ اختار فرع */}
      {user?.role === "owner" && !selectedBranch && (
        <p style={{ color: theme.colors.muted }}>
          {t("branches.select")}
        </p>
      )}

      {/* ➕ Add */}
      
{editingExpense && (
  <div style={modalOverlay}>
    <div style={modalBox}>

      <h3 style={{ marginBottom: 15 }}>
        ✏️ تعديل المصروف
      </h3>

      <input
        type="number"
        value={editAmount}
        onChange={(e) =>
          setEditAmount(e.target.value)
        }
        style={input}
      />

      <select
        value={editCategory}
        onChange={(e) =>
          setEditCategory(e.target.value)
        }
        style={input}
      >
        {expenseCategories.map(cat => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      {editCategory === "➕ تصنيف جديد" && (
  <input
    placeholder="اكتب التصنيف الجديد"
    value={customCategory}
    onChange={(e) =>
      setCustomCategory(e.target.value)
    }
    style={input}
  />
)}

      <input
        value={editNote}
        onChange={(e) =>
          setEditNote(e.target.value)
        }
        style={input}
      />

      <div
        style={{
          display: "flex",
          gap: 10
        }}
      >
        <button
          style={btnGreen}
          onClick={handleUpdateExpense}
        >
          حفظ
        </button>

        <button
          style={btnRed}
          onClick={() => setEditingExpense(null)}
        >
          إلغاء
        </button>
      </div>

    </div>
  </div>
)}
{editingLoan && (
  <div style={modalOverlay}>
    <div style={modalBox}>

      <h3 style={{ marginBottom: 15 }}>
        ✏️ تعديل السلفة
      </h3>

      <input
        value={editEmployeeName}
        onChange={(e) =>
          setEditEmployeeName(
            e.target.value
          )
        }
        style={input}
      />

      <input
        type="number"
        value={editAmount}
        onChange={(e) =>
          setEditAmount(
            e.target.value
          )
        }
        style={input}
      />

      <input
        value={editNote}
        onChange={(e) =>
          setEditNote(
            e.target.value
          )
        }
        style={input}
      />

      <div
        style={{
          display: "flex",
          gap: 10
        }}
      >
        <button
          style={btnGreen}
          onClick={handleUpdateLoan}
        >
          حفظ
        </button>

        <button
          style={btnRed}
          onClick={() =>
            setEditingLoan(null)
          }
        >
          إلغاء
        </button>
      </div>

    </div>
  </div>
)}
{editingBonus && (
  <div style={modalOverlay}>
    <div style={modalBox}>

      <h3 style={{ marginBottom: 15 }}>
        ✏️ تعديل الحافز
      </h3>

      <input
        value={editEmployeeName}
        onChange={(e) =>
          setEditEmployeeName(
            e.target.value
          )
        }
        style={input}
      />

      <input
        type="number"
        value={editAmount}
        onChange={(e) =>
          setEditAmount(
            e.target.value
          )
        }
        style={input}
      />

      <input
        value={editNote}
        onChange={(e) =>
          setEditNote(
            e.target.value
          )
        }
        style={input}
      />

      <div
        style={{
          display: "flex",
          gap: 10
        }}
      >
        <button
          style={btnGreen}
          onClick={handleUpdateBonus}
        >
          حفظ
        </button>

        <button
          style={btnRed}
          onClick={() =>
            setEditingBonus(null)
          }
        >
          إلغاء
        </button>
      </div>

    </div>
  </div>
)}

{tab === "loans" && (
  
  <>
    <div style={{ gridColumn: "1 / -1" }}>
    <div style={summaryGrid}>
  <div
    style={{
      ...summaryCard,
      borderLeft: "5px solid #f59e0b"
    }}
  >
    <div style={summaryTop}>
      <span>🧾 إجمالي السلف</span>
      <span>💳</span>
    </div>

    <strong>
      {formatMoney(
        employeeLoans.reduce(
          (acc, l) => acc + (l.amount || 0),
          0
        )
      )} EGP
    </strong>
  </div>
</div>
</div>

  

    <div style={box}>
      <h3 style={{ marginBottom: 10 }}>🧾 إضافة سلفة</h3>

      <input
        placeholder="اسم الموظف"
        value={employeeName}
        onChange={(e) => setEmployeeName(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="قيمة السلفة"
        value={loanAmount}
        onChange={e => setLoanAmount(e.target.value)}
        style={input}
      />

      <input
        placeholder="ملاحظة"
        value={loanNote}
        onChange={e => setLoanNote(e.target.value)}
        style={input}
      />

      <button style={btnRed} onClick={handleAddLoan}>
        إضافة سلفة
      </button>
    </div>
    
    <div style={modernTableWrapper}>

  <table style={modernTable}>

    <thead>

      <tr>

        <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("employee")
  }
>
  الموظف {" "}

  {tableSort.key === "employee"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}

</th>

        <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("amount")
  }
>
  المبلغ {" "}

  {tableSort.key === "amount"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}

</th>

        <th style={modernTh}>
          الملاحظة
        </th>

        <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("date")
  }
>
  التاريخ {" "}

  {tableSort.key === "date"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}

</th>

        <th style={stickyActionTh}>
          Actions
        </th>

      </tr>

    </thead>

    <tbody>

      {employeeLoans.length === 0 && (

  <tr>

    <td
      colSpan="5"
      style={emptyState}
    >
      📭 مفيش سلف
    </td>

  </tr>

)}
      {sortItems(employeeLoans).map(l => (

        <tr
          key={l.id}

          onMouseEnter={(e) => {
            e.currentTarget.style.background =
  "#f8fafc";

e.currentTarget.style.transform =
  "scale(0.998)";
          }}

          onMouseLeave={(e) => {
            e.currentTarget.style.background =
  "#fff";

e.currentTarget.style.transform =
  "scale(1)";
          }}

          style={{
            transition: "all 0.2s ease",
            cursor: "pointer"
          }}
        >

          <td style={modernTd}>
            👤 {l.employeeName}
          </td>

          <td style={modernTd}>
            <span style={{
              color: "#dc2626",
              fontWeight: 700
            }}>
              -{formatMoney(l.amount)} EGP
            </span>
          </td>

          <td style={modernTd}>
            {l.note || "—"}
          </td>

          <td style={modernTd}>
            {new Date(
              l.createdAt?.seconds
                ? l.createdAt.seconds * 1000
                : l.createdAt
            ).toLocaleString()}
          </td>

          <td style={stickyActionTd}>

            <button
              onClick={() => {

                setEditingLoan(l);

                setEditEmployeeName(
                  l.employeeName || ""
                );

                setEditAmount(
                  l.amount || ""
                );

                setEditNote(
                  l.note || ""
                );

              }}

              style={{
                ...actionBtn,
                background: "#dbeafe",
                color: "#1d4ed8"
              }}
            >
              ✏️ تعديل
            </button>

          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

  </>
)}

 
{tab === "bonus" && (
  <>
    <div style={{ gridColumn: "1 / -1" }}>
    <div style={summaryGrid}>
  <div
    style={{
      ...summaryCard,
      borderLeft: "5px solid #22c55e"
    }}
  >
    <div style={summaryTop}>
      <span>🎁 إجمالي الحوافز</span>
      <span>🚀</span>
    </div>

    <strong>
      {formatMoney(
        employeeBonuses.reduce(
          (acc, b) => acc + (b.amount || 0),
          0
        )
      )} EGP
    </strong>
  </div>
</div>
</div>

  

    <div style={box}>
      <h3 style={{ marginBottom: 10 }}>🎁 إضافة حافز</h3>

      <input
        placeholder="اسم الموظف"
        value={employeeName}
        onChange={(e) => setEmployeeName(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="قيمة البونص"
        value={bonusAmount}
        onChange={e => setBonusAmount(e.target.value)}
        style={input}
      />

      <input
        placeholder="سبب"
        value={bonusNote}
        onChange={e => setBonusNote(e.target.value)}
        style={input}
      />

      <button style={btnGreen} onClick={handleAddBonus}>
        إضافة Bonus
      </button>
    </div>
    

    <div style={modernTableWrapper}>

  <table style={modernTable}>

    <thead>

      <tr>

        <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("employee")
  }
>
  الموظف {" "}

  {tableSort.key === "employee"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}

</th>

        <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("amount")
  }
>
  المبلغ {" "}

  {tableSort.key === "amount"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}

</th>

        <th style={modernTh}>
          الملاحظة
        </th>

        <th
  style={{
    ...modernTh,
    cursor: "pointer"
  }}

  onClick={() =>
    handleTableSort("date")
  }
>
  التاريخ {" "}

  {tableSort.key === "date"
    ? tableSort.direction === "asc"
      ? "⬆️"
      : "⬇️"
    : "↕️"}

</th>

        <th style={stickyActionTh}>
          Actions
        </th>

      </tr>

    </thead>

    <tbody>

      {employeeBonuses.length === 0 && (

  <tr>

    <td
      colSpan="5"
      style={emptyState}
    >
      📭 مفيش حوافز
    </td>

  </tr>

)}
      {sortItems(employeeBonuses).map(b => (

        <tr
          key={b.id}

          onMouseEnter={(e) => {
            e.currentTarget.style.background =
  "#f8fafc";

e.currentTarget.style.transform =
  "scale(0.998)";
          }}

          onMouseLeave={(e) => {
            e.currentTarget.style.background =
  "#fff";

e.currentTarget.style.transform =
  "scale(1)";
          }}

          style={{
            transition: "all 0.2s ease",
            cursor: "pointer"
          }}
        >

          <td style={modernTd}>
            👤 {b.employeeName}
          </td>

          <td style={modernTd}>
            <span style={{
              color: "#22c55e",
              fontWeight: 700
            }}>
              +{formatMoney(b.amount)} EGP
            </span>
          </td>

          <td style={modernTd}>
            {b.note || "—"}
          </td>

          <td style={modernTd}>
            {new Date(
              b.createdAt?.seconds
                ? b.createdAt.seconds * 1000
                : b.createdAt
            ).toLocaleString()}
          </td>

          <td style={stickyActionTd}>

            <button
              onClick={() => {

                setEditingBonus(b);

                setEditEmployeeName(
                  b.employeeName || ""
                );

                setEditAmount(
                  b.amount || ""
                );

                setEditNote(
                  b.note || ""
                );

              }}

              style={{
                ...actionBtn,
                background: "#dbeafe",
                color: "#1d4ed8"
              }}
            >
              ✏️ تعديل
            </button>

          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

  </>
)}
    
    </div>
      </div>
  );
}
const input = {
  width: "100%",
  marginBottom: 10,
  padding: "12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  outline: "none"
};

const card = {
  background: "#fff",
  padding: 14,
  borderRadius: 14,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  border: "1px solid #eee",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const btnRed = {
  width: "100%",
  background: "#ef4444",
  color: "#fff",
  padding: 10,
  border: "none",
  borderRadius: 10
};

const btnGreen = {
  width: "100%",
  background: "#22c55e",
  color: "#fff",
  padding: 10,
  border: "none",
  borderRadius: 10
};
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
const layout = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  gap: "20px",
  alignItems: "start"
};
const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "16px"
};
const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  border: "1px solid #eee",

  width: "100%"
};
const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "15px",
  marginBottom: "20px"
};

const summaryCard = {
  background: "#fff",
  padding: "16px",
  borderRadius: "16px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontWeight: "500",
  fontSize: "14px",
};
const tabsContainer = {
  display: "flex",
  gap: 12,
  marginBottom: 20
};

const tabBtn = {
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: "600",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};
const summaryTop = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13px",
  color: "#6b7280"
};
const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  overflowY: "auto",

  maxHeight: 300,

  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  border: "1px solid #eee"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 700
};

const th = {
  textAlign: "center",
  padding: 14,
  background: "#f8fafc",
  borderBottom: "1px solid #eee",
  fontSize: 14
};

const td = {
  textAlign: "center",
  padding: 14,
  borderBottom: "1px solid #f1f5f9",
  fontSize: 14
};
const chartCard = {
  background: "#fff",
  borderRadius: 20,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  border: "1px solid #eee"
};

const chartHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20
};
const chartsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(420px,1fr))",
  gap: "20px",
  marginBottom: "20px",
  alignItems: "start"
};
const modernTableWrapper = {
  width: "100%",

  overflowX: "auto",
  overflowY: "auto",

  maxHeight: "420px",

  background: "#fff",

  borderRadius: "18px",

  boxShadow:
    "0 6px 20px rgba(0,0,0,0.05)",

  border:
    "1px solid #f1f5f9",

  position: "relative"
};

const modernTable = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1100,
  textAlign: "center"
};

const modernTh = {
  position: "sticky",
  top: 0,
  zIndex: 5,

  background: "#f8fafc",

  padding: "14px 12px",

  fontSize: 14,

  fontWeight: "700",

  color: "#334155",
  boxShadow:
  "0 2px 8px rgba(0,0,0,0.04)",

  borderBottom:
    "1px solid #e2e8f0"
};

const modernTd = {
  padding: "14px 12px",

  borderBottom:
    "1px solid #f1f5f9",

  fontSize: 14,

  color: "#0f172a"
};
const stickyActionTd = {
  ...modernTd,

  position: "sticky",

  right: 0,

  background: "#fff",

  backdropFilter: "blur(4px)",

  zIndex: 10,

  minWidth: 170,

  boxShadow:
    "-6px 0 12px rgba(0,0,0,0.05)"
};

const stickyActionTh = {
  ...modernTh,

  position: "sticky",

  right: 0,

  zIndex: 6,

  background: "#f8fafc",

  minWidth: 170,

  boxShadow:
    "-4px 0 10px rgba(0,0,0,0.04)"
};

const actionBtn = {
  border: "none",

  padding: "8px 12px",

  borderRadius: "10px",

  cursor: "pointer",

  fontSize: 13,

  fontWeight: "600"
};

const emptyState = {
  textAlign: "center",

  padding: "40px",

  color: "#64748b",

  fontSize: "15px"
};
const editBtn = {
  flex: 1,
  border: "none",
  borderRadius: 10,
  padding: "8px",
  background: "#e0f2fe",
  cursor: "pointer"
};

const deleteBtn = {
  flex: 1,
  border: "none",
  borderRadius: 10,
  padding: "8px",
  background: "#fee2e2",
  cursor: "pointer"
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999
};

const modalBox = {
  width: "100%",
  maxWidth: 450,
  background: "#fff",
  borderRadius: 20,
  padding: 20
};