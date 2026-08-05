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
  createLoanService,
  updateLoanService,
} from "../services/expensesService";

import { isDateInRange } from "../../../utils/dateFilter";

export default function useLoans({
  branchId,
  role,
}) {
  const [loans, setLoans] = useState([]);
  const [branchEmployees, setBranchEmployees] = useState([]);

  const [selectedLoanEmployee, setSelectedLoanEmployee] =
    useState(null);

  const [loanAmount, setLoanAmount] = useState("");
  const [loanNote, setLoanNote] = useState("");

  const [editingLoan, setEditingLoan] =
    useState(null);

  const [editEmployeeData, setEditEmployeeData] =
    useState(null);

  const [editAmount, setEditAmount] =
    useState("");

  const [editNote, setEditNote] =
    useState("");

  const [isAddingLoan, setIsAddingLoan] =
    useState(false);

  const [isUpdatingLoan, setIsUpdatingLoan] =
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
            collection(db, "loans"),
            orderBy("createdAt", "desc")
          )
        : query(
            collection(db, "loans"),
            where("branchId", "==", branchId),
            orderBy("createdAt", "desc")
          );

    return onSnapshot(q, (snap) => {
      setLoans(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
  }, [branchId, role]);

  const handleAddLoan = async () => {
    if (isAddingLoan) return;

    if (!branchId || branchId === "all") {
      toast.error("اختر فرع محدد أولًا");
      return;
    }

    if (!selectedLoanEmployee || !loanAmount) {
      toast.error("اختر الموظف وأدخل المبلغ");
      return;
    }

    try {
      setIsAddingLoan(true);

      await createLoanService({
        employeeId: selectedLoanEmployee.id,
        employeeName:
          selectedLoanEmployee.name,
        amount: Number(loanAmount),
        note: loanNote,
        branchId,
      });

      setSelectedLoanEmployee(null);
      setLoanAmount("");
      setLoanNote("");

      toast.success("تم إضافة السلفة");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إضافة السلفة");
    } finally {
      setIsAddingLoan(false);
    }
  };

  const handleUpdateLoan = async () => {
    if (!editingLoan || isUpdatingLoan)
      return;

    try {
      setIsUpdatingLoan(true);

      await updateLoanService({
        id: editingLoan.id,
        employeeId: editEmployeeData.id,
        employeeName: editEmployeeData.name,
        amount: Number(editAmount),
        note: editNote,
      });

      setEditingLoan(null);

      toast.success("تم تعديل السلفة");
    } catch (err) {
      console.error(err);
      toast.error("حصل خطأ أثناء التعديل");
    } finally {
      setIsUpdatingLoan(false);
    }
  };
  const employeeLoans = useMemo(
  () => loans,
  [loans]
);

  const getFilteredLoans = ({
    selectedEmployee,
    fromDate,
    toDate,
  }) => {
    return employeeLoans.filter((loan) => {
      const employeeOk =
        selectedEmployee === "all" ||
        loan.employeeId === selectedEmployee;

      const dateOk =
        (!fromDate && !toDate) ||
        isDateInRange(
          loan.createdAt,
          fromDate,
          toDate
        );

      return employeeOk && dateOk;
    });
  };

  return {
    loans,
    employeeLoans,

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

    editAmount,
    setEditAmount,

    editNote,
    setEditNote,

    isAddingLoan,
    isUpdatingLoan,

    handleAddLoan,
    handleUpdateLoan,

    getFilteredLoans,
  };
}