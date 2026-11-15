import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import toast from "react-hot-toast";

import { db } from "../../../firebase";

import {
  createExpenseService,
  updateExpenseService,
} from "../services/expensesService";

import {
  getTodayBusinessDate,
  getRecordBusinessDate,
} from "../utils/businessDate";

export default function useExpenses({ branchId, role, t }) {
  const [expenses, setExpenses] = useState([]);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [businessDate, setBusinessDate] = useState(
    getTodayBusinessDate
  );

  const [category, setCategory] = useState("إيجار");
  const [customCategory, setCustomCategory] = useState("");
  const [savedCategories, setSavedCategories] = useState([]);

  const [editingExpense, setEditingExpense] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCategory, setEditCategory] = useState("عام");
  const [editBusinessDate, setEditBusinessDate] = useState("");

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);

  // =========================================
  // LOAD EXPENSES
  // =========================================

useEffect(() => {
  if (!branchId) {
    setExpenses([]);
    return;
  }

  console.log("EXPENSES QUERY:", {
    branchId,
    role,
    isOwner: role === "owner",
  });

  const expensesQuery =
    role === "owner" && branchId === "all"
      ? query(
          collection(db, "expenses"),
          orderBy("createdAt", "desc")
        )
      : query(
          collection(db, "expenses"),
          where("branchId", "==", branchId),
          orderBy("createdAt", "desc")
        );

  const unsubscribe = onSnapshot(
    expensesQuery,
    (snap) => {
      const rows = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      console.log("EXPENSES SNAPSHOT:", {
        count: rows.length,
        branchId,
      });

      setExpenses(rows);
    },
    (error) => {
      console.error("EXPENSES SNAPSHOT ERROR:", {
        code: error.code,
        message: error.message,
      });

      toast.error("حدث خطأ أثناء تحميل المصروفات");
    }
  );

  return () => unsubscribe();
}, [branchId, role]);

  // =========================================
  // SAVED CATEGORIES
  // =========================================

  useEffect(() => {
    const existingCategories = expenses
      .map((expense) => expense.category)
      .filter(Boolean);

    setSavedCategories([
      ...new Set(existingCategories),
    ]);
  }, [expenses]);

  // =========================================
  // EDIT BUSINESS DATE
  // =========================================

  useEffect(() => {
    setEditBusinessDate(
      editingExpense
        ? getRecordBusinessDate(editingExpense)
        : ""
    );
  }, [editingExpense]);

  // =========================================
  // ADD EXPENSE
  // =========================================

  const handleAddExpense = async () => {
    if (isAddingExpense) return;

    if (!branchId || branchId === "all") {
      toast.error("اختر فرع محدد أولًا");
      return;
    }

    if (
      !amount ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      toast.error(t("expenses.enterAmount"));
      return;
    }

    if (!businessDate) {
      toast.error("اختر تاريخ العملية");
      return;
    }

    const finalCategory =
      category === "➕ تصنيف جديد"
        ? customCategory.trim()
        : category;

    if (!finalCategory) {
      toast.error("اكتب التصنيف");
      return;
    }

    try {
      setIsAddingExpense(true);

      console.log("CREATE EXPENSE PAYLOAD:", {
        amount: Number(amount),
        note,
        category: finalCategory,
        branchId,
        businessDate,
      });

      const result = await createExpenseService({
        amount: Number(amount),
        note,
        category: finalCategory,
        branchId,
        businessDate,
      });

      console.log("CREATE EXPENSE RESULT:", result);

      setAmount("");
      setNote("");
      setBusinessDate(getTodayBusinessDate());
      setCategory("إيجار");
      setCustomCategory("");

      toast.success("تم إضافة المصروف");
    } catch (err) {
      console.error("CREATE EXPENSE ERROR:", {
        code: err?.code,
        message: err?.message,
        details: err?.details,
        branchId,
        businessDate,
      });

      toast.error(
        err?.message || t("common.error")
      );
    } finally {
      setIsAddingExpense(false);
    }
  };

  // =========================================
  // UPDATE EXPENSE
  // =========================================

  const handleUpdateExpense = async () => {
    if (!editingExpense || isUpdatingExpense) return;

    if (
      !editAmount ||
      !Number.isFinite(Number(editAmount)) ||
      Number(editAmount) <= 0
    ) {
      toast.error(t("expenses.enterAmount"));
      return;
    }

    if (!editBusinessDate) {
      toast.error("اختر تاريخ العملية");
      return;
    }

    const finalCategory =
      editCategory === "➕ تصنيف جديد"
        ? customCategory.trim()
        : editCategory;

    if (!finalCategory) {
      toast.error("اكتب التصنيف");
      return;
    }

    try {
      setIsUpdatingExpense(true);

      console.log("UPDATE EXPENSE PAYLOAD:", {
        id: editingExpense.id,
        amount: Number(editAmount),
        category: finalCategory,
        businessDate: editBusinessDate,
      });

      const result = await updateExpenseService({
        id: editingExpense.id,
        amount: Number(editAmount),
        note: editNote,
        category: finalCategory,
        businessDate: editBusinessDate,
      });

      console.log("UPDATE EXPENSE RESULT:", result);

      setEditingExpense(null);
      setEditBusinessDate("");

      toast.success("تم تعديل المصروف");
    } catch (err) {
      console.error("UPDATE EXPENSE ERROR:", {
        code: err?.code,
        message: err?.message,
        details: err?.details,
        expenseId: editingExpense.id,
        businessDate: editBusinessDate,
      });

      toast.error(
        err?.message || "حصل خطأ أثناء التعديل"
      );
    } finally {
      setIsUpdatingExpense(false);
    }
  };

  // =========================================
  // CATEGORIES
  // =========================================

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
      "➕ تصنيف جديد",
    ]),
  ];

  const filterCategories = expenseCategories.filter(
    (item) => item !== "➕ تصنيف جديد"
  );

  // =========================================
  // RETURN
  // =========================================

    return {
    expenses,

    amount,
    setAmount,

    note,
    setNote,

    category,
    setCategory,

    customCategory,
    setCustomCategory,

    businessDate,
    setBusinessDate,

    editingExpense,
    setEditingExpense,

    editAmount,
    setEditAmount,

    editNote,
    setEditNote,

    editCategory,
    setEditCategory,

    editBusinessDate,
    setEditBusinessDate,

    isAddingExpense,
    isUpdatingExpense,

    handleAddExpense,
    handleUpdateExpense,

    expenseCategories,
    filterCategories,
  };
}