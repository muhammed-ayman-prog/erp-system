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
import { createExpenseService, updateExpenseService } from "../services/expensesService";

export default function useExpenses({
  branchId,
  role,
  t,
}) {
  const [expenses, setExpenses] = useState([]);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [category, setCategory] = useState("إيجار");
  const [customCategory, setCustomCategory] = useState("");

  const [savedCategories, setSavedCategories] = useState([]);

  const [editingExpense, setEditingExpense] = useState(null);

  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCategory, setEditCategory] = useState("عام");

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);

  useEffect(() => {
    if (!branchId) return;

    const q =
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

    return onSnapshot(q, (snap) => {
      setExpenses(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
  }, [branchId, role]);

  useEffect(() => {
    const existingCategories = expenses
      .map((e) => e.category)
      .filter(Boolean);

    setSavedCategories([...new Set(existingCategories)]);
  }, [expenses]);

  const handleAddExpense = async () => {
    if (isAddingExpense) return;

    if (!branchId || branchId === "all") {
      toast.error("اختر فرع محدد أولًا");
      return;
    }

    if (!amount) {
      toast.error(t("expenses.enterAmount"));
      return;
    }

    try {
      setIsAddingExpense(true);

      const finalCategory =
        category === "➕ تصنيف جديد"
          ? customCategory
          : category;

      if (!finalCategory) {
        toast.error("اكتب التصنيف");
        return;
      }

      await createExpenseService({
        amount: Number(amount),
        note,
        category: finalCategory,
        branchId,
      });

      setAmount("");
      setNote("");
      setCategory("إيجار");
      setCustomCategory("");

      toast.success("تم إضافة المصروف");
    } catch (err) {
      console.error(err);
      toast.error(t("common.error"));
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense || isUpdatingExpense) return;

    try {
      setIsUpdatingExpense(true);

      const finalCategory =
        editCategory === "➕ تصنيف جديد"
          ? customCategory
          : editCategory;

      await updateExpenseService({
        id: editingExpense.id,
        amount: Number(editAmount),
        note: editNote,
        category: finalCategory,
      });

      setEditingExpense(null);

      toast.success("تم تعديل المصروف");
    } catch {
      toast.error("حصل خطأ أثناء التعديل");
    } finally {
      setIsUpdatingExpense(false);
    }
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
      "➕ تصنيف جديد",
    ]),
  ];

  const filterCategories = expenseCategories.filter(
    (c) => c !== "➕ تصنيف جديد"
  );

 

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

  };
}