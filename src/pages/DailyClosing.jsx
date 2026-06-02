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
  where,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

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
  CircleDollarSign,
  Gift,
  Landmark,
  AlertCircle
} from "lucide-react";

import { db } from "../firebase";

import { useAuth } from "../store/useAuth";

import { useApp } from "../store/useApp";

import { useTranslate } from "../useTranslate";

import { theme } from "../theme";

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

  const d = new Date(date);

  if (
    d.getHours() <
    BUSINESS_DAY_CUTOFF
  ) {

    d.setDate(
      d.getDate() - 1
    );

  }

  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
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

  const { user } =
    useAuth();

  const {
    selectedBranch
  } = useApp();

  const {
    lang
  } = useTranslate();

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

const [closingNotes, setClosingNotes] =
useState("");

const [saving, setSaving] =
useState(false);
const [
  alreadyClosed,
  setAlreadyClosed
] = useState(false);

  const isOwner =
    user?.role === "owner";

  const branchToUse =

    isOwner
      ? selectedBranch
      : user?.branchIds?.[0];

  // ======================================================
  // FETCH BRANCHES
  // ======================================================

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "branches"),
      snap => {

        setBranches(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      }
    );

    return () => unsub();

  }, []);

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
// ======================================================
// DAILY CLOSING STATUS
// ======================================================

useEffect(() => {

  if (!branchToUse)
    return;

  const businessDate =
    getBusinessDateKey();

  const q = query(
    collection(
      db,
      "dailyClosings"
    ),

    where(
      "branchId",
      "==",
      branchToUse
    ),

    where(
      "businessDate",
      "==",
      businessDate
    )
  );

  const unsub = onSnapshot(
    q,
    snap => {

      setAlreadyClosed(
        !snap.empty
      );

    }
  );

  return () => unsub();

}, [branchToUse]);
  // ======================================================
  // TODAY FILTER
  // ======================================================

  const todaySales =
    useMemo(() => {

      return sales.filter(
        item => {

          if (
            item.status ===
            "cancelled"
          ) {
            return false;
          }

          return isBusinessDay(
            item.createdAt
          );

        }
      );

    }, [sales]);

  const todayRefunds =
    useMemo(() => {

      return refunds.filter(
        item =>
          isBusinessDay(
            item.refundDate
          )
      );

    }, [refunds]);

  const todayExpenses =
    useMemo(() => {

      return expenses.filter(
        item =>
          isBusinessDay(
            item.createdAt
          )
      );

    }, [expenses]);

  const todayLoans =
    useMemo(() => {

      return loans.filter(
        item =>
          isBusinessDay(
            item.createdAt
          )
      );

    }, [loans]);

  const todayBonuses =
    useMemo(() => {

      return bonuses.filter(
        item =>
          isBusinessDay(
            item.createdAt
          )
      );

    }, [bonuses]);

  // ======================================================
  // ANALYTICS
  // ======================================================

  const analytics = useMemo(() => {

    let totalSales = 0;

    let cashSales = 0;

    let visaSales = 0;

    let instapaySales = 0;

    let invoices = 0;

    todaySales.forEach(
      sale => {

        invoices++;

        const total =
          Number(
            sale.total || 0
          );

        totalSales += total;

        const method =
          (
            sale.paymentMethod ||
            ""
          ).toLowerCase();

        if (
          method === "cash"
        ) {
          cashSales += total;
        }

        else if (
          method === "visa"
        ) {
          visaSales += total;
        }

        else if (
          method ===
          "instapay"
        ) {
          instapaySales +=
            total;
        }

      }
    );

    const totalRefunds =
  todayRefunds.reduce(

    (acc, item) =>

      acc +

      (
        Number(item.price || 0)

        *

        Number(
          item.quantity || 1
        )
      ),

    0
  );

    const totalExpenses =
      todayExpenses.reduce(
        (acc, item) =>
          acc +
          Number(
            item.amount || 0
          ),
        0
      );

    const totalLoans =
      todayLoans.reduce(
        (acc, item) =>
          acc +
          Number(
            item.amount || 0
          ),
        0
      );

    const totalBonuses =
      todayBonuses.reduce(
        (acc, item) =>
          acc +
          Number(
            item.amount || 0
          ),
        0
      );

    const expectedCash =

      cashSales

      - totalRefunds

      - totalExpenses

      - totalLoans

      - totalBonuses;

    return {

      totalSales,

      cashSales,

      visaSales,

      instapaySales,

      invoices,

      totalRefunds,

      totalExpenses,

      totalLoans,

      totalBonuses,

      expectedCash

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

const differenceStatus =

  cashDifference === 0
    ? "matched"
    : cashDifference > 0
    ? "over"
    : "short";

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
const handleSaveClosing =
  async () => {
    if (alreadyClosed) {

  alert(
    lang === "ar"
      ? "تم إغلاق اليومية بالفعل"
      : "Daily already closed"
  );

  return;
}

    try {

      setSaving(true);

      await addDoc(
        collection(
          db,
          "dailyClosings"
        ),

        {
          branchId:
            branchToUse,

          branchName,

          

          expectedCash:
            analytics.expectedCash,

          actualCash:
            Number(
              actualCash || 0
            ),

          difference:
            cashDifference,

          differenceStatus,

          totalSales:
            analytics.totalSales,

          cashSales:
            analytics.cashSales,

          visaSales:
            analytics.visaSales,

          instapaySales:
            analytics.instapaySales,

          refunds:
            analytics.totalRefunds,

          expenses:
            analytics.totalExpenses,

          loans:
            analytics.totalLoans,

          bonuses:
            analytics.totalBonuses,

          invoices:
            analytics.invoices,

          notes:
            closingNotes,

          createdBy:
            user?.name || "",

          userId:
            user?.uid || "",

          businessDate:
            getBusinessDateKey(),

            createdAt:
            serverTimestamp()
        }
      );

      alert(
        lang === "ar"
          ? "تم حفظ الجرد اليومي"
          : "Daily closing saved"
      );

      setActualCash("");

      setClosingNotes("");

    }

    catch (err) {

      console.log(err);

      alert(
        lang === "ar"
          ? "حدث خطأ"
          : "Something went wrong"
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
            "repeat(auto-fit,minmax(260px,1fr))",
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
          display: "flex",

          justifyContent:
            "space-between",

          alignItems:
            "flex-start",

          flexWrap: "wrap",

          gap: 20,

          marginBottom: 24
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,

              fontSize: 36,

              fontWeight: 800,

              color:
                theme.colors.text
            }}
          >
            📦 Daily Closing
          </h1>

          <div
            style={{
              marginTop: 8,

              color:
                theme.colors.textSecondary,

              fontSize: 15
            }}
          >
            {branchName}
          </div>

        </div>

        <div
          style={{
            ...cardStyle,

            display: "flex",

            alignItems: "center",

            gap: 10,

            padding:
              "12px 18px",

            fontSize: 14,

            color:
              theme.colors.textSecondary
          }}
        >

          <CalendarDays
            size={18}
          />

          {getBusinessDate().toLocaleDateString(
            lang === "ar"
              ? "ar-EG"
              : "en-US",
            {
              weekday:
                "long",

              year: "numeric",

              month: "long",

              day: "numeric"
            }
          )}

        </div>

      </div>

      {/* ====================================================== */}
      {/* SUMMARY */}
      {/* ====================================================== */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",

          gap: 18,

          marginBottom: 28
        }}
      >

        <StatCard
          title="إجمالي المبيعات"
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
          title="الفواتير"
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
          title="كاش"
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
          title="فيزا"
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
          title="Instapay"
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
          title="مرتجعات"
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
          title="مصروفات"
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
          title="سلف"
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
          title="حوافز"
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
          title="الكاش المتوقع"
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
              Cash Reconciliation
            </div>

            <div
              style={{
                fontSize: 42,

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
              title="Cash Sales"
              value={
                analytics.cashSales
              }
              positive
            />

            <ReconRow
              title="Refunds"
              value={
                analytics.totalRefunds
              }
            />

            <ReconRow
              title="Expenses"
              value={
                analytics.totalExpenses
              }
            />

            <ReconRow
              title="Loans"
              value={
                analytics.totalLoans
              }
            />

            <ReconRow
              title="Bonuses"
              value={
                analytics.totalBonuses
              }
            />

          </div>

        </div>

      </div>
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

      gap: 28
    }}
  >

    {/* LEFT */}

    <div
      style={{
        flex: 1,

        minWidth: 280
      }}
    >

      <div
        style={{
          fontSize: 22,

          fontWeight: 800,

          marginBottom: 10,

          color:
            theme.colors.text
        }}
      >
        {lang === "ar"
          ? "إغلاق اليومية"
          : "Close Daily Cash"}
      </div>

      <div
        style={{
          color:
            theme.colors.textSecondary,

          marginBottom: 24,

          fontSize: 14
        }}
      >
        {lang === "ar"
          ? "أدخل النقدية الفعلية الموجودة"
          : "Enter actual cash amount"}
      </div>

      {/* INPUT */}

      <div
        style={{
          marginBottom: 18
        }}
      >

        <label
          style={{
            display: "block",

            marginBottom: 8,

            fontSize: 14,

            fontWeight: 600
          }}
        >
          {lang === "ar"
            ? "الكاش الفعلي"
            : "Actual Cash"}
        </label>

        <input
          type="number"
          inputMode="numeric"
          value={actualCash}

          onChange={(e) =>
            setActualCash(
              e.target.value
            )
          }

          placeholder="0"

          style={{
            width: "100%",

            height: 54,

            borderRadius: 14,

            border:
              `1px solid ${theme.colors.border}`,

            padding:
              "0 16px",

            fontSize: 18,

            outline: "none",

            background:
              theme.colors.white
          }}
        />

      </div>

      {/* NOTES */}

      <div
        style={{
          marginBottom: 20
        }}
      >

        <label
          style={{
            display: "block",

            marginBottom: 8,

            fontSize: 14,

            fontWeight: 600
          }}
        >
          {lang === "ar"
            ? "ملاحظات"
            : "Notes"}
        </label>

        <textarea
          value={closingNotes}

          onChange={(e) =>
            setClosingNotes(
              e.target.value
            )
          }

          rows={4}

          placeholder={
            lang === "ar"
              ? "اكتب أي ملاحظات..."
              : "Write notes..."
          }

          style={{
            width: "100%",

            borderRadius: 14,

            border:
              `1px solid ${theme.colors.border}`,

            padding: 16,

            resize: "none",

            outline: "none",

            fontFamily:
              "inherit",

            fontSize: 14
          }}
        />

      </div>
    {alreadyClosed && (

  <div
    style={{
      marginBottom: 16,

      padding: "14px 16px",

      borderRadius: 14,

      background: "#dcfce7",

      color: "#166534",

      fontWeight: 700,

      fontSize: 14
    }}
  >

    {lang === "ar"

      ? "تم إغلاق اليومية لهذا اليوم"

      : "Daily closing already completed"}

  </div>

)}
      {/* BUTTON */}

      <button
        onClick={
          handleSaveClosing
        }

        disabled={
  saving ||
  alreadyClosed ||
  actualCash === ""
}

        style={{
          height: 52,

          padding:
            "0 28px",

          border: "none",

          borderRadius: 14,

          background:

            alreadyClosed

                ? "#94a3b8"

                : theme.colors.primary,

          color: "#fff",

          fontSize: 15,

          fontWeight: 700,

          cursor: "pointer",

          opacity:
            saving
              ? 0.7
              : 1
        }}
      >

        {alreadyClosed

        ? lang === "ar"
            ? "تم إغلاق اليومية"
            : "Already Closed"

        : saving

        ? lang === "ar"
            ? "جاري الحفظ..."
            : "Saving..."

        : lang === "ar"
        ? "حفظ اليومية"
        : "Save Closing"}

      </button>

    </div>

    {/* RIGHT */}

    <div
      style={{
        width: 320
      }}
    >

      <div
        style={{
          ...cardStyle,

          padding: 24,

          background:
            "#f8fafc"
        }}
      >

        <ClosingInfoRow
          label={
            lang === "ar"
              ? "الكاش المتوقع"
              : "Expected Cash"
          }
          value={
            analytics.expectedCash
          }
        />

        <ClosingInfoRow
          label={
            lang === "ar"
              ? "الكاش الفعلي"
              : "Actual Cash"
          }
          value={
            Number(
              actualCash || 0
            )
          }
        />

        <ClosingInfoRow
          label={
            lang === "ar"
              ? "الفرق"
              : "Difference"
          }
          value={cashDifference}
          color={
            differenceStatus ===
            "matched"

              ? theme.colors.success

              : differenceStatus ===
                "over"

              ? theme.colors.warning

              : theme.colors.danger
          }
        />

        <div
          style={{
            marginTop: 20,

            padding: 16,

            borderRadius: 14,

            background:
              differenceStatus ===
              "matched"

                ? "#dcfce7"

                : differenceStatus ===
                  "over"

                ? "#fef3c7"

                : "#fee2e2",

            color:
              differenceStatus ===
              "matched"

                ? "#166534"

                : differenceStatus ===
                  "over"

                ? "#92400e"

                : "#991b1b",

            fontWeight: 700,

            textAlign: "center"
          }}
        >

          {differenceStatus ===
          "matched"

            ? lang === "ar"
              ? "الكاش مطابق"
              : "Cash Matched"

            : differenceStatus ===
              "over"

            ? lang === "ar"
              ? "زيادة في الكاش"
              : "Cash Over"

            : lang === "ar"
            ? "عجز في الكاش"
            : "Cash Shortage"}

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
            "repeat(auto-fit,minmax(500px,1fr))",

          gap: 22
        }}
      >

        {/* ====================================================== */}
        {/* REFUNDS */}
        {/* ====================================================== */}

        <TableCard
          title="المرتجعات"
          icon={
            <RotateCcw
              size={18}
            />
          }
        >

          {todayRefunds.length ===
          0 ? (

            <EmptyState />

          ) : (

            <TableWrapper>

              <table
                style={table}
              >

                <thead>

                  <tr>

                    <Th>
                      المنتج
                    </Th>

                    <Th>
                      الكمية
                    </Th>

                    <Th>
                      السعر
                    </Th>

                    <Th>
                      التاريخ
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
          title="المصروفات"
          icon={
            <Wallet
              size={18}
            />
          }
        >

          {todayExpenses.length ===
          0 ? (

            <EmptyState />

          ) : (

            <TableWrapper>

              <table
                style={table}
              >

                <thead>

                  <tr>

                    <Th>
                      التصنيف
                    </Th>

                    <Th>
                      الملاحظة
                    </Th>

                    <Th>
                      المبلغ
                    </Th>

                    <Th>
                      التاريخ
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

  return (

    <div
      style={{
        ...cardStyle,

        padding: 24,

        minHeight: 165,

        position: "relative",

        overflow: "hidden"
      }}
    >

      <div
        style={{
          position:
            "absolute",

          top: -25,

          right: -25,

          width: 90,

          height: 90,

          borderRadius:
            "50%",

          background:
            `${color}15`
        }}
      />

      <div
        style={{
          display: "flex",

          justifyContent:
            "space-between",

          marginBottom: 20
        }}
      >

        <div
          style={{
            width: 48,

            height: 48,

            borderRadius: 14,

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            background:
              `${color}15`,

            color
          }}
        >
          {icon}
        </div>

      </div>

      <div
        style={{
          fontSize: 15,

          marginBottom: 12,

          color:
            theme.colors.textSecondary,

          fontWeight: 600
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 36,

          fontWeight: 800,

          color:
            theme.colors.text
        }}
      >
        {isMoney
          ? formatMoney(
              value
            )
          : value}
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
        {positive ? "+" : "-"}{" "}
        {formatMoney(value)}
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

function EmptyState() {

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
        لا توجد بيانات اليوم
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
        {formatMoney(value)}
      </div>

    </div>

  );

}
const table = {
  width: "100%",
  borderCollapse:
    "collapse",

  minWidth: 650
};