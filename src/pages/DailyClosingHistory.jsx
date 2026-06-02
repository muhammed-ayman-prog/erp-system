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

import {
  CalendarDays,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Wallet,
  CreditCard,
  Receipt,
  Landmark,
  Gift,
  RotateCcw,
  FileText,
  Store,
  User2,
  Clock3,
  BadgeDollarSign
} from "lucide-react";

import { db } from "../firebase";

import { useAuth } from "../store/useAuth";

import { useApp } from "../store/useApp";

import { useTranslate } from "../useTranslate";

import { theme } from "../theme";

// ======================================================
// HELPERS
// ======================================================

const cardStyle = {
  background:
    theme.colors.card,

  border:
    `1px solid ${theme.colors.border}`,

  borderRadius: 24,

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.05)"
};

const formatMoney = (num) => {

  return new Intl.NumberFormat(
    "en-US"
  ).format(Number(num || 0));

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

  " • " +

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

const getStatusConfig = (
  status,
  lang
) => {

  const config = {

    matched: {

      bg: "#dcfce7",

      color: "#166534",

      border:
        "#bbf7d0",

      label:
        lang === "ar"
          ? "مطابق"
          : "Matched"

    },

    over: {

      bg: "#fef3c7",

      color: "#92400e",

      border:
        "#fde68a",

      label:
        lang === "ar"
          ? "زيادة"
          : "Over"

    },

    short: {

      bg: "#fee2e2",

      color: "#991b1b",

      border:
        "#fecaca",

      label:
        lang === "ar"
          ? "عجز"
          : "Shortage"

    }

  };

  return (
    config[status] ||
    config.matched
  );

};

// ======================================================
// PAGE
// ======================================================

export default function DailyClosingHistory() {

  const { user } =
    useAuth();

  const {
    selectedBranch
  } = useApp();

  const {
    lang
  } = useTranslate();

  const isOwner =
    user?.role === "owner";

  const branchToUse =

    isOwner
      ? selectedBranch
      : user?.branchIds?.[0];

  const [loading, setLoading] =
    useState(true);

  const [closings, setClosings] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [
    expandedRow,
    setExpandedRow
  ] = useState(null);

  const [
    sortBy,
    setSortBy
  ] = useState("latest");

  // ======================================================
  // FETCH
  // ======================================================

  useEffect(() => {

    if (!branchToUse)
      return;

    setLoading(true);

    const q =

      isOwner &&
      branchToUse === "all"

        ? query(

            collection(
              db,
              "dailyClosings"
            ),

            orderBy(
              "createdAt",
              "desc"
            )

          )

        : query(

            collection(
              db,
              "dailyClosings"
            ),

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

        setClosings(

          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))

        );

        setLoading(false);

      },

      err => {

        console.log(err);

        setLoading(false);

      }

    );

    return () => unsub();

  }, [
    branchToUse,
    isOwner
  ]);

  // ======================================================
  // FILTER + SORT
  // ======================================================

  const filteredData =
    useMemo(() => {

      let data =
        [...closings];

      // SEARCH

      data =
        data.filter(item => {

          const text =

            `${item.branchName}
             ${item.createdBy}
             ${item.businessDate}
             ${item.notes || ""}
             ${item.differenceStatus}
            `
              .toLowerCase();

          return text.includes(
            search.toLowerCase()
          );

        });

      // SORT

      if (
        sortBy === "highestDiff"
      ) {

        data.sort(

          (a, b) =>

            Math.abs(
              b.difference || 0
            ) -

            Math.abs(
              a.difference || 0
            )

        );

      }

      if (
        sortBy === "cash"
      ) {

        data.sort(

          (a, b) =>

            (b.actualCash || 0) -
            (a.actualCash || 0)

        );

      }

      if (
        sortBy === "latest"
      ) {

        data.sort(

          (a, b) =>

            (
              b.createdAt
                ?.seconds || 0
            ) -

            (
              a.createdAt
                ?.seconds || 0
            )

        );

      }

      return data;

    }, [
      closings,
      search,
      sortBy
    ]);

  // ======================================================
  // KPI
  // ======================================================

  const stats =
    useMemo(() => {

      let matched = 0;

      let over = 0;

      let shortage = 0;

      filteredData.forEach(
        item => {

          if (
            item.differenceStatus ===
            "matched"
          ) {

            matched++;

          }

          else if (
            item.differenceStatus ===
            "over"
          ) {

            over++;

          }

          else {

            shortage++;

          }

        }
      );

      return {

        total:
          filteredData.length,

        matched,

        over,

        shortage

      };

    }, [filteredData]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",

          gap: 20
        }}
      >

        {Array.from({
          length: 4
        }).map((_, i) => (

          <div
            key={i}

            style={{
              height: 160,

              borderRadius: 24,

              background:
                "#e5e7eb",

              animation:
                "pulse 1.2s infinite"
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
        width: "100%"
      }}
    >

      {/* ====================================================== */}
      {/* ANIMATION */}
      {/* ====================================================== */}

      <style>

        {`

          @keyframes fadeIn {

            from {

              opacity: 0;

              transform:
                translateY(-4px);

            }

            to {

              opacity: 1;

              transform:
                translateY(0);

            }

          }

          @keyframes pulse {

            0% {
              opacity: 0.6;
            }

            50% {
              opacity: 1;
            }

            100% {
              opacity: 0.6;
            }

          }

          ::-webkit-scrollbar {

            height: 10px;
            width: 10px;

          }

          ::-webkit-scrollbar-thumb {

            background:
              #cbd5e1;

            border-radius:
              999px;

          }

        `}

      </style>

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

              fontSize: 34,

              fontWeight: 900,

              color:
                theme.colors.text
            }}
          >
            📚 سجل التقفيل اليومي
          </h1>

          <div
            style={{
              marginTop: 8,

              color:
                theme.colors.textSecondary,

              fontSize: 15
            }}
          >
            مراجعة جميع عمليات
            إغلاق اليومية
          </div>

        </div>

      </div>

      {/* ====================================================== */}
      {/* KPI */}
      {/* ====================================================== */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",

          gap: 18,

          marginBottom: 24
        }}
      >

        <StatCard
          title="اليوميات"
          value={stats.total}
          icon={
            <CalendarDays
              size={20}
            />
          }
          color="#2563eb"
        />

        <StatCard
          title="مطابق"
          value={stats.matched}
          icon={
            <CheckCircle2
              size={20}
            />
          }
          color="#16a34a"
        />

        <StatCard
          title="زيادة"
          value={stats.over}
          icon={
            <AlertTriangle
              size={20}
            />
          }
          color="#f59e0b"
        />

        <StatCard
          title="عجز"
          value={stats.shortage}
          icon={
            <TrendingDown
              size={20}
            />
          }
          color="#dc2626"
        />

      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div
        style={{
          ...cardStyle,

          padding: 18,

          marginBottom: 24
        }}
      >

        <div
          style={{
            display: "flex",

            gap: 14,

            flexWrap: "wrap"
          }}
        >

          {/* SEARCH */}

          <div
            style={{
              flex: 1,

              minWidth: 260,

              position: "relative"
            }}
          >

            <Search
              size={18}

              style={{
                position:
                  "absolute",

                top: "50%",

                transform:
                  "translateY(-50%)",

                right:
                  lang === "ar"
                    ? 16
                    : "unset",

                left:
                  lang === "en"
                    ? 16
                    : "unset",

                color:
                  theme.colors.textSecondary
              }}
            />

            <input
              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              placeholder={
                lang === "ar"
                  ? "بحث..."
                  : "Search..."
              }

              style={{
                width: "100%",

                height: 54,

                borderRadius: 14,

                border:
                  `1px solid ${theme.colors.border}`,

                padding:
                  lang === "ar"
                    ? "0 50px 0 16px"
                    : "0 16px 0 50px",

                fontSize: 15,

                outline: "none"
              }}
            />

          </div>

          {/* SORT */}

          <select
            value={sortBy}

            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }

            style={{
              height: 54,

              borderRadius: 14,

              border:
                `1px solid ${theme.colors.border}`,

              padding:
                "0 16px",

              minWidth: 220,

              background:
                "#fff",

              fontWeight: 600,

              outline: "none"
            }}
          >

            <option value="latest">
              الأحدث
            </option>

            <option value="highestDiff">
              أعلى فرق
            </option>

            <option value="cash">
              أعلى كاش
            </option>

          </select>

        </div>

      </div>

      {/* ====================================================== */}
      {/* EMPTY */}
      {/* ====================================================== */}

      {
        filteredData.length ===
          0 && (

          <div
            style={{
              ...cardStyle,

              padding: 60,

              textAlign: "center"
            }}
          >

            <div
              style={{
                fontSize: 60,

                marginBottom: 20
              }}
            >
              📭
            </div>

            <div
              style={{
                fontSize: 22,

                fontWeight: 800,

                marginBottom: 10
              }}
            >
              لا يوجد بيانات
            </div>

            <div
              style={{
                color:
                  theme.colors.textSecondary
              }}
            >
              لم يتم العثور على
              أي تقفيل يومي
            </div>

          </div>

        )
      }

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      {
        filteredData.length >
          0 && (

          <div
            style={{
              ...cardStyle,

              overflow:
                "hidden"
            }}
          >

            <div
              style={{
                overflowX:
                  "auto"
              }}
            >

              <table
                style={{
                  width: "100%",

                  borderCollapse:
                    "collapse",

                  minWidth: 1100
                }}
              >

                <thead>

                  <tr>

                    <Th width={60}>
                    </Th>

                    <Th>
                      الفرع
                    </Th>

                    <Th>
                      Date
                    </Th>

                    <Th>
                      المتوقع
                    </Th>

                    <Th>
                      الفعلي
                    </Th>

                    <Th>
                      الفرق
                    </Th>

                    <Th>
                      الحالة
                    </Th>

                    <Th>
                      المستخدم
                    </Th>

                    <Th>
                      وقت الحفظ
                    </Th>

                  </tr>

                </thead>

                <tbody>

                  {
                    filteredData.map(
                      item => {

                        const isExpanded =

                          expandedRow ===
                          item.id;

                        const status =
                          getStatusConfig(
                            item.differenceStatus,
                            lang
                          );

                        return (

                          <>
                            {/* ====================================================== */}
                            {/* ROW */}
                            {/* ====================================================== */}

                            <tr
                              key={
                                item.id
                              }

                              onClick={() =>

                                setExpandedRow(

                                  isExpanded
                                    ? null
                                    : item.id
                                )
                              }

                              onMouseEnter={(e) => {

                                e.currentTarget.style.background =
                                  "#f8fafc";

                              }}

                              onMouseLeave={(e) => {

                                e.currentTarget.style.background =

                                  isExpanded
                                    ? "#f8fafc"
                                    : "#fff";

                              }}

                              style={{
                                cursor:
                                  "pointer",

                                transition:
                                  "0.2s",

                                background:
                                  isExpanded
                                    ? "#f8fafc"
                                    : "#fff"
                              }}
                            >

                              <Td>

                                {
                                  isExpanded

                                    ? (
                                      <ChevronUp
                                        size={18}
                                      />
                                    )

                                    : (
                                      <ChevronDown
                                        size={18}
                                      />
                                    )
                                }

                              </Td>

                              <Td>
                                <CellWithIcon
                                  icon={
                                    <Store
                                      size={14}
                                    />
                                  }

                                  text={
                                    item.branchName
                                  }
                                />
                              </Td>

                              <Td>
                                {
                                  item.businessDate ||
                                  "-"
                                }
                              </Td>

                              <Td>
                                {formatMoney(
                                  item.expectedCash
                                )}
                              </Td>

                              <Td>
                                {formatMoney(
                                  item.actualCash
                                )}
                              </Td>

                              <Td
                                color={
                                  status.color
                                }
                              >
                                {formatMoney(
                                  item.difference
                                )}
                              </Td>

                              <Td>

                                <StatusBadge
                                  status={
                                    item.differenceStatus
                                  }

                                  lang={
                                    lang
                                  }
                                />

                              </Td>

                              <Td>

                                <CellWithIcon
                                  icon={
                                    <User2
                                      size={14}
                                    />
                                  }

                                  text={
                                    item.createdBy
                                  }
                                />

                              </Td>

                              <Td>

                                <CellWithIcon
                                  icon={
                                    <Clock3
                                      size={14}
                                    />
                                  }

                                  text={formatDate(
                                    item.createdAt,
                                    lang
                                  )}
                                />

                              </Td>

                            </tr>

                            {/* ====================================================== */}
                            {/* EXPANDED */}
                            {/* ====================================================== */}

                            {
                              isExpanded && (

                                <tr>

                                  <td
                                    colSpan={
                                      9
                                    }

                                    style={{
                                      padding: 0,

                                      background:
                                        "#f8fafc"
                                    }}
                                  >

                                    <div
                                      style={{
                                        padding: 24,

                                        animation:
                                          "fadeIn 0.2s ease"
                                      }}
                                    >

                                      {/* ====================================================== */}
                                      {/* SUMMARY */}
                                      {/* ====================================================== */}

                                      <div
                                        style={{
                                          display:
                                            "flex",

                                          justifyContent:
                                            "space-between",

                                          alignItems:
                                            "center",

                                          flexWrap:
                                            "wrap",

                                          gap: 16,

                                          marginBottom: 20
                                        }}
                                      >

                                        <div>

                                          <div
                                            style={{
                                              fontSize: 13,

                                              color:
                                                theme.colors.textSecondary
                                            }}
                                          >
                                            ملخص
                                            اليومية
                                          </div>

                                          <div
                                            style={{
                                              fontSize: 24,

                                              fontWeight: 900
                                            }}
                                          >

                                            {formatMoney(
                                              item.actualCash
                                            )}

                                            {" "}
                                            EGP

                                          </div>

                                        </div>

                                        <StatusBadge
                                          status={
                                            item.differenceStatus
                                          }

                                          lang={
                                            lang
                                          }
                                        />

                                      </div>

                                      {/* ====================================================== */}
                                      {/* BREAKDOWN */}
                                      {/* ====================================================== */}

                                      <div
                                        style={{
                                          display:
                                            "grid",

                                          gridTemplateColumns:
                                            "repeat(auto-fit,minmax(190px,1fr))",

                                          gap: 16
                                        }}
                                      >

                                        <BreakdownCard
                                          title="إجمالي المبيعات"
                                          value={
                                            item.totalSales
                                          }
                                          color="#2563eb"
                                          icon={
                                            <BadgeDollarSign
                                              size={18}
                                            />
                                          }
                                        />

                                        <BreakdownCard
                                          title="كاش"
                                          value={
                                            item.cashSales
                                          }
                                          color="#16a34a"
                                          icon={
                                            <Wallet
                                              size={18}
                                            />
                                          }
                                        />

                                        <BreakdownCard
                                          title="فيزا"
                                          value={
                                            item.visaSales
                                          }
                                          color="#7c3aed"
                                          icon={
                                            <CreditCard
                                              size={18}
                                            />
                                          }
                                        />

                                        <BreakdownCard
                                          title="Instapay"
                                          value={
                                            item.instapaySales
                                          }
                                          color="#0f766e"
                                          icon={
                                            <Landmark
                                              size={18}
                                            />
                                          }
                                        />

                                        <BreakdownCard
                                          title="مرتجعات"
                                          value={
                                            item.refunds
                                          }
                                          color="#dc2626"
                                          icon={
                                            <RotateCcw
                                              size={18}
                                            />
                                          }
                                        />

                                        <BreakdownCard
                                          title="مصروفات"
                                          value={
                                            item.expenses
                                          }
                                          color="#ea580c"
                                          icon={
                                            <Receipt
                                              size={18}
                                            />
                                          }
                                        />

                                        <BreakdownCard
                                          title="سلف"
                                          value={
                                            item.loans
                                          }
                                          color="#eab308"
                                          icon={
                                            <Landmark
                                              size={18}
                                            />
                                          }
                                        />

                                        <BreakdownCard
                                          title="حوافز"
                                          value={
                                            item.bonuses
                                          }
                                          color="#22c55e"
                                          icon={
                                            <Gift
                                              size={18}
                                            />
                                          }
                                        />

                                        <BreakdownCard
                                          title="الفواتير"
                                          value={
                                            item.invoices
                                          }
                                          color="#334155"

                                          icon={
                                            <FileText
                                              size={18}
                                            />
                                          }

                                          isMoney={false}
                                        />

                                      </div>

                                      {/* ====================================================== */}
                                      {/* NOTES */}
                                      {/* ====================================================== */}

                                      {
                                        item.notes && (

                                          <div
                                            style={{
                                              marginTop: 20,

                                              background:
                                                "#fff",

                                              border:
                                                `1px solid ${theme.colors.border}`,

                                              borderRadius: 20,

                                              padding: 20
                                            }}
                                          >

                                            <div
                                              style={{
                                                fontWeight: 800,

                                                marginBottom: 10,

                                                fontSize: 15
                                              }}
                                            >
                                              ملاحظات
                                            </div>

                                            <div
                                              style={{
                                                color:
                                                  theme.colors.textSecondary,

                                                lineHeight: 1.8
                                              }}
                                            >
                                              {
                                                item.notes
                                              }
                                            </div>

                                          </div>

                                        )
                                      }

                                    </div>

                                  </td>

                                </tr>

                              )
                            }

                          </>

                        );

                      }
                    )
                  }

                </tbody>

              </table>

            </div>

          </div>

        )
      }

    </div>

  );

}

// ======================================================
// KPI CARD
// ======================================================

function StatCard({
  title,
  value,
  icon,
  color
}) {

  return (

    <div
      style={{
        ...cardStyle,

        padding: 24,

        minHeight: 150,

        position:
          "relative",

        overflow:
          "hidden"
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
          width: 50,

          height: 50,

          borderRadius: 14,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            `${color}15`,

          color,

          marginBottom: 20
        }}
      >

        {icon}

      </div>

      <div
        style={{
          fontSize: 14,

          color:
            theme.colors.textSecondary,

          marginBottom: 10
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 34,

          fontWeight: 900
        }}
      >
        {value}
      </div>

    </div>

  );

}

// ======================================================
// STATUS
// ======================================================

function StatusBadge({
  status,
  lang
}) {

  const item =
    getStatusConfig(
      status,
      lang
    );

  return (

    <div
      style={{
        width: "fit-content",

        padding:
          "8px 14px",

        borderRadius: 999,

        background:
          item.bg,

        color:
          item.color,

        border:
          `1px solid ${item.border}`,

        fontWeight: 800,

        fontSize: 13
      }}
    >

      {item.label}

    </div>

  );

}

// ======================================================
// BREAKDOWN CARD
// ======================================================

function BreakdownCard({
  title,
  value,
  color,
  icon,
  isMoney = true
}) {

  return (

    <div
      style={{
        background:
          "#fff",

        border:
          `1px solid ${theme.colors.border}`,

        borderRadius: 20,

        padding: 18,

        minHeight: 130,

        display: "flex",

        flexDirection:
          "column",

        justifyContent:
          "space-between",

        transition:
          "0.2s"
      }}
    >

      <div
        style={{
          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between"
        }}
      >

        <div
          style={{
            fontSize: 13,

            color:
              theme.colors.textSecondary
          }}
        >
          {title}
        </div>

        <div
          style={{
            width: 36,

            height: 36,

            borderRadius: 12,

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
          fontSize: 24,

          fontWeight: 900,

          color
        }}
      >

        {
          isMoney

            ? formatMoney(
                value
              )

            : value
        }

      </div>

    </div>

  );

}

// ======================================================
// CELL WITH ICON
// ======================================================

function CellWithIcon({
  icon,
  text
}) {

  return (

    <div
      style={{
        display: "flex",

        alignItems:
          "center",

        gap: 8
      }}
    >

      <div
        style={{
          color:
            theme.colors.textSecondary
        }}
      >
        {icon}
      </div>

      <div>
        {text}
      </div>

    </div>

  );

}

// ======================================================
// TH
// ======================================================

function Th({
  children,
  width
}) {

  return (

    <th
      style={{
        width,

        position:
          "sticky",

        top: 0,

        zIndex: 5,

        padding: 16,

        background:
          "#f8fafc",

        borderBottom:
          `1px solid ${theme.colors.border}`,

        whiteSpace:
          "nowrap",

        textAlign:
          "start",

        fontSize: 13,

        fontWeight: 800,

        color:
          theme.colors.textSecondary
      }}
    >

      {children}

    </th>

  );

}

// ======================================================
// TD
// ======================================================

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

        fontWeight: 600,

        color:
          color ||
          theme.colors.text
      }}
    >

      {children}

    </td>

  );

}