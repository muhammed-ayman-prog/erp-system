import { useState, useEffect } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { serverTimestamp } from "firebase/firestore";

export default function Expenses() {
  const { user } = useAuth();
  const { selectedBranch } = useApp();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [expenses, setExpenses] = useState([]);

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

  // ➕ add expense
  const handleAddExpense = async () => {
    if (!branchToUse || branchToUse === "all") {
      alert("اختار فرع ❗");
      return;
    }

    if (!amount) {
      alert("اكتب المبلغ ❗");
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
      alert("في مشكلة ❌");
    }
  };

  return (
    <div style={{
      padding: "25px",
      background: theme.colors.background,
      minHeight: "100vh"
    }}>

      <h1 style={{ marginBottom: "20px" }}>Expenses 💸</h1>

      {/* ⚠️ اختار فرع */}
      {user?.role === "admin" && !selectedBranch && (
        <p style={{ color: theme.colors.muted }}>
          اختار فرع من فوق 👆
        </p>
      )}

      {/* ➕ Add */}
      <div style={{
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        padding: "20px",
        borderRadius: "20px",
        marginBottom: "20px",
        maxWidth: "400px"
      }}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "10px",
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.card,
            color: theme.colors.text
          }}
        />

        <input
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "10px",
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.card,
            color: theme.colors.text
          }}
        />

        <button
          onClick={handleAddExpense}
          style={{
            width: "100%",
            background: theme.colors.danger,
            color: "#fff",
            padding: "10px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Add Expense
        </button>
      </div>

      {/* 📊 List */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        {expenses.length === 0 && (
          <p style={{ color: theme.colors.muted }}>
            No expenses yet
          </p>
        )}

        {expenses.map((e) => (
          <div
            key={e.id}
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              padding: "12px",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ fontWeight: "600" }}>
                {e.amount} EGP
              </div>
              <div style={{ fontSize: "12px", color: theme.colors.muted }}>
                {e.note || "—"}
              </div>
            </div>

            <div style={{ fontSize: "12px", color: theme.colors.muted }}>
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
  );
}