import { useState, useEffect } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { serverTimestamp } from "firebase/firestore";
import { useTranslate } from "../useTranslate";
export default function Expenses() {
  const t = useTranslate();
  const { user } = useAuth();
  const { selectedBranch } = useApp();
  const [employeeName, setEmployeeName] = useState("");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
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
    user?.role === "admin"
      ? selectedBranch
      : user?.branchId;

  // 📥 fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!branchToUse || branchToUse === "all") return;

      const q = query(
        collection(db, "expenses"),
        where("branchId", "==", branchToUse)
      );

      const snap = await getDocs(q);

      setExpenses(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    };

    fetchExpenses();
  }, [branchToUse]);
  useEffect(() => {
  if (!branchToUse || branchToUse === "all") return;

  const fetchLoans = async () => {
    const snap = await getDocs(
      query(collection(db, "loans"), where("branchId", "==", branchToUse))
    );

    setLoans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchBonus = async () => {
    const snap = await getDocs(
      query(collection(db, "bonus"), where("branchId", "==", branchToUse))
    );

    setBonuses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  fetchLoans();
  fetchBonus();
}, [branchToUse]);
const handleAddLoan = async () => {
  if (!employeeName || !loanAmount) {
  alert("اكتب اسم الموظف والمبلغ");
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

  const snap = await getDocs(
    query(collection(db, "loans"), where("branchId", "==", branchToUse))
  );

  setLoans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};
const handleAddBonus = async () => {
  if (!employeeName || !bonusAmount) {
  alert("اكتب اسم الموظف والمبلغ");
  return;
}

await addDoc(collection(db, "bonus"), {
  employeeName,
  amount: Number(bonusAmount),
  note: bonusNote,
  branchId: branchToUse,
  createdAt: serverTimestamp()
});

  setEmployeeName("");
  setBonusAmount("");
  setBonusNote("");

  const snap = await getDocs(
    query(collection(db, "bonus"), where("branchId", "==", branchToUse))
  );

  setBonuses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};
  // ➕ add expense
  const handleAddExpense = async () => {
    if (!branchToUse || branchToUse === "all") {
      alert(t("branches.select"));
      return;
    }

    if (!amount) {
      alert(t("expenses.enterAmount"));
      return;
    }

    try {
      await addDoc(collection(db, "expenses"), {
        amount: Number(amount),
        note,
        branchId: branchToUse,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      setAmount("");
      setNote("");

      // refresh
      const snap = await getDocs(
        query(collection(db, "expenses"), where("branchId", "==", branchToUse))
      );

      setExpenses(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    } catch (err) {
      alert(t("common.error"));
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


  return (
    <div style={page}>
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
          onClick={() => setTab(t.key)}
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
<div style={summaryGrid}>

  {/* 💸 Expenses */}
  <div
    style={{ ...summaryCard, borderLeft: "5px solid #ef4444" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
    }}
  >
    <div style={summaryTop}>
      <span>💸 اجمالي المصروفات</span>
      <span>📉</span>
    </div>
    <strong>{formatMoney(totalExpenses)} EGP</strong>
  </div>

  {/* 🧾 Loans */}
  <div
    style={{ ...summaryCard, borderLeft: "5px solid #f59e0b" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
    }}
  >
    <div style={summaryTop}>
      <span>🧾 اجمالي السلف</span>
      <span>💳</span>
    </div>
    <strong>{formatMoney(totalLoans)} EGP</strong>
  </div>

  {/* 🎁 Bonus */}
  <div
    style={{ ...summaryCard, borderLeft: "5px solid #22c55e" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
    }}
  >
    <div style={summaryTop}>
      <span>🎁 اجمالي الحوافز</span>
      <span>🚀</span>
    </div>
    <strong>{formatMoney(totalBonus)} EGP</strong>
  </div>

</div>
      {/* ⚠️ اختار فرع */}
      {user?.role === "admin" && !selectedBranch && (
        <p style={{ color: theme.colors.muted }}>
          {t("branches.select")}
        </p>
      )}

      {/* ➕ Add */}
      {tab === "expenses" && (
  <div style={layout}>

    {/* 💸 FORM */}
    <div style={box}>
      <h3 style={{ marginBottom: 10 }}>💸 إضافة مصروف</h3>

      <input
        type="number"
        placeholder={t("expenses.amount")}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={input}
      />

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

    {/* 🧱 GRID */}
    <div style={grid}>
      {expenses.length === 0 && (
       <p style={{ color: "#9ca3af", textAlign: "center" }}>
        📭 مفيش بيانات في الفترة دي
      </p>
      )}

      {expenses
      .filter(e => isInRange(e.createdAt))
      .map(e => (
        <div key={e.id} style={card}>
          <div style={{ fontWeight: "600" }}>
            💸 {e.amount} EGP
            
          </div>

          <div style={{ fontSize: 12, color: "#777" }}>
            {e.note || "—"}
          </div>

          <div style={{ fontSize: 11, color: "#aaa" }}>
            {new Date(
              e.createdAt?.seconds
                ? e.createdAt.seconds * 1000
                : e.createdAt
            ).toLocaleString()}
          </div>
        </div>
      ))}
    </div>

  </div>
)}
{tab === "loans" && (
  <div style={layout}>
    
    {/* 🧾 FORM */}
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

    {/* 🧱 GRID */}
    <div style={grid}>
      {loans
      .filter(l => isInRange(l.createdAt))
      .map(l => (
        <div key={l.id} style={card}>
          <div style={{ fontWeight: "600" }}>
            👤 {l.employeeName}
          </div>

          <div style={{ color: "#ef4444", fontWeight: "600" }}>
            -{l.amount} EGP
          </div>

          <div style={{ fontSize: 12, color: "#777" }}>
            {l.note || "—"}
          </div>

          <div style={{ fontSize: 11, color: "#aaa" }}>
            {new Date(
              l.createdAt?.seconds
                ? l.createdAt.seconds * 1000
                : l.createdAt
            ).toLocaleString()}
          </div>
        </div>
      ))}
    </div>

  </div>
)}
 
{tab === "bonus" && (
  <div style={layout}>
    
    {/* 🎁 FORM */}
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

    {/* 🧱 GRID */}
    <div style={grid}>
      {bonuses
      .filter(b => isInRange(b.createdAt))
      .map(b => (
        <div key={b.id} style={card}>
          <div style={{ fontWeight: "600" }}>
            👤 {b.employeeName}
          </div>

          <div style={{ color: "#22c55e", fontWeight: "600" }}>
            +{b.amount} EGP
          </div>

          <div style={{ fontSize: 12, color: "#777" }}>
            {b.note || "—"}
          </div>

          <div style={{ fontSize: 11, color: "#aaa" }}>
            {new Date(
              b.createdAt?.seconds
                ? b.createdAt.seconds * 1000
                : b.createdAt
            ).toLocaleString()}
          </div>
        </div>
      ))}
    </div>

  </div>
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
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  transition: "0.2s",
  cursor: "pointer"
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
  padding: "0 20px"
};
const layout = {
  display: "grid",
  gridTemplateColumns: "420px 1fr",
  gap: "20px",
  alignItems: "start"
};
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "12px"
};
const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  border: "1px solid #eee"
};
const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "15px",
  marginBottom: "20px"
};

const summaryCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontWeight: "500",
  fontSize: "14px",
  transition: "0.2s",
  cursor: "pointer"
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
  transition: "0.2s",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};
const summaryTop = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13px",
  color: "#6b7280"
};