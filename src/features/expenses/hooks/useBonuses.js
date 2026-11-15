import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

import toast from "react-hot-toast";

import { db } from "../../../firebase";
import {
  createBonusService,
  updateBonusService,
} from "../services/expensesService";
import {
  getTodayBusinessDate,
  getRecordBusinessDate,
  isValidBusinessDate,
  matchesBusinessDateRange,
} from "../utils/businessDate";

export default function useBonuses({ branchId, role }) {
  const [bonuses, setBonuses] = useState([]);
  const [branchEmployees, setBranchEmployees] = useState([]);

  const [selectedBonusEmployee, setSelectedBonusEmployee] = useState(null);

  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusNote, setBonusNote] = useState("");
  const [businessDate, setBusinessDate] = useState(getTodayBusinessDate);

  const [editingBonus, setEditingBonus] = useState(null);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editBusinessDate, setEditBusinessDate] = useState("");

  const [isAddingBonus, setIsAddingBonus] = useState(false);
  const [isUpdatingBonus, setIsUpdatingBonus] = useState(false);

  useEffect(() => {
    if (!branchId || branchId === "all") {
      setBranchEmployees([]);
      return;
    }

    let cancelled = false;
    const loadEmployees = async () => {
      try {
        const snap = await getDoc(doc(db, "branches", branchId));
        if (cancelled) return;
        setBranchEmployees(snap.exists() ? snap.data().employees || [] : []);
      } catch (err) {
        console.error("Load branch employees error:", err);
        if (!cancelled) setBranchEmployees([]);
      }
    };

    loadEmployees();
    return () => { cancelled = true; };
  }, [branchId]);

  useEffect(() => {
    if (!branchId) {
      setBonuses([]);
      return;
    }

    const q = role === "owner" && branchId === "all"
      ? query(collection(db, "bonuses"), orderBy("createdAt", "desc"))
      : query(
          collection(db, "bonuses"),
          where("branchId", "==", branchId),
          orderBy("createdAt", "desc")
        );

    return onSnapshot(
      q,
      (snap) => setBonuses(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (error) => {
        console.error("Bonuses snapshot error:", error);
        toast.error("حدث خطأ أثناء تحميل الحوافز");
      }
    );
  }, [branchId, role]);

  useEffect(() => {
    setEditBusinessDate(editingBonus ? getRecordBusinessDate(editingBonus) : "");
  }, [editingBonus]);

  const handleAddBonus = async () => {
    if (isAddingBonus) return;
    if (!branchId || branchId === "all") return toast.error("اختر فرع محدد أولًا");
    if (!selectedBonusEmployee || !bonusAmount) return toast.error("اختر الموظف وأدخل المبلغ");
    if (!Number.isFinite(Number(bonusAmount)) || Number(bonusAmount) <= 0) return toast.error("أدخل مبلغًا صحيحًا");
    if (!isValidBusinessDate(businessDate)) return toast.error("اختر تاريخ عملية صحيحًا، ولا يمكن اختيار تاريخ مستقبلي");

    try {
      setIsAddingBonus(true);
      await createBonusService({
        employeeId: selectedBonusEmployee.id,
        employeeName: selectedBonusEmployee.name,
        amount: Number(bonusAmount),
        note: bonusNote,
        branchId,
        businessDate,
      });
      setSelectedBonusEmployee(null);
      setBonusAmount("");
      setBonusNote("");
      setBusinessDate(getTodayBusinessDate());
      toast.success("تم إضافة الحافز");
    } catch (err) {
      console.error("Create bonus error:", err);
      toast.error(err?.message || "حدث خطأ أثناء إضافة الحافز");
    } finally {
      setIsAddingBonus(false);
    }
  };

  const handleUpdateBonus = async () => {
    if (!editingBonus || isUpdatingBonus) return;
    if (!editEmployeeData) return toast.error("اختر الموظف");
    if (!Number.isFinite(Number(editAmount)) || Number(editAmount) <= 0) return toast.error("أدخل مبلغًا صحيحًا");
    if (!isValidBusinessDate(editBusinessDate)) return toast.error("اختر تاريخ عملية صحيحًا، ولا يمكن اختيار تاريخ مستقبلي");

    try {
      setIsUpdatingBonus(true);
      await updateBonusService({
        id: editingBonus.id,
        employeeId: editEmployeeData.id,
        employeeName: editEmployeeData.name,
        amount: Number(editAmount),
        note: editNote,
        businessDate: editBusinessDate,
      });
      setEditingBonus(null);
      setEditBusinessDate("");
      toast.success("تم تعديل الحافز");
    } catch (err) {
      console.error("Update bonus error:", err);
      toast.error(err?.message || "حصل خطأ أثناء تعديل الحافز");
    } finally {
      setIsUpdatingBonus(false);
    }
  };

  const employeeBonuses = useMemo(() => bonuses, [bonuses]);

  const getFilteredBonuses = ({ selectedEmployee, fromDate, toDate }) => {
    return employeeBonuses.filter((bonus) => {
      const employeeOk = selectedEmployee === "all" || bonus.employeeId === selectedEmployee;
      return employeeOk && matchesBusinessDateRange(bonus, fromDate, toDate);
    });
  };

  return {
    bonuses,
    employeeBonuses,
    branchEmployees,
    selectedBonusEmployee,
    setSelectedBonusEmployee,
    bonusAmount,
    setBonusAmount,
    bonusNote,
    setBonusNote,
    businessDate,
    setBusinessDate,
    editingBonus,
    setEditingBonus,
    editEmployeeData,
    setEditEmployeeData,
    editAmount,
    setEditAmount,
    editNote,
    setEditNote,
    editBusinessDate,
    setEditBusinessDate,
    isAddingBonus,
    isUpdatingBonus,
    handleAddBonus,
    handleUpdateBonus,
    getFilteredBonuses,
  };
}
