import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";

import { httpsCallable } from "firebase/functions";

import {
  BadgeDollarSign,
  Banknote,
  CalendarDays,
  CreditCard,
  RotateCcw,
  Smartphone,
  TrendingUp,
  Wallet,
  Receipt,
  Gift,
  Landmark,
  AlertCircle
} from "lucide-react";

import { db, functions } from "../firebase";

import { useAuth } from "../store/useAuth";

import { useApp } from "../store/useApp";

import { useTranslate } from "../useTranslate";

import { theme } from "../theme";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AppButton from "../components/ui/AppButton";
import { ArrowRight } from "lucide-react";
// ======================================================
// HELPERS
// ======================================================

const formatMoney = (num) => {

  return new Intl.NumberFormat(
    "en-US"
  ).format(Number(num || 0));

};

const BUSINESS_DAY_CUTOFF = 3;

const getBusinessDate = (
  date = new Date()
) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(date));

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  const d = new Date(Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day)
  ));

  if (Number(values.hour) < BUSINESS_DAY_CUTOFF) {
    d.setUTCDate(d.getUTCDate() - 1);
  }

  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  );
};

const isBusinessDay = (
  timestamp
) => {

  if (!timestamp?.seconds)
    return false;

  const itemDate =
    new Date(
      timestamp.seconds *
        1000
    );

  const businessDate =
    getBusinessDate();

  const compareDate =
    getBusinessDate(
      itemDate
    );

  return (

    compareDate.getDate() ===
      businessDate.getDate() &&

    compareDate.getMonth() ===
      businessDate.getMonth() &&

    compareDate.getFullYear() ===
      businessDate.getFullYear()

  );

};
const getBusinessDateKey = (
  date = new Date()
) => {

  const d =
    getBusinessDate(date);

  return `${d.getFullYear()}-${
    d.getMonth() + 1
  }-${d.getDate()}`;

};
const toInputDate = (date = new Date()) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toStoredBusinessDateKey = (inputDate) => {
  if (!inputDate) return "";

  const [year, month, day] = inputDate.split("-");

  return `${Number(year)}-${Number(month)}-${Number(day)}`;
};

const getTimestampDate = (value) => {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }

  const date = value instanceof Date
    ? value
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const isSelectedBusinessDay = (value, selectedDate) => {
  const date = getTimestampDate(value);

  if (!date || !selectedDate) return false;

  const businessDate = getBusinessDate(date);

  return toInputDate(businessDate) === selectedDate;
};
// مطابقة تاريخ العملية مع دعم السجلات القديمة
const matchesSelectedBusinessDate = (record, selectedDate) => {
  if (!record || !selectedDate) return false;

  // السجلات الجديدة تعتمد على تاريخ العملية
  if (
    typeof record.businessDate === "string" &&
    record.businessDate.trim()
  ) {
    return record.businessDate === selectedDate;
  }

  // السجلات القديمة تعتمد على createdAt
  return isSelectedBusinessDay(
    record.createdAt,
    selectedDate
  );
};


const isSaleOnSelectedDate = (sale, selectedDate) => {
  // أولاً: الاعتماد على تاريخ العمل الجديد
  if (
    typeof sale.businessDate === "string" &&
    sale.businessDate.trim()
  ) {
    return sale.businessDate === selectedDate;
  }

  // توافق مع الفواتير القديمة
  const saleDate = getTimestampDate(sale.saleDate);
  const createdAt = getTimestampDate(sale.createdAt);

  if (saleDate && createdAt) {
    const difference = Math.abs(
      saleDate.getTime() - createdAt.getTime()
    );

    // لو تاريخ البيع مختلف عن وقت التسجيل،
    // فغالباً ده تاريخ اختاره الـ Owner يدوياً
    if (difference > 60 * 1000) {
      return toInputDate(saleDate) === selectedDate;
    }
  }

  // الفواتير العادية القديمة
  return isSelectedBusinessDay(
    saleDate || sale.createdAt,
    selectedDate
  );
};

const formatDate = (
  timestamp,
  lang
) => {

  if (!timestamp?.seconds)
    return "-";

  const date =
    new Date(
      timestamp.seconds * 1000
    );

  return date.toLocaleDateString(

    lang === "ar"
      ? "ar-EG"
      : "en-GB",

    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }

  ) +

  " - " +

  date.toLocaleTimeString(

    lang === "ar"
      ? "ar-EG"
      : "en-US",

    {
      hour: "2-digit",
      minute: "2-digit"
    }

  );

};

const cardStyle = {
  background:
    theme.colors.card,

  border:
    `1px solid ${theme.colors.border}`,

  borderRadius: 24,

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.05)"
};

// ======================================================
// PAGE
// ======================================================

export default function DailyClosing() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    selectedBranch
  } = useApp();

const {
  lang,
  t
} = useTranslate();

const isMobile =

  typeof window !==
    "undefined"

    &&

  window.matchMedia(
    "(max-width: 768px)"
  ).matches;

  const [loading, setLoading] =
    useState(true);

  const [sales, setSales] =
    useState([]);

  const [refunds, setRefunds] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [loans, setLoans] =
    useState([]);

  const [bonuses, setBonuses] =
    useState([]);

  const [branches, setBranches] =
    useState([]);
  const [actualCash, setActualCash] =
  useState("");
  const [actualVisa, setActualVisa] = useState("");

const [actualInstapay, setActualInstapay] = useState("");

const [closingNotes, setClosingNotes] =
useState("");

const [saving, setSaving] =
useState(false);
const [
  alreadyClosed,
  setAlreadyClosed
] = useState(false);
const [closingStatusLoaded, setClosingStatusLoaded] = useState(false);
const [wasReopened, setWasReopened] = useState(false);
const [reopening, setReopening] = useState(false);

  const isOwner =
    user?.role === "owner";

  const branchToUse =

    isOwner
      ? selectedBranch
      : user?.branchIds?.[0];

  // ======================================================
  // FETCH BRANCHES
  // ======================================================
  const [selectedBusinessDate, setSelectedBusinessDate] = useState(
  () => toInputDate(getBusinessDate())
);

useEffect(() => {
  if (!branchToUse || branchToUse === "all" || !selectedBusinessDate) {
    setClosingStatusLoaded(false);
    setAlreadyClosed(false);
    setWasReopened(false);
    return;
  }

  // Lock inputs until Firestore confirms the closing status.
  setClosingStatusLoaded(false);

  const businessDate = toStoredBusinessDateKey(selectedBusinessDate);

  const q = query(
    collection(db, "dailyClosings"),
    where("branchId", "==", branchToUse),
    where("businessDate", "==", businessDate)
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      const activeClosings = snap.docs.filter(
        (doc) => doc.data()?.status !== "reopened"
      );

      setAlreadyClosed(activeClosings.length > 0);

      setWasReopened(
        snap.docs.some((doc) => doc.data()?.status === "reopened")
      );

      // Restore saved values if the day is closed.
      if (activeClosings.length > 0) {
        const savedClosing = activeClosings[0].data();

        setActualCash(String(savedClosing.actualCash ?? ""));
        setActualVisa(String(savedClosing.actualVisa ?? ""));
        setActualInstapay(String(savedClosing.actualInstapay ?? ""));
        setClosingNotes(savedClosing.notes || "");
      } else {
        // Clear values when the day is reopened.
        setActualCash("");
        setActualVisa("");
        setActualInstapay("");
        setClosingNotes("");
      }

      // Firestore confirmed the closing status.
      setClosingStatusLoaded(true);
    },
    (error) => {
      console.error("Daily closing status error:", error);

      // Keep inputs locked if status cannot be verified.
      setClosingStatusLoaded(false);

      toast.error(
        lang === "ar"
          ? "تعذر التحقق من حالة التقفيل"
          : "Could not check closing status"
      );
    }
  );

  return () => unsub();
}, [branchToUse, selectedBusinessDate, lang]);


  // ======================================================
  // SALES
  // ======================================================

  useEffect(() => {

    if (!branchToUse)
      return;

    const q =

      isOwner &&
      branchToUse === "all"

        ? query(
            collection(db, "sales"),
            orderBy(
              "createdAt",
              "desc"
            )
          )

        : query(
            collection(db, "sales"),

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

    const unsub = onSnapshot(
      q,
      snap => {

        setSales(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

        setLoading(false);

      }
    );

    return () => unsub();

  }, [
    branchToUse,
    isOwner
  ]);

  // ======================================================
  // RETURNS
  // ======================================================

  useEffect(() => {

    if (!branchToUse)
      return;

    const q =

      isOwner &&
      branchToUse === "all"

        ? query(
            collection(db, "returns"),
            orderBy(
              "refundDate",
              "desc"
            )
          )

        : query(
            collection(db, "returns"),

            where(
              "branchId",
              "==",
              branchToUse
            ),

            orderBy(
              "refundDate",
              "desc"
            )
          );

    const unsub = onSnapshot(
      q,
      snap => {

        setRefunds(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      }
    );

    return () => unsub();

  }, [
    branchToUse,
    isOwner
  ]);

  // ======================================================
  // EXPENSES
  // ======================================================

  useEffect(() => {

    if (!branchToUse)
      return;

    const q =

      isOwner &&
      branchToUse === "all"

        ? query(
            collection(db, "expenses"),
            orderBy(
              "createdAt",
              "desc"
            )
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

    const unsub = onSnapshot(
      q,
      snap => {

        setExpenses(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      }
    );

    return () => unsub();

  }, [
    branchToUse,
    isOwner
  ]);

  // ======================================================
  // LOANS
  // ======================================================

  useEffect(() => {

    if (!branchToUse)
      return;

    const q =

      isOwner &&
      branchToUse === "all"

        ? query(
            collection(db, "loans"),
            orderBy(
              "createdAt",
              "desc"
            )
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

    const unsub = onSnapshot(
      q,
      snap => {

        setLoans(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      }
    );

    return () => unsub();

  }, [
    branchToUse,
    isOwner
  ]);

  // ======================================================
  // BONUSES
  // ======================================================

  useEffect(() => {

    if (!branchToUse)
      return;

    const q =

      isOwner &&
      branchToUse === "all"

        ? query(
            collection(db, "bonuses"),
            orderBy(
              "createdAt",
              "desc"
            )
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

    const unsub = onSnapshot(
      q,
      snap => {

        setBonuses(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      }
    );

    return () => unsub();

  }, [
    branchToUse,
    isOwner
  ]);

const todaySales = useMemo(() => {
  return sales.filter((item) => {
    if (item.status === "cancelled") return false;

    return isSaleOnSelectedDate(
      item,
      selectedBusinessDate
    );
  });
}, [sales, selectedBusinessDate]);

const todayRefunds = useMemo(() => {
  return refunds.filter((item) =>
    isSelectedBusinessDay(
      item.refundDate,
      selectedBusinessDate
    )
  );
}, [refunds, selectedBusinessDate]);

const todayExpenses = useMemo(() => {
  return expenses.filter((item) =>
    matchesSelectedBusinessDate(
      item,
      selectedBusinessDate
    )
  );
}, [expenses, selectedBusinessDate]);

const todayLoans = useMemo(() => {
  return loans.filter((item) =>
    matchesSelectedBusinessDate(
      item,
      selectedBusinessDate
    )
  );
}, [loans, selectedBusinessDate]);

const todayBonuses = useMemo(() => {
  return bonuses.filter((item) =>
    matchesSelectedBusinessDate(
      item,
      selectedBusinessDate
    )
  );
}, [bonuses, selectedBusinessDate]);

 

  // ======================================================
  // ANALYTICS
  // ======================================================

  
const analytics = useMemo(() => {
  let totalSales = 0;

  let cashSales = 0;
  let visaSales = 0;
  let instapaySales = 0;

  let invoices = 0;

  let totalRefunds = 0;
  let refundCash = 0;
  let refundVisa = 0;
  let refundInstapay = 0;

  // =================================
  // SALES
  // =================================

  todaySales.forEach((sale) => {
    invoices++;

    const total = Number(sale.total || 0);
    totalSales += total;

    // الفواتير الجديدة: payments
    // الفواتير القديمة: paymentMethod
    const payments =
      Array.isArray(sale.payments) &&
      sale.payments.length > 0
        ? sale.payments
        : [
            {
              method: sale.paymentMethod || "cash",
              amount: total,
            },
          ];

    payments.forEach((payment) => {
      const method = String(
        payment.method || ""
      ).toLowerCase();

      const amount = Number(payment.amount || 0);

      switch (method) {
        case "cash":
          cashSales += amount;
          break;

        case "visa":
          visaSales += amount;
          break;

        case "instapay":
          instapaySales += amount;
          break;

        default:
          break;
      }
    });
  });

  // =================================
  // REFUNDS
  // =================================

  todayRefunds.forEach((item) => {
    // الحفاظ على طريقة حساب المرتجعات الحالية
    const amount =
      Number(item.price || 0) *
      Number(item.quantity || 1);

    totalRefunds += amount;

    const method = String(
      item.refundPaymentMethod || "cash"
    ).toLowerCase();

    switch (method) {
      case "cash":
        refundCash += amount;
        break;

      case "visa":
        refundVisa += amount;
        break;

      case "instapay":
        refundInstapay += amount;
        break;

      default:
        break;
    }
  });

  // =================================
  // EXPENSES / LOANS / BONUSES
  // =================================

  const totalExpenses = todayExpenses.reduce(
    (acc, item) =>
      acc + Number(item.amount || 0),
    0
  );

  const totalLoans = todayLoans.reduce(
    (acc, item) =>
      acc + Number(item.amount || 0),
    0
  );

  const totalBonuses = todayBonuses.reduce(
    (acc, item) =>
      acc + Number(item.amount || 0),
    0
  );

  // =================================
  // EXPECTED BALANCES
  // =================================

  const expectedCash =
    cashSales -
    refundCash -
    totalExpenses -
    totalLoans -
    totalBonuses;

  const expectedVisa =
    visaSales - refundVisa;

  const expectedInstapay =
    instapaySales - refundInstapay;

  return {
    totalSales,

    cashSales,
    visaSales,
    instapaySales,

    totalRefunds,
    refundCash,
    refundVisa,
    refundInstapay,

    totalExpenses,
    totalLoans,
    totalBonuses,

    invoices,

    expectedCash,
    expectedVisa,
    expectedInstapay,
  };

}, [
  todaySales,
  todayRefunds,
  todayExpenses,
  todayLoans,
  todayBonuses
]);

const cashDifference =

  Number(actualCash || 0)

  - analytics.expectedCash;

const visaDifference =
  Number(actualVisa || 0) -
  analytics.expectedVisa;

const instapayDifference =
  Number(actualInstapay || 0) -
  analytics.expectedInstapay;
const visaDifferenceStatus =
  visaDifference === 0
    ? "matched"
    : visaDifference > 0
    ? "over"
    : "short";

const instapayDifferenceStatus =
  instapayDifference === 0
    ? "matched"
    : instapayDifference > 0
    ? "over"
    : "short";



const differenceStatus =

  cashDifference === 0
    ? "matched"
    : cashDifference > 0
    ? "over"
    : "short";
const allPaymentsMatched =
  cashDifference === 0 &&
  visaDifference === 0 &&
  instapayDifference === 0;
  // ======================================================
  // BRANCH NAME
  // ======================================================

  const branchName =

    branchToUse === "all"

      ? "All Branches"

      : branches.find(
          b =>
            b.id ===
            branchToUse
        )?.name || "-";

  // ======================================================
  // LOADING
  // ======================================================
const handleReopenClosing = async () => {
  if (!isOwner) {
    toast.error(
      lang === "ar"
        ? "إعادة فتح اليومية متاحة للـ Owner فقط"
        : "Only the owner can reopen a daily closing"
    );
    return;
  }

  if (!branchToUse || branchToUse === "all" || !selectedBusinessDate) {
    toast.error(
      lang === "ar"
        ? "اختر فرعًا وتاريخ اليومية أولاً"
        : "Select a branch and business date first"
    );
    return;
  }

  const confirmed = window.confirm(
    lang === "ar"
      ? `هل أنت متأكد من إعادة فتح يومية ${selectedBusinessDate}؟ ستصبح العمليات الخاصة بهذا اليوم قابلة للتعديل مرة أخرى.`
      : `Reopen the daily closing for ${selectedBusinessDate}? Transactions for this day will become editable again.`
  );

  if (!confirmed) return;

  try {
    setReopening(true);

    const reopenDailyClosing = httpsCallable(
      functions,
      "reopenDailyClosing"
    );

    await reopenDailyClosing({
      branchId: branchToUse,
      businessDate: selectedBusinessDate,
    });

    toast.success(
      lang === "ar"
        ? "تمت إعادة فتح اليومية بنجاح. يمكنك الآن تعديل العمليات."
        : "Daily closing reopened. You can now edit its transactions."
    );
  } catch (error) {
    console.error("Reopen Daily Closing Error:", error);
    toast.error(
      error?.message ||
        (lang === "ar"
          ? "تعذر إعادة فتح اليومية"
          : "Failed to reopen daily closing")
    );
  } finally {
    setReopening(false);
  }
};

const handleSaveClosing = async () => {
  if (!selectedBusinessDate) {
  toast.error(
    lang === "ar"
      ? "يرجى اختيار تاريخ اليومية"
      : "Please select a business date"
  );
  return;
}

if (
  Number(actualCash) < 0 ||
  Number(actualVisa || 0) < 0 ||
  Number(actualInstapay || 0) < 0
) {
  toast.error(
    lang === "ar"
      ? "المبالغ لا يمكن أن تكون سالبة"
      : "Amounts cannot be negative"
  );
  return;
}
  if (branchToUse === "all") {
    toast.error(
  lang === "ar"
    ? "لا يمكن تقفيل اليومية لكل الفروع. يرجى اختيار فرع أولاً."
    : "Daily closing cannot be performed for all branches. Please select a branch first."
);
    return;
  }
  

  if (alreadyClosed) {

    toast.error(
  lang === "ar"
    ? t("dailyClosing.alreadyClosed")
    : "Daily already closed"
);

    return;
  }

    try {

      setSaving(true);

      const createDailyClosing = httpsCallable(
        functions,
        "createDailyClosing"
      );

      await createDailyClosing({
        branchId: branchToUse,
        businessDate: selectedBusinessDate,
        expectedCash: analytics.expectedCash,
        actualCash: Number(actualCash || 0),
        expectedVisa: analytics.expectedVisa,
        actualVisa: Number(actualVisa || 0),
        visaDifference,
        visaDifferenceStatus,
        expectedInstapay: analytics.expectedInstapay,
        actualInstapay: Number(actualInstapay || 0),
        instapayDifference,
        instapayDifferenceStatus,
        difference: cashDifference,
        differenceStatus,
        allPaymentsMatched,
        totalSales: analytics.totalSales,
        cashSales: analytics.cashSales,
        visaSales: analytics.visaSales,
        instapaySales: analytics.instapaySales,
        refunds: analytics.totalRefunds,
        expenses: analytics.totalExpenses,
        loans: analytics.totalLoans,
        bonuses: analytics.totalBonuses,
        invoices: analytics.invoices,
        notes: closingNotes,
      });

      toast.success(
  lang === "ar"
    ? "تم حفظ التقفيل اليومي بنجاح"
    : "Daily closing saved successfully"
);

      

    }

    catch (err) {

      console.error("Daily Closing Error:", err);

      toast.error(
  lang === "ar"
    ? "حدث خطأ أثناء حفظ اليومية"
    : "Failed to save daily closing"
);

    }

    finally {

      setSaving(false);

    }

  };
  if (loading) {

    return (

      <div
        style={{
          display: "grid",
          gridTemplateColumns:

            isMobile

              ? "1fr"

              : "repeat(auto-fit,minmax(260px,1fr))",
          gap: 20
        }}
      >

        {Array.from({
          length: 8
        }).map((_, i) => (

          <div
            key={i}
            style={{
              height: 160,
              borderRadius: 24,
              background:
                "#e5e7eb"
            }}
          />

        ))}

      </div>

    );

  }

  // ======================================================
  // UI
  // ======================================================

  return (

    <div
      dir={
        lang === "ar"
          ? "rtl"
          : "ltr"
      }

      style={{
        paddingBottom: 40
      }}
    >

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

     
<div
  style={{
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : "minmax(0, 1fr) auto minmax(0, 1fr)",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  }}
>
  {/* Page Title - Right */}
  <div
    style={{
      gridColumn: "1",
      justifySelf: "start",
      textAlign: lang === "ar" ? "right" : "left",
    }}
  >
    <h1
      style={{
        margin: 0,
        fontSize: isMobile ? 26 : 36,
        fontWeight: 800,
        color: theme.colors.text,
      }}
    >
      {t("dailyClosing.title")}
    </h1>

    <div
      style={{
        marginTop: 7,
        color: theme.colors.textSecondary,
        fontSize: 14,
      }}
    >
      {branchName}
    </div>
  </div>

  {/* Centered Business Date */}
  <div
    style={{
      gridColumn: isMobile ? "1" : "2",
      justifySelf: "center",
      width: isMobile ? "100%" : 245,
      boxSizing: "border-box",
      padding: "12px 16px",
      borderRadius: 18,
      background:
        "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)",
      border: "1px solid #BFDBFE",
      boxShadow: "0 8px 24px rgba(37,99,235,0.08)",
    }}
  >
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 700,
        color: "#1D4ED8",
        marginBottom: 5,
      }}
    >
      {lang === "ar" ? "تاريخ اليومية" : "Business Date"}
    </label>

    <input
      type="date"
      value={selectedBusinessDate}
      max={toInputDate(getBusinessDate())}
      onChange={(e) => {
  setClosingStatusLoaded(false);
  setAlreadyClosed(false);
  setWasReopened(false);

  setSelectedBusinessDate(e.target.value);
  setActualCash("");
  setActualVisa("");
  setActualInstapay("");
  setClosingNotes("");
}}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #DBEAFE",
        borderRadius: 10,
        padding: "9px 10px",
        background: "#FFFFFF",
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: 700,
        outline: "none",
        cursor: "pointer",
      }}
    />

    <div
      style={{
        marginTop: 5,
        fontSize: 10,
        color: theme.colors.textSecondary,
      }}
    >
      {lang === "ar"
        ? "حدد اليوم المراد مراجعته"
        : "Select the day to review"}
    </div>
  </div>

  {/* Back Button - Left */}
  <div
    style={{
      gridColumn: isMobile ? "1" : "3",
      justifySelf: isMobile ? "stretch" : "end",
    }}
  >
    <AppButton
      block={isMobile}
      variant="secondary"
      leftIcon={<ArrowRight size={16} />}
      onClick={() => navigate("/sales")}
    >
      {lang === "ar" ? "رجوع للمبيعات" : "Back to Sales"}
    </AppButton>
  </div>
</div>


      {/* ====================================================== */}
      {/* SUMMARY */}
      {/* ====================================================== */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns: isMobile
          ? "repeat(2, minmax(0, 1fr))"
          : "repeat(5, minmax(0, 1fr))",

          gap: 18,

          marginBottom: 28
        }}
      >

        <StatCard
          title={t("dailyClosing.totalSales")}
          value={
            analytics.totalSales
          }
          icon={
            <TrendingUp
              size={22}
            />
          }
          color="#2563eb"
        />

        <StatCard
          title={t("dailyClosing.invoices")}
          value={
            analytics.invoices
          }
          icon={
            <Receipt
              size={22}
            />
          }
          color="#f59e0b"
          isMoney={false}
        />

        <StatCard
          title={t("dailyClosing.cash")}
          value={
            analytics.cashSales
          }
          icon={
            <Banknote
              size={22}
            />
          }
          color="#16a34a"
        />

        <StatCard
          title={t("dailyClosing.visa")}
          value={
            analytics.visaSales
          }
          icon={
            <CreditCard
              size={22}
            />
          }
          color="#7c3aed"
        />

        <StatCard
          title={t("dailyClosing.instapay")}
          value={
            analytics.instapaySales
          }
          icon={
            <Smartphone
              size={22}
            />
          }
          color="#0f766e"
        />

        <StatCard
          title={t("dailyClosing.refunds")}
          value={
            analytics.totalRefunds
          }
          icon={
            <RotateCcw
              size={22}
            />
          }
          color="#dc2626"
        />

        <StatCard
          title={t("dailyClosing.expenses")}
          value={
            analytics.totalExpenses
          }
          icon={
            <Wallet
              size={22}
            />
          }
          color="#ea580c"
        />

        <StatCard
          title={t("dailyClosing.loans")}
          value={
            analytics.totalLoans
          }
          icon={
            <Landmark
              size={22}
            />
          }
          color="#eab308"
        />

        <StatCard
          title={t("dailyClosing.bonuses")}
          value={
            analytics.totalBonuses
          }
          icon={
            <Gift
              size={22}
            />
          }
          color="#22c55e"
        />

        <StatCard
          title={t("dailyClosing.expectedCash")}
          value={
            analytics.expectedCash
          }
          icon={
            <BadgeDollarSign
              size={22}
            />
          }
          color="#059669"
        />

      </div>

      {/* ====================================================== */}
      {/* CASH RECONCILIATION */}
      {/* ====================================================== */}

      <div
        style={{
          ...cardStyle,

          padding: 28,

          marginBottom: 28
        }}
      >

        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "flex-start",

            flexWrap: "wrap",

            gap: 24
          }}
        >

          <div>

            <div
              style={{
                fontSize: 15,

                marginBottom: 10,

                color:
                  theme.colors.textSecondary
              }}
            >
              {t("dailyClosing.reconciliation")}
            </div>

            <div
              style={{
                fontSize:
                  isMobile ? 30 : 42,

                fontWeight: 800,

                color:
                  theme.colors.text
              }}
            >
              EGP{" "}
              {formatMoney(
                analytics.expectedCash
              )}
            </div>

          </div>

          <div
            style={{
              flex: 1,

              minWidth: 320
            }}
          >

            <ReconRow
              title={t("dailyClosing.cashSales")}
              value={
                analytics.cashSales
              }
              positive
            />

            <ReconRow
              title={lang === "ar" ? "مرتجعات الكاش" : "Cash Refunds"}
              value={analytics.refundCash}
            />

            <ReconRow
              title={t("dailyClosing.expenses")}
              value={
                analytics.totalExpenses
              }
            />

            <ReconRow
              title={t("dailyClosing.loans")}
              value={
                analytics.totalLoans
              }
            />

            <ReconRow
              title={t("dailyClosing.bonuses")}
              value={
                analytics.totalBonuses
              }
            />

          </div>

        </div>

      </div>
    
{/* ====================================================== */}
{/* DAILY CLOSING - PROFESSIONAL SECTION */}
{/* ====================================================== */}

<div
  style={{
    ...cardStyle,
    padding: 0,
    overflow: "hidden",
    marginBottom: 28,
    borderRadius: 24,
  }}
>
  {/* HEADER */}
  <div
    style={{
      padding: isMobile ? 18 : "24px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16,
      background: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)",
      borderBottom: "1px solid #DBEAFE",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: 15,
          background: "#DBEAFE",
          color: "#2563EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BadgeDollarSign size={25} />
      </div>

      <div>
        <div
          style={{
            fontSize: isMobile ? 18 : 21,
            fontWeight: 850,
            color: "#0F172A",
            marginBottom: 5,
          }}
        >
          {t("dailyClosing.closeDailyCash")}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#64748B",
          }}
        >
          {lang === "ar"
            ? "مراجعة المبالغ الفعلية ومطابقتها مع حسابات النظام"
            : "Review actual amounts and reconcile them with system balances"}
        </div>
      </div>
    </div>

    {/* STATUS */}
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 14px",
        borderRadius: 30,
        background: !closingStatusLoaded
          ? "#F1F5F9"
          : alreadyClosed
          ? "#DCFCE7"
          : wasReopened
          ? "#FFF7ED"
          : "#EFF6FF",
        color: !closingStatusLoaded
          ? "#64748B"
          : alreadyClosed
          ? "#15803D"
          : wasReopened
          ? "#C2410C"
          : "#2563EB",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "currentColor",
        }}
      />

      {!closingStatusLoaded
        ? lang === "ar"
          ? "جارٍ التحقق..."
          : "Checking..."
        : alreadyClosed
        ? lang === "ar"
          ? "اليومية مغلقة"
          : "Daily Closed"
        : wasReopened
        ? lang === "ar"
          ? "تمت إعادة الفتح"
          : "Reopened"
        : lang === "ar"
        ? "جاهزة للإغلاق"
        : "Ready to Close"}
    </div>
  </div>

  {/* BODY */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "minmax(0, 1.35fr) minmax(310px, 0.85fr)",
      gap: 0,
    }}
  >
    {/* LEFT: INPUTS */}
    <div
      style={{
        padding: isMobile ? 18 : 28,
        minWidth: 0,
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: theme.colors.text,
            marginBottom: 6,
          }}
        >
          {lang === "ar" ? "المبالغ الفعلية" : "Actual Amounts"}
        </div>

        <div
          style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
          }}
        >
          {lang === "ar"
            ? "أدخل المبالغ الموجودة فعليًا في الفرع"
            : "Enter the actual amounts available at the branch"}
        </div>
      </div>

      {/* PAYMENT INPUTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(3, minmax(0, 1fr))",
          gap: 13,
          marginBottom: 22,
        }}
      >
        {/* CASH */}
        <div
          style={{
            padding: 15,
            border: "1px solid #DBEAFE",
            borderRadius: 17,
            background: alreadyClosed ? "#F8FAFC" : "#FFFFFF",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 15,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#DCFCE7",
                color: "#16A34A",
              }}
            >
              <Banknote size={18} />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                {t("dailyClosing.actualCash")}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 3 }}>
                {lang === "ar" ? "النقدية" : "Cash"}
              </div>
            </div>
          </div>

          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={actualCash}
            disabled={!closingStatusLoaded || alreadyClosed}
            onChange={(e) => setActualCash(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="0"
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 50,
              padding: "0 12px",
              border: "1px solid #DCE4EF",
              borderRadius: 11,
              background: alreadyClosed ? "#F1F5F9" : "#FFFFFF",
              color: "#0F172A",
              fontSize: 19,
              fontWeight: 800,
              outline: "none",
              cursor: alreadyClosed ? "not-allowed" : "text",
              fontVariantNumeric: "tabular-nums",
              direction: "ltr",
              textAlign: "left",
            }}
          />
        </div>

        {/* VISA */}
        <div
          style={{
            padding: 15,
            border: "1px solid #DBEAFE",
            borderRadius: 17,
            background: alreadyClosed ? "#F8FAFC" : "#FFFFFF",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 15,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#EDE9FE",
                color: "#7C3AED",
              }}
            >
              <CreditCard size={18} />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                {lang === "ar" ? "الفيزا الفعلية" : "Actual Visa"}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 3 }}>
                Visa
              </div>
            </div>
          </div>

          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={actualVisa}
            disabled={!closingStatusLoaded || alreadyClosed}
            onChange={(e) => setActualVisa(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="0"
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 50,
              padding: "0 12px",
              border: "1px solid #DCE4EF",
              borderRadius: 11,
              background: alreadyClosed ? "#F1F5F9" : "#FFFFFF",
              color: "#0F172A",
              fontSize: 19,
              fontWeight: 800,
              outline: "none",
              cursor: alreadyClosed ? "not-allowed" : "text",
              fontVariantNumeric: "tabular-nums",
              direction: "ltr",
              textAlign: "left",
            }}
          />
        </div>

        {/* INSTAPAY */}
        <div
          style={{
            padding: 15,
            border: "1px solid #DBEAFE",
            borderRadius: 17,
            background: alreadyClosed ? "#F8FAFC" : "#FFFFFF",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 15,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#CCFBF1",
                color: "#0F766E",
              }}
            >
              <Smartphone size={18} />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                {lang === "ar" ? "الإنستاباي الفعلي" : "Actual InstaPay"}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 3 }}>
                InstaPay
              </div>
            </div>
          </div>

          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={actualInstapay}
            disabled={!closingStatusLoaded || alreadyClosed}
            onChange={(e) => setActualInstapay(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="0"
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 50,
              padding: "0 12px",
              border: "1px solid #DCE4EF",
              borderRadius: 11,
              background: alreadyClosed ? "#F1F5F9" : "#FFFFFF",
              color: "#0F172A",
              fontSize: 19,
              fontWeight: 800,
              outline: "none",
              cursor: alreadyClosed ? "not-allowed" : "text",
              fontVariantNumeric: "tabular-nums",
              direction: "ltr",
              textAlign: "left",
            }}
          />
        </div>
      </div>

      {/* NOTES */}
      <div style={{ marginBottom: 22 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 800,
            color: theme.colors.text,
            marginBottom: 9,
          }}
        >
          {t("dailyClosing.notes")}
        </label>

        <textarea
          value={closingNotes}
          disabled={!closingStatusLoaded || alreadyClosed}
          onChange={(e) => setClosingNotes(e.target.value)}
          rows={3}
          placeholder={t("dailyClosing.writeNotes")}
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #DCE4EF",
            borderRadius: 14,
            padding: 15,
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            fontSize: 13,
            lineHeight: 1.7,
            background: alreadyClosed ? "#F1F5F9" : "#FFFFFF",
            color: "#0F172A",
            cursor: alreadyClosed ? "not-allowed" : "text",
          }}
        />
      </div>

      {/* STATUS MESSAGES */}
      {alreadyClosed && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 11,
            padding: 15,
            borderRadius: 14,
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#166534",
            marginBottom: 18,
          }}
        >
          <BadgeDollarSign size={20} />

          <div>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
              {lang === "ar" ? "تم إغلاق اليومية بنجاح" : "Daily Closing Completed"}
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.7 }}>
              {lang === "ar"
                ? "تم حفظ المبالغ. التعديل متوقف حاليًا، ويمكن للـ Owner إعادة فتح اليومية."
                : "Amounts are saved and editing is locked. The owner can reopen this day."}
            </div>
          </div>
        </div>
      )}

      {wasReopened && !alreadyClosed && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 11,
            padding: 15,
            borderRadius: 14,
            background: "#FFF7ED",
            border: "1px solid #FED7AA",
            color: "#9A3412",
            marginBottom: 18,
          }}
        >
          <RotateCcw size={19} />
          <div style={{ fontSize: 12, lineHeight: 1.8, fontWeight: 700 }}>
            {lang === "ar"
              ? "تمت إعادة فتح اليومية. يمكنك تعديل المبالغ وحفظ تقفيل جديد بعد الانتهاء."
              : "This day was reopened. You can edit the amounts and save a new closing."}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={handleSaveClosing}
          disabled={
            saving ||
            !closingStatusLoaded ||
            alreadyClosed ||
            branchToUse === "all"
          }
          style={{
            minHeight: 50,
            padding: "0 25px",
            border: "none",
            borderRadius: 13,
            background:
              saving ||
              !closingStatusLoaded ||
              alreadyClosed ||
              branchToUse === "all"
                ? "#94A3B8"
                : theme.colors.primary,
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 800,
            cursor:
              saving ||
              !closingStatusLoaded ||
              alreadyClosed ||
              branchToUse === "all"
                ? "not-allowed"
                : "pointer",
            boxShadow: "0 5px 14px rgba(37,99,235,0.16)",
            transition: "all 0.2s ease",
          }}
        >
          {alreadyClosed
            ? lang === "ar"
              ? "تم إغلاق اليومية"
              : "Already Closed"
            : saving
            ? lang === "ar"
              ? "جارٍ الحفظ..."
              : "Saving..."
            : branchToUse === "all"
            ? lang === "ar"
              ? "اختر فرع أولاً"
              : "Select Branch"
            : lang === "ar"
            ? "حفظ التقفيل اليومي"
            : "Save Daily Closing"}
        </button>

        {alreadyClosed && isOwner && (
          <button
            type="button"
            onClick={handleReopenClosing}
            disabled={reopening || saving}
            style={{
              minHeight: 50,
              padding: "0 22px",
              border: "1px solid #F59E0B",
              borderRadius: 13,
              background: "#FFFBEB",
              color: "#B45309",
              fontSize: 12,
              fontWeight: 800,
              cursor: reopening || saving ? "not-allowed" : "pointer",
              opacity: reopening ? 0.65 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <RotateCcw size={16} />
            {reopening
              ? lang === "ar"
                ? "جارٍ إعادة الفتح..."
                : "Reopening..."
              : lang === "ar"
              ? "إعادة فتح اليومية"
              : "Reopen Daily Closing"}
          </button>
        )}
      </div>
    </div>

    {/* RIGHT: RECONCILIATION SUMMARY */}
    <div
      style={{
        padding: isMobile ? 18 : 24,
        background: "#F8FAFC",
        borderInlineStart: isMobile ? "none" : "1px solid #E2E8F0",
        borderTop: isMobile ? "1px solid #E2E8F0" : "none",
        minWidth: 0,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 850,
            color: "#0F172A",
            marginBottom: 5,
          }}
        >
          {lang === "ar" ? "ملخص المطابقة" : "Reconciliation Summary"}
        </div>

        <div style={{ fontSize: 11, color: "#64748B" }}>
          {lang === "ar"
            ? "مقارنة المتوقع بالفعلي لكل وسيلة دفع"
            : "Expected versus actual for each payment method"}
        </div>
      </div>

      {/* CASH SUMMARY */}
      <div
        style={{
          padding: 17,
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 17,
          marginBottom: 13,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 15,
          }}
        >
          <div
            style={{
              width: 33,
              height: 33,
              borderRadius: 10,
              background: "#DBEAFE",
              color: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Banknote size={18} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 850, color: "#1E40AF" }}>
            {lang === "ar" ? "الكاش" : "Cash"}
          </span>
        </div>

        
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  }}
>
  {[
    {
      label: lang === "ar" ? "المتوقع" : "Expected",
      value: analytics.expectedCash,
      color: "#1E40AF",
    },
    {
      label: lang === "ar" ? "الفعلي" : "Actual",
      value: Number(actualCash || 0),
      color: "#1E40AF",
    },
    {
      label: lang === "ar" ? "الفرق" : "Difference",
      value: cashDifference,
      color:
        differenceStatus === "matched"
          ? "#16A34A"
          : differenceStatus === "over"
          ? "#D97706"
          : "#DC2626",
    },
  ].map((item, index) => (
    <div
      key={index}
      style={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          color: "#64748B",
          fontSize: 10,
          marginBottom: 7,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {item.label}
      </div>

      <div
        dir="ltr"
        style={{
          width: "100%",
          fontSize: 13,
          fontWeight: 850,
          color: item.color,
          fontVariantNumeric: "tabular-nums",
          overflowWrap: "anywhere",
          textAlign: "center",
        }}
      >
        {formatMoney(item.value)}
      </div>
    </div>
  ))}
</div>

      </div>

      {/* VISA SUMMARY */}
      <div
        style={{
          padding: 16,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
          <CreditCard size={17} color="#7C3AED" />
          <span style={{ fontSize: 12, fontWeight: 850, color: "#334155" }}>
            Visa
          </span>
        </div>

        
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  }}
>
  {[
    {
      label: lang === "ar" ? "المتوقع" : "Expected",
      value: analytics.expectedVisa,
    },
    {
      label: lang === "ar" ? "الفعلي" : "Actual",
      value: Number(actualVisa || 0),
    },
    {
      label: lang === "ar" ? "الفرق" : "Difference",
      value: visaDifference,
      color:
        visaDifferenceStatus === "matched"
          ? "#16A34A"
          : visaDifferenceStatus === "over"
          ? "#D97706"
          : "#DC2626",
    },
  ].map((item, index) => (
    <div
      key={index}
      style={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          color: "#64748B",
          fontSize: 10,
          marginBottom: 7,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {item.label}
      </div>

      <div
        dir="ltr"
        style={{
          width: "100%",
          fontSize: 12,
          fontWeight: 800,
          color: item.color || "#334155",
          fontVariantNumeric: "tabular-nums",
          overflowWrap: "anywhere",
          textAlign: "center",
        }}
      >
        {formatMoney(item.value)}
      </div>
    </div>
  ))}
</div>

      </div>

      {/* INSTAPAY SUMMARY */}
      <div
        style={{
          padding: 16,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          marginBottom: 15,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
          <Smartphone size={17} color="#0F766E" />
          <span style={{ fontSize: 12, fontWeight: 850, color: "#334155" }}>
            InstaPay
          </span>
        </div>

        
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  }}
>
  {[
    {
      label: lang === "ar" ? "المتوقع" : "Expected",
      value: analytics.expectedInstapay,
    },
    {
      label: lang === "ar" ? "الفعلي" : "Actual",
      value: Number(actualInstapay || 0),
    },
    {
      label: lang === "ar" ? "الفرق" : "Difference",
      value: instapayDifference,
      color:
        instapayDifferenceStatus === "matched"
          ? "#16A34A"
          : instapayDifferenceStatus === "over"
          ? "#D97706"
          : "#DC2626",
    },
  ].map((item, index) => (
    <div
      key={index}
      style={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          color: "#64748B",
          fontSize: 10,
          marginBottom: 7,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {item.label}
      </div>

      <div
        dir="ltr"
        style={{
          width: "100%",
          fontSize: 12,
          fontWeight: 800,
          color: item.color || "#334155",
          fontVariantNumeric: "tabular-nums",
          overflowWrap: "anywhere",
          textAlign: "center",
        }}
      >
        {formatMoney(item.value)}
      </div>
    </div>
  ))}
</div>

      </div>

      {/* FINAL MATCH STATUS */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: 15,
          borderRadius: 15,
          background: allPaymentsMatched ? "#DCFCE7" : "#FEF3C7",
          border: `1px solid ${allPaymentsMatched ? "#BBF7D0" : "#FDE68A"}`,
          color: allPaymentsMatched ? "#166534" : "#92400E",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            minWidth: 34,
            borderRadius: 11,
            background: allPaymentsMatched ? "#BBF7D0" : "#FDE68A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {allPaymentsMatched
            ? <BadgeDollarSign size={19} />
            : <AlertCircle size={19} />}
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 850, marginBottom: 4 }}>
            {allPaymentsMatched
              ? lang === "ar"
                ? "كل الحسابات مطابقة"
                : "All Payments Matched"
              : lang === "ar"
              ? "يوجد فرق في وسائل الدفع"
              : "Payment Differences Found"}
          </div>

          <div style={{ fontSize: 10, opacity: 0.85 }}>
            {allPaymentsMatched
              ? lang === "ar"
                ? "الأرصدة الفعلية متوافقة مع الأرصدة المتوقعة"
                : "Actual balances match expected balances"
              : lang === "ar"
              ? "راجع الفروق قبل إتمام التقفيل"
              : "Review the differences before closing"}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* ====================================================== */}
      {/* TABLES */}
      {/* ====================================================== */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:

  isMobile
    ? "1fr"
    : "repeat(auto-fit,minmax(500px,1fr))",

          gap: 22
        }}
      >

        {/* ====================================================== */}
        {/* REFUNDS */}
        {/* ====================================================== */}

        <TableCard
          title={t("dailyClosing.refundsTable")}
          icon={
            <RotateCcw
              size={18}
            />
          }
        >

          {todayRefunds.length ===
          0 ? (

            <EmptyState
  text={
    t("dailyClosing.noData")
  }
/>

          ) : (

            <TableWrapper>

              <table
                style={table}
              >

                <thead>

                  <tr>

                    <Th>
                      {t("dailyClosing.product")}
                    </Th>

                    <Th>
                      {t("dailyClosing.qty")}
                    </Th>

                    <Th>
                      {t("dailyClosing.amount")}
                    </Th>

                    <Th>
                      {t("dailyClosing.time")}
                    </Th>

                  </tr>

                </thead>

                <tbody>

                  {todayRefunds.map(
                    item => (

                      <tr
                        key={
                          item.id
                        }
                      >

                        <Td>
                          {
                            item.productName
                          }
                        </Td>

                        <Td>
                          {
                            item.quantity
                          }
                        </Td>

                        <Td
                          color="#dc2626"
                        >
                          {formatMoney(
                            item.price
                          )}
                        </Td>

                        <Td>
                          {formatDate(
                            item.refundDate,
                            lang
                          )}
                        </Td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </TableWrapper>

          )}

        </TableCard>

        {/* ====================================================== */}
        {/* EXPENSES */}
        {/* ====================================================== */}

        <TableCard
          title={t("dailyClosing.expensesTable")}
          icon={
            <Wallet
              size={18}
            />
          }
        >

          {todayExpenses.length ===
          0 ? (

            <EmptyState
  text={
    t("dailyClosing.noData")
  }
/>

          ) : (

            <TableWrapper>

              <table
                style={table}
              >

                <thead>

                  <tr>

                    <Th>
                      {t("dailyClosing.category")}
                    </Th>

                    <Th>
                      {t("dailyClosing.note")}
                    </Th>

                    <Th>
                      {t("dailyClosing.amount")}
                    </Th>

                    <Th>
                      {t("dailyClosing.time")}
                    </Th>

                  </tr>

                </thead>

                <tbody>

                  {todayExpenses.map(
                    item => (

                      <tr
                        key={
                          item.id
                        }
                      >

                        <Td>
                          {
                            item.category
                          }
                        </Td>

                        <Td>
                          {item.note ||
                            "-"}
                        </Td>

                        <Td
                          color="#ea580c"
                        >
                          {formatMoney(
                            item.amount
                          )}
                        </Td>

                        <Td>
                          {formatDate(
                            item.createdAt,
                            lang
                          )}
                        </Td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </TableWrapper>

          )}

        </TableCard>

      </div>

    </div>

  );

}

// ======================================================
// COMPONENTS
// ======================================================



function StatCard({
  title,
  value,
  icon,
  color,
  isMoney = true
}) {
  const isNegative = isMoney && Number(value) < 0;

  return (
    <div
      style={{
        ...cardStyle,
        padding: 18,
        minHeight: 125,
        borderRadius: 18,
        boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      {/* Icon + Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            minWidth: 36,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${color}12`,
            color,
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: theme.colors.textSecondary,
            lineHeight: 1.5,
          }}
        >
          {title}
        </div>
      </div>

      {/* Value */}
      <div
        dir="ltr"
        style={{
          fontSize: "clamp(24px, 3vw, 30px)",
          fontWeight: 800,
          color: isNegative
            ? "#DC2626"
            : theme.colors.text,
          textAlign: "right",
          lineHeight: 1.2,
          fontVariantNumeric: "tabular-nums",
          unicodeBidi: "isolate",
        }}
      >
        {isMoney ? formatMoney(value) : value}
      </div>
    </div>
  );
}



function ReconRow({
  title,
  value,
  positive
}) {

  return (

    <div
      style={{
        display: "flex",

        justifyContent:
          "space-between",

        alignItems:
          "center",

        padding: "14px 0",

        borderBottom:
          `1px dashed ${theme.colors.border}`
      }}
    >

      <div
        style={{
          color:
            theme.colors.textSecondary,

          fontSize: 14
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontWeight: 700,

          fontSize: 15,

          color: positive
            ? "#16a34a"
            : "#dc2626"
        }}
      >
        {positive ? "+" : "-"} {formatMoney(value)}
      </div>

    </div>

  );

}

function TableCard({
  title,
  icon,
  children
}) {

  return (

    <div
      style={{
        ...cardStyle,

        overflow: "hidden"
      }}
    >

      <div
        style={{
          padding: "20px 24px",

          borderBottom:
            `1px solid ${theme.colors.border}`,

          display: "flex",

          alignItems: "center",

          gap: 10,

          fontWeight: 700,

          color:
            theme.colors.text
        }}
      >

        {icon}

        {title}

      </div>

      <div
        style={{
          padding: 16
        }}
      >
        {children}
      </div>

    </div>

  );

}

function TableWrapper({
  children
}) {

  return (

    <div
      style={{
        width: "100%",

        overflowX: "auto"
      }}
    >
      {children}
    </div>

  );

}

function EmptyState({
  text
}) {

  return (

    <div
      style={{
        minHeight: 240,

        display: "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        flexDirection:
          "column",

        gap: 12,

        color:
          theme.colors.textSecondary
      }}
    >

      <AlertCircle
        size={40}
        opacity={0.5}
      />

      <div
        style={{
          fontSize: 15
        }}
      >
        {text}
      </div>

    </div>

  );

}

function Th({
  children
}) {

  return (

    <th
      style={{
        padding: 16,

        fontSize: 14,

        fontWeight: 700,

        color:
          theme.colors.textSecondary,

        borderBottom:
          `1px solid ${theme.colors.border}`,

        whiteSpace:
          "nowrap",

        textAlign: "start",

        background:
          "#f8fafc"
      }}
    >
      {children}
    </th>

  );

}

function Td({
  children,
  color
}) {

  return (

    <td
      style={{
        padding: 16,

        borderBottom:
          `1px solid ${theme.colors.borderLight}`,

        whiteSpace:
          "nowrap",

        fontSize: 14,

        fontWeight:
          color
            ? 700
            : 500,

        color:
          color ||
          theme.colors.text
      }}
    >
      {children}
    </td>

  );

}
function ClosingInfoRow({
  label,
  value,
  color
}) {

  return (

    <div
      style={{
        display: "flex",

        justifyContent:
          "space-between",

        alignItems:
          "center",

        padding: "14px 0",

        borderBottom:
          `1px dashed ${theme.colors.border}`
      }}
    >

      <div
        style={{
          color:
            theme.colors.textSecondary,

          fontSize: 14
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 800,

          fontSize: 16,

          color:
            color ||
            theme.colors.text
        }}
      >
        {typeof value === "string"
  ? value.startsWith("+")
    ? `+${formatMoney(value.slice(1))}`
    : value
  : formatMoney(value)}
      </div>

    </div>

  );

}
const table = {
  width: "100%",

  borderCollapse:
    "collapse",

  minWidth: 520
};