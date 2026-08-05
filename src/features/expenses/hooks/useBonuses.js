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

import { isDateInRange } from "../../../utils/dateFilter";

export default function useBonuses({
  branchId,
  role,
}) {
  const [bonuses, setBonuses] = useState([]);
  const [branchEmployees, setBranchEmployees] = useState([]);

  const [selectedBonusEmployee, setSelectedBonusEmployee] =
    useState(null);

  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusNote, setBonusNote] = useState("");

  const [editingBonus, setEditingBonus] =
    useState(null);

  const [editEmployeeData, setEditEmployeeData] =
    useState(null);

  const [editAmount, setEditAmount] =
    useState("");

  const [editNote, setEditNote] =
    useState("");

  const [isAddingBonus, setIsAddingBonus] =
    useState(false);

  const [isUpdatingBonus, setIsUpdatingBonus] =
    useState(false);

  useEffect(() => {
    if (!branchId || branchId === "all") {
      setBranchEmployees([]);
      return;
    }

    const loadEmployees = async () => {
      try {
        const snap = await getDoc(
          doc(db, "branches", branchId)
        );

        if (!snap.exists()) {
          setBranchEmployees([]);
          return;
        }

        setBranchEmployees(
          snap.data().employees || []
        );
      } catch (err) {
        console.error(err);
        setBranchEmployees([]);
      }
    };

    loadEmployees();
  }, [branchId]);

  useEffect(() => {
    if (!branchId) return;

    const q =
      role === "owner" && branchId === "all"
        ? query(
            collection(db, "bonuses"),
            orderBy("createdAt", "desc")
          )
        : query(
            collection(db, "bonuses"),
            where("branchId", "==", branchId),
            orderBy("createdAt", "desc")
          );

    return onSnapshot(q, (snap) => {
      setBonuses(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
  }, [branchId, role]);

  const handleAddBonus = async () => {
    if (isAddingBonus) return;

    if (!branchId || branchId === "all") {
      toast.error("اختر فرع محدد أولًا");
      return;
    }

    if (!selectedBonusEmployee || !bonusAmount) {
      toast.error("اختر الموظف وأدخل المبلغ");
      return;
    }

    try {
      setIsAddingBonus(true);

      await createBonusService({
        employeeId: selectedBonusEmployee.id,
        employeeName: selectedBonusEmployee.name,
        amount: Number(bonusAmount),
        note: bonusNote,
        branchId,
      });

      setSelectedBonusEmployee(null);
      setBonusAmount("");
      setBonusNote("");

      toast.success("تم إضافة الحافز");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إضافة الحافز");
    } finally {
      setIsAddingBonus(false);
    }
  };

  const handleUpdateBonus = async () => {
    if (!editingBonus || isUpdatingBonus)
      return;

    try {
      setIsUpdatingBonus(true);

      await updateBonusService({
        id: editingBonus.id,
        employeeId: editEmployeeData.id,
        employeeName: editEmployeeData.name,
        amount: Number(editAmount),
        note: editNote,
      });

      setEditingBonus(null);

      toast.success("تم تعديل الحافز");
    } catch (err) {
      console.error(err);
      toast.error("حصل خطأ أثناء التعديل");
    } finally {
      setIsUpdatingBonus(false);
    }
  };
 const employeeBonuses = useMemo(
  () => bonuses,
  [bonuses]
);

  const getFilteredBonuses = ({
    selectedEmployee,
    fromDate,
    toDate,
  }) => {
    return employeeBonuses.filter((bonus) => {
      const employeeOk =
        selectedEmployee === "all" ||
        bonus.employeeId === selectedEmployee;

      const dateOk =
        (!fromDate && !toDate) ||
        isDateInRange(
          bonus.createdAt,
          fromDate,
          toDate
        );

      return employeeOk && dateOk;
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

    editingBonus,
    setEditingBonus,

    editEmployeeData,
    setEditEmployeeData,

    editAmount,
    setEditAmount,

    editNote,
    setEditNote,

    isAddingBonus,
    isUpdatingBonus,

    handleAddBonus,
    handleUpdateBonus,

    getFilteredBonuses,
  };
}