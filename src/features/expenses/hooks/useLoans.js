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
import {
  getTodayBusinessDate,
  getRecordBusinessDate,
  matchesBusinessDateRange,
} from "../utils/businessDate";

export default function useLoans({ branchId, role }) {
  const [loans, setLoans] = useState([]);
  const [branchEmployees, setBranchEmployees] = useState([]);
  const [selectedLoanEmployee, setSelectedLoanEmployee] = useState(null);

  const [loanAmount, setLoanAmount] = useState("");
  const [loanNote, setLoanNote] = useState("");
  const [businessDate, setBusinessDate] = useState(getTodayBusinessDate);

  const [editingLoan, setEditingLoan] = useState(null);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editBusinessDate, setEditBusinessDate] = useState("");

  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const [isUpdatingLoan, setIsUpdatingLoan] = useState(false);

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
      setLoans([]);
      return;
    }

    const q = role === "owner" && branchId === "all"
      ? query(collection(db, "loans"), orderBy("createdAt", "desc"))
      : query(
          collection(db, "loans"),
          where("branchId", "==", branchId),
          orderBy("createdAt", "desc")
        );

    return onSnapshot(
      q,
      (snap) => setLoans(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (error) => {
        console.error("Loans snapshot error:", error);
        toast.error("حدث خطأ أثناء تحميل السلف");
      }
    );
  }, [branchId, role]);

  useEffect(() => {
    setEditBusinessDate(editingLoan ? getRecordBusinessDate(editingLoan) : "");
  }, [editingLoan]);

  const handleAddLoan = async () => {
    if (isAddingLoan) return;
    if (!branchId || branchId === "all") return toast.error("اختر فرع محدد أولًا");
    if (!selectedLoanEmployee || !loanAmount) return toast.error("اختر الموظف وأدخل المبلغ");
    if (!Number.isFinite(Number(loanAmount)) || Number(loanAmount) <= 0) return toast.error("أدخل مبلغًا صحيحًا");
    if (!businessDate) return toast.error("اختر تاريخ العملية");

    try {
      setIsAddingLoan(true);
      await createLoanService({
        employeeId: selectedLoanEmployee.id,
        employeeName: selectedLoanEmployee.name,
        amount: Number(loanAmount),
        note: loanNote,
        branchId,
        businessDate,
      });
      setSelectedLoanEmployee(null);
      setLoanAmount("");
      setLoanNote("");
      setBusinessDate(getTodayBusinessDate());
      toast.success("تم إضافة السلفة");
    } catch (err) {
      console.error("Create loan error:", err);
      toast.error(err?.message || "حدث خطأ أثناء إضافة السلفة");
    } finally {
      setIsAddingLoan(false);
    }
  };

  const handleUpdateLoan = async () => {
    if (!editingLoan || isUpdatingLoan) return;
    if (!editEmployeeData) return toast.error("اختر الموظف");
    if (!Number.isFinite(Number(editAmount)) || Number(editAmount) <= 0) return toast.error("أدخل مبلغًا صحيحًا");
    if (!editBusinessDate) return toast.error("اختر تاريخ العملية");

    try {
      setIsUpdatingLoan(true);
      await updateLoanService({
        id: editingLoan.id,
        employeeId: editEmployeeData.id,
        employeeName: editEmployeeData.name,
        amount: Number(editAmount),
        note: editNote,
        businessDate: editBusinessDate,
      });
      setEditingLoan(null);
      setEditBusinessDate("");
      toast.success("تم تعديل السلفة");
    } catch (err) {
      console.error("Update loan error:", err);
      toast.error(err?.message || "حصل خطأ أثناء التعديل");
    } finally {
      setIsUpdatingLoan(false);
    }
  };

  const employeeLoans = useMemo(() => loans, [loans]);

  const getFilteredLoans = ({ selectedEmployee, fromDate, toDate }) => {
    return employeeLoans.filter((loan) => {
      const employeeOk =
        selectedEmployee === "all" ||
        String(loan.employeeName || "").trim() === String(selectedEmployee || "").trim() ||
        String(loan.employeeId || "").trim() === String(selectedEmployee || "").trim();
      return employeeOk && matchesBusinessDateRange(loan, fromDate, toDate);
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
    businessDate,
    setBusinessDate,
    editingLoan,
    setEditingLoan,
    editEmployeeData,
    setEditEmployeeData,
    editAmount,
    setEditAmount,
    editNote,
    setEditNote,
    editBusinessDate,
    setEditBusinessDate,
    isAddingLoan,
    isUpdatingLoan,
    handleAddLoan,
    handleUpdateLoan,
    getFilteredLoans,
  };
}
