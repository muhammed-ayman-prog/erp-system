import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Gift,
  Landmark,
  Receipt,
  RotateCcw,
  Search,
  Store,
  TrendingDown,
  User2,
  Wallet,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { exportClosingPDF } from "../utils/exportClosingPDF";
import { db } from "../firebase";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { useTranslate } from "../useTranslate";
import { theme } from "../theme";

// ======================================================
// HELPERS
// ======================================================

const cardStyle = {
  background: theme.colors.card,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: 22,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.045)",
};

const formatMoney = (num, lang = "en") => {
  return `${new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US").format(
    Number(num || 0)
  )} EGP`;
};

const formatDate = (timestamp, lang) => {
  if (!timestamp) return "-";

  let date = null;

  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (typeof timestamp.seconds === "number") {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }

  if (!date || Number.isNaN(date.getTime())) return "-";

  const datePart = date.toLocaleDateString(
    lang === "ar" ? "ar-EG" : "en-GB",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );

  const timePart = date.toLocaleTimeString(
    lang === "ar" ? "ar-EG" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return `${datePart} • ${timePart}`;
};

const getStatusConfig = (status, lang) => {
  const config = {
    matched: {
      bg: "#F0FDF4",
      color: "#15803D",
      border: "#BBF7D0",
      label: lang === "ar" ? "مطابق" : "Matched",
    },
    over: {
      bg: "#FFFBEB",
      color: "#B45309",
      border: "#FDE68A",
      label: lang === "ar" ? "زيادة" : "Over", 
    },
    short: {
      bg: "#FEF2F2",
      color: "#B91C1C",
      border: "#FECACA",
      label: lang === "ar" ? "عجز" : "Shortage",
    },
  };

  return config[status] || config.matched;
};

const getDifferenceStatus = (difference) => {
  const value = Number(difference || 0);
  if (value === 0) return "matched";
  return value > 0 ? "over" : "short";
};

// ======================================================
// PAGE
// ======================================================

export default function DailyClosingHistory() {
  const { user } = useAuth();
  const { selectedBranch } = useApp();
  const { lang, t } = useTranslate();

  const isOwner = user?.role === "owner";
  const branchToUse = isOwner ? selectedBranch : user?.branchIds?.[0];

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const [loading, setLoading] = useState(true);
  const [closings, setClosings] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortBy, setSortBy] = useState("latest");

  // ====================================================
  // FETCH CLOSINGS
  // ====================================================

  useEffect(() => {
    if (!branchToUse) {
      setClosings([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
setClosings([]);
setExpandedRow(null);

    const closingsQuery =
      isOwner && branchToUse === "all"
        ? query(
            collection(db, "dailyClosings"),
            orderBy("createdAt", "desc")
          )
        : query(
            collection(db, "dailyClosings"),
            where("branchId", "==", branchToUse),
            orderBy("createdAt", "desc")
          );

    const unsubscribe = onSnapshot(
      closingsQuery,
      (snapshot) => {
        setClosings(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }))
        );
        setExpandedRow(null);
        setSearch("");
        setLoading(false);
      },
      (error) => {
        console.error("Daily Closing History Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [branchToUse, isOwner]);

  // ====================================================
  // FILTER + SORT
  // ====================================================

  const filteredData = useMemo(() => {
    let data = [...closings];

    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      data = data.filter((item) => {
        const searchableText = `${item.branchName || ""}
          ${item.createdBy || ""}
          ${item.businessDate || ""}
          ${item.notes || ""}
          ${item.differenceStatus || ""}`.toLowerCase();

        return searchableText.includes(searchTerm);
      });
    }

    if (sortBy === "highestDiff") {
      data.sort(
        (a, b) =>
          Math.abs(Number(b.difference || 0)) -
          Math.abs(Number(a.difference || 0))
      );
    }

    if (sortBy === "cash") {
      data.sort(
        (a, b) =>
          Number(b.actualCash || 0) - Number(a.actualCash || 0)
      );
    }

    if (sortBy === "latest") {
      data.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
    }

    return data;
  }, [closings, search, sortBy]);

  // ====================================================
  // KPI
  // ====================================================

  const stats = useMemo(() => {
    let matched = 0;
    let over = 0;
    let shortage = 0;

    filteredData.forEach((item) => {
      if (item.differenceStatus === "matched") {
        matched += 1;
      } else if (item.differenceStatus === "over") {
        over += 1;
      } else {
        shortage += 1;
      }
    });

    return {
      total: filteredData.length,
      matched,
      over,
      shortage,
    };
  }, [filteredData]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            style={{
              height: 150,
              borderRadius: 22,
              background: "#E8EEF6",
              animation: "closingHistoryPulse 1.3s ease-in-out infinite",
            }}
          />
        ))}
        <style>{`
          @keyframes closingHistoryPulse {
            0%, 100% { opacity: .55; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      key={branchToUse}
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        width: "100%",
        minWidth: 0,
        paddingBottom: 32,
      }}
    >
      <style>{`
        @keyframes closingHistoryFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .closing-history-row:hover { background: #F8FAFC !important; }
        .closing-history-search:focus,
        .closing-history-sort:focus {
          border-color: #93C5FD !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, .09);
        }
        .closing-history-pdf:hover {
          transform: translateY(-2px);
          background: #DBEAFE !important;
        }
        .closing-history-pdf:active { transform: translateY(0); }
      `}</style>

      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: isMobile ? 18 : 25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 24,
          background: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 72%)",
          borderColor: "#DBEAFE",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: isMobile ? 48 : 56,
              height: isMobile ? 48 : 56,
              minWidth: isMobile ? 48 : 56,
              borderRadius: 17,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#DBEAFE",
              color: "#2563EB",
            }}
          >
            <FileText size={isMobile ? 23 : 27} />
          </div>

          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: isMobile ? 21 : 27,
                lineHeight: 1.3,
                fontWeight: 900,
              }}
            >
              {t("dailyClosing.historyTitle")}
            </h1>
            <div
              style={{
                marginTop: 6,
                color: "#64748B",
                fontSize: isMobile ? 12 : 14,
                lineHeight: 1.6,
              }}
            >
              {t("dailyClosing.reviewClosings")}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "10px 14px",
            borderRadius: 14,
            background: "#FFFFFF",
            border: "1px solid #DBEAFE",
            color: "#1D4ED8",
            fontSize: 13,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          <CalendarDays size={17} />
          <span>
            {stats.total} {lang === "ar" ? "يومية" : "closings"}
          </span>
        </div>
      </div>

      {/* ================================================== */}
      {/* KPI CARDS */}
      {/* ================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(4, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          title={t("dailyClosing.closings")}
          value={stats.total}
          icon={<CalendarDays size={19} />}
          color="#2563EB"
        />
        <StatCard
          title={t("dailyClosing.matchedCount")}
          value={stats.matched}
          icon={<CheckCircle2 size={19} />}
          color="#16A34A"
        />
        <StatCard
          title={t("dailyClosing.cashOver")}
          value={stats.over}
          icon={<AlertTriangle size={19} />}
          color="#D97706"
        />
        <StatCard
          title={t("dailyClosing.shortages")}
          value={stats.shortage}
          icon={<TrendingDown size={19} />}
          color="#DC2626"
        />
      </div>

      {/* ================================================== */}
      {/* SEARCH + FILTERS */}
      {/* ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: isMobile ? 16 : 20,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 15,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 850,
                color: theme.colors.text,
              }}
            >
              {lang === "ar" ? "البحث والتصفية" : "Search & Filters"}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: theme.colors.textSecondary,
              }}
            >
              {lang === "ar"
                ? "ابحث باسم الفرع أو الموظف أو التاريخ أو الملاحظات"
                : "Search by branch, employee, date, or notes"}
            </div>
          </div>

          <div
            style={{
              padding: "7px 11px",
              borderRadius: 10,
              background: "#F8FAFC",
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.textSecondary,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {filteredData.length} {lang === "ar" ? "نتيجة" : "results"}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(240px, 1fr) minmax(200px, 250px) auto",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", minWidth: 0 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                right: lang === "ar" ? 15 : "auto",
                left: lang === "en" ? 15 : "auto",
                color: "#94A3B8",
                pointerEvents: "none",
              }}
            />
            <input
              className="closing-history-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("dailyClosing.search")}
              style={{
                width: "100%",
                height: 48,
                boxSizing: "border-box",
                borderRadius: 13,
                border: `1px solid ${theme.colors.border}`,
                padding: lang === "ar" ? "0 44px 0 14px" : "0 14px 0 44px",
                background: "#FFFFFF",
                color: theme.colors.text,
                fontSize: 14,
                outline: "none",
                transition: "all .2s ease",
              }}
            />
          </div>

          <select
            className="closing-history-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 13,
              border: `1px solid ${theme.colors.border}`,
              padding: "0 13px",
              background: "#FFFFFF",
              color: theme.colors.text,
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
              transition: "all .2s ease",
              cursor: "pointer",
            }}
          >
            <option value="latest">{t("dailyClosing.latest")}</option>
            <option value="highestDiff">{t("dailyClosing.highestDiff")}</option>
            <option value="cash">{t("dailyClosing.highestCash")}</option>
          </select>

          <button
            type="button"
            onClick={() => setSearch("")}
            disabled={!search}
            style={{
              height: 48,
              padding: "0 17px",
              borderRadius: 13,
              border: `1px solid ${theme.colors.border}`,
              background: search ? "#EFF6FF" : "#F8FAFC",
              color: search ? "#2563EB" : "#94A3B8",
              fontSize: 13,
              fontWeight: 800,
              cursor: search ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            {lang === "ar" ? "مسح البحث" : "Clear Search"}
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* EMPTY STATE */}
      {/* ================================================== */}

      {filteredData.length === 0 && (
        <div
          style={{
            ...cardStyle,
            padding: isMobile ? 32 : 56,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              margin: "0 auto 17px",
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#EFF6FF",
              color: "#2563EB",
            }}
          >
            <FileText size={31} />
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 900,
              color: theme.colors.text,
              marginBottom: 8,
            }}
          >
            {t("common.noData")}
          </div>
          <div
            style={{
              color: theme.colors.textSecondary,
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            {t("dailyClosing.noData")}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* HISTORY TABLE */}
      {/* ================================================== */}

      {filteredData.length > 0 && (
        <div
          style={{
            ...cardStyle,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: isMobile ? "16px" : "19px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              borderBottom: `1px solid ${theme.colors.border}`,
              background: "linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#EFF6FF",
                  color: "#2563EB",
                }}
              >
                <CalendarDays size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 850,
                    color: theme.colors.text,
                  }}
                >
                  {lang === "ar" ? "سجل التقفيلات اليومية" : "Daily Closing Records"}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 11,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {lang === "ar" ? "اضغط على أي صف لعرض التفاصيل" : "Select a row to view its details"}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "7px 11px",
                borderRadius: 10,
                background: "#F8FAFC",
                color: "#475569",
                border: "1px solid #E2E8F0",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {filteredData.length} {lang === "ar" ? "سجل" : "records"}
            </div>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            {isMobile && (
              <div
                style={{
                  padding: "10px 15px",
                  fontSize: 11,
                  color: theme.colors.textSecondary,
                  background: "#F8FAFC",
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                {lang === "ar" ? "اسحب الجدول أفقيًا لعرض باقي البيانات ←" : "Scroll horizontally to view all columns →"}
              </div>
            )}

            <table
              style={{
                width: "100%",
                minWidth: isMobile ? 1040 : 1120,
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  <Th width={52}></Th>
                  <Th>{t("dailyClosing.branch")}</Th>
                  <Th>{t("common.date")}</Th>
                  <Th>{t("dailyClosing.expected")}</Th>
                  <Th>{t("dailyClosing.actual")}</Th>
                  <Th>{t("dailyClosing.difference")}</Th>
                  <Th>{t("dailyClosing.status")}</Th>
                  <Th>{t("dailyClosing.user")}</Th>
                  <Th>{t("dailyClosing.createdAt")}</Th>
                  <Th>{t("common.pdf")}</Th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item) => {
                  const isExpanded = expandedRow === item.id;
                  const status = getStatusConfig(item.differenceStatus, lang);

                  const showVisa =
                    item.expectedVisa !== undefined ||
                    item.actualVisa !== undefined ||
                    item.visaDifference !== undefined;

                  const showInstapay =
                    item.expectedInstapay !== undefined ||
                    item.actualInstapay !== undefined ||
                    item.instapayDifference !== undefined;

                  return (
                    <Fragment key={item.id}>
                      <tr
                        className="closing-history-row"
                        onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                        style={{
                          cursor: "pointer",
                          background: isExpanded ? "#F8FAFC" : "#FFFFFF",
                          transition: "background .18s ease",
                        }}
                      >
                        <Td center>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 9,
                              background: isExpanded ? "#DBEAFE" : "#F1F5F9",
                              color: isExpanded ? "#2563EB" : "#64748B",
                            }}
                          >
                            {isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                          </div>
                        </Td>

                        <Td>
                          <CellWithIcon icon={<Store size={15} />} text={item.branchName || "-"} />
                        </Td>

                        <Td>
                          <span style={{ fontWeight: 750, color: "#334155" }}>
                            {item.businessDate || "-"}
                          </span>
                        </Td>

                        <Td>
                          <span dir="ltr" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatMoney(item.expectedCash, lang)}
                          </span>
                        </Td>

                        <Td>
                          <span dir="ltr" style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                            {formatMoney(item.actualCash, lang)}
                          </span>
                        </Td>

                        <Td color={status.color}>
                          <span dir="ltr" style={{ fontWeight: 850, fontVariantNumeric: "tabular-nums" }}>
                            {formatMoney(item.difference, lang)}
                          </span>
                        </Td>

                        <Td>
                          <StatusBadge status={item.differenceStatus} lang={lang} />
                        </Td>

                        <Td>
                          <CellWithIcon icon={<User2 size={14} />} text={item.createdBy || "-"} />
                        </Td>

                        <Td>
                          <CellWithIcon icon={<Clock3 size={14} />} text={formatDate(item.createdAt, lang)} />
                        </Td>

                        <Td>
                          <button
                            type="button"
                            className="closing-history-pdf"
                            title={lang === "ar" ? "تحميل PDF" : "Download PDF"}
                            aria-label={lang === "ar" ? "تحميل PDF" : "Download PDF"}
                            onClick={(event) => {
                              event.stopPropagation();
                              exportClosingPDF(item, lang);
                            }}
                            style={{
                              width: 39,
                              height: 39,
                              borderRadius: 11,
                              border: "1px solid #BFDBFE",
                              background: "#EFF6FF",
                              color: "#2563EB",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all .18s ease",
                            }}
                          >
                            <Download size={17} />
                          </button>
                        </Td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={10}
                            style={{
                              padding: 0,
                              background: "#F8FAFC",
                              borderBottom: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <div
                              style={{
                                padding: isMobile ? 15 : 23,
                                animation: "closingHistoryFadeIn .2s ease",
                              }}
                            >
                              {/* DETAIL HEADER */}
                              <div
                                style={{
                                  ...cardStyle,
                                  padding: isMobile ? 15 : 19,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: 13,
                                  marginBottom: 17,
                                  background: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)",
                                  borderColor: "#DBEAFE",
                                  boxShadow: "none",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <div
                                    style={{
                                      width: 42,
                                      height: 42,
                                      minWidth: 42,
                                      borderRadius: 13,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: "#DBEAFE",
                                      color: "#2563EB",
                                    }}
                                  >
                                    <BadgeDollarSign size={21} />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>
                                      {t("dailyClosing.summary")}
                                    </div>
                                    <div
                                      dir="ltr"
                                      style={{
                                        fontSize: isMobile ? 19 : 23,
                                        color: "#0F172A",
                                        fontWeight: 900,
                                        fontVariantNumeric: "tabular-nums",
                                      }}
                                    >
                                      {formatMoney(item.actualCash, lang)}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                  <div
                                    style={{
                                      padding: "8px 11px",
                                      borderRadius: 10,
                                      background: "#FFFFFF",
                                      border: "1px solid #DBEAFE",
                                      color: "#475569",
                                      fontSize: 12,
                                      fontWeight: 750,
                                    }}
                                  >
                                    {item.businessDate || "-"}
                                  </div>
                                  <StatusBadge status={item.differenceStatus} lang={lang} />
                                </div>
                              </div>

                              {/* PAYMENT RECONCILIATION */}
                              <div style={{ marginBottom: 18 }}>
                                <SectionHeading
                                  title={lang === "ar" ? "مطابقة وسائل الدفع" : "Payment Reconciliation"}
                                  subtitle={lang === "ar" ? "مقارنة المتوقع بالفعلي لكل وسيلة دفع" : "Expected vs actual amount for each payment method"}
                                />

                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: isMobile
                                      ? "1fr"
                                      : "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: 13,
                                  }}
                                >
                                  <PaymentReconciliationCard
                                    title={lang === "ar" ? "الكاش" : "Cash"}
                                    expected={item.expectedCash}
                                    actual={item.actualCash}
                                    difference={item.difference}
                                    status={item.differenceStatus}
                                    color="#16A34A"
                                    icon={<Wallet size={18} />}
                                    lang={lang}
                                  />

                                  {showVisa && (
                                    <PaymentReconciliationCard
                                      title={lang === "ar" ? "الفيزا" : "Visa"}
                                      expected={item.expectedVisa}
                                      actual={item.actualVisa}
                                      difference={item.visaDifference}
                                      status={item.visaDifferenceStatus}
                                      color="#7C3AED"
                                      icon={<CreditCard size={18} />}
                                      lang={lang}
                                    />
                                  )}

                                  {showInstapay && (
                                    <PaymentReconciliationCard
                                      title="InstaPay"
                                      expected={item.expectedInstapay}
                                      actual={item.actualInstapay}
                                      difference={item.instapayDifference}
                                      status={item.instapayDifferenceStatus}
                                      color="#0F766E"
                                      icon={<Landmark size={18} />}
                                      lang={lang}
                                    />
                                  )}
                                </div>
                              </div>

                              {/* DAY BREAKDOWN */}
                              <div style={{ marginBottom: item.notes ? 17 : 0 }}>
                                <SectionHeading
                                  title={lang === "ar" ? "ملخص حركة اليوم" : "Daily Activity Summary"}
                                  subtitle={lang === "ar" ? "إجمالي المبيعات والحركات المسجلة أثناء اليوم" : "Sales totals and transactions recorded during the business day"}
                                />

                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: isMobile
                                      ? "repeat(2, minmax(0, 1fr))"
                                      : "repeat(auto-fit, minmax(175px, 1fr))",
                                    gap: 12,
                                  }}
                                >
                                  <BreakdownCard
                                    title={t("dailyClosing.salesTotal")}
                                    value={item.totalSales}
                                    lang={lang}
                                    color="#2563EB"
                                    icon={<BadgeDollarSign size={18} />}
                                  />
                                  <BreakdownCard
                                    title={t("dailyClosing.cashOnly")}
                                    value={item.cashSales}
                                    lang={lang}
                                    color="#16A34A"
                                    icon={<Wallet size={18} />}
                                  />
                                  <BreakdownCard
                                    title={t("dailyClosing.visa")}
                                    value={item.visaSales}
                                    lang={lang}
                                    color="#7C3AED"
                                    icon={<CreditCard size={18} />}
                                  />
                                  <BreakdownCard
                                    title={t("dailyClosing.instapay")}
                                    value={item.instapaySales}
                                    lang={lang}
                                    color="#0F766E"
                                    icon={<Landmark size={18} />}
                                  />
                                  <BreakdownCard
                                    title={t("dailyClosing.refundsOnly")}
                                    value={item.refunds}
                                    lang={lang}
                                    color="#DC2626"
                                    icon={<RotateCcw size={18} />}
                                  />
                                  <BreakdownCard
                                    title={t("dailyClosing.expensesOnly")}
                                    value={item.expenses}
                                    lang={lang}
                                    color="#EA580C"
                                    icon={<Receipt size={18} />}
                                  />
                                  <BreakdownCard
                                    title={t("dailyClosing.loansOnly")}
                                    value={item.loans}
                                    lang={lang}
                                    color="#D97706"
                                    icon={<Landmark size={18} />}
                                  />
                                  <BreakdownCard
                                    title={t("dailyClosing.bonusesOnly")}
                                    value={item.bonuses}
                                    lang={lang}
                                    color="#22A06B"
                                    icon={<Gift size={18} />}
                                  />
                                  <BreakdownCard
                                    title={t("dailyClosing.invoiceCount")}
                                    value={item.invoices}
                                    lang={lang}
                                    color="#475569"
                                    icon={<FileText size={18} />}
                                    isMoney={false}
                                  />
                                </div>
                              </div>

                              {/* NOTES */}
                              {item.notes && (
                                <div
                                  style={{
                                    borderRadius: 16,
                                    padding: 17,
                                    background: "#FFFFFF",
                                    border: `1px solid ${theme.colors.border}`,
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 11,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 34,
                                      height: 34,
                                      minWidth: 34,
                                      borderRadius: 10,
                                      background: "#F1F5F9",
                                      color: "#475569",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FileText size={17} />
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 850,
                                        color: theme.colors.text,
                                        marginBottom: 6,
                                      }}
                                    >
                                      {t("dailyClosing.notesTitle")}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        lineHeight: 1.8,
                                        color: theme.colors.textSecondary,
                                        whiteSpace: "pre-wrap",
                                        overflowWrap: "anywhere",
                                      }}
                                    >
                                      {item.notes}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// UI COMPONENTS
// ======================================================

function StatCard({ title, value, icon, color }) {
  return (
    <div
      style={{
        ...cardStyle,
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
        minHeight: 126,
        padding: 17,
        borderRadius: 18,
        boxShadow: "0 3px 12px rgba(15, 23, 42, .035)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 14,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 90,
          height: 90,
          borderRadius: "50%",
          top: -38,
          right: -33,
          background: `${color}0D`,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, position: "relative" }}>
        <div
          style={{
            width: 37,
            height: 37,
            minWidth: 37,
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${color}14`,
            color,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            color: theme.colors.textSecondary,
            fontSize: 12,
            lineHeight: 1.45,
            fontWeight: 700,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          color: theme.colors.text,
          fontSize: "clamp(25px, 3vw, 31px)",
          lineHeight: 1.1,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: theme.colors.text }}>
        {title}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.6, color: theme.colors.textSecondary }}>
        {subtitle}
      </div>
    </div>
  );
}

function StatusBadge({ status, lang }) {
  const item = getStatusConfig(status, lang);

  return (
    <div
      style={{
        width: "fit-content",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 11px",
        borderRadius: 999,
        background: item.bg,
        color: item.color,
        border: `1px solid ${item.border}`,
        fontWeight: 850,
        fontSize: 11,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
      {item.label}
    </div>
  );
}

function PaymentReconciliationCard({
  title,
  expected,
  actual,
  difference,
  status,
  color,
  icon,
  lang,
}) {
  const expectedValue = Number(expected || 0);
  const actualValue = Number(actual || 0);
  const differenceValue =
    difference === undefined || difference === null
      ? actualValue - expectedValue
      : Number(difference || 0);
  const resolvedStatus = status || getDifferenceStatus(differenceValue);
  const statusConfig = getStatusConfig(resolvedStatus, lang);

  return (
    <div
      style={{
        ...cardStyle,
        minWidth: 0,
        padding: 16,
        borderRadius: 17,
        boxShadow: "0 2px 8px rgba(15, 23, 42, .025)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div
            style={{
              width: 35,
              height: 35,
              minWidth: 35,
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${color}14`,
              color,
            }}
          >
            {icon}
          </div>
          <div style={{ fontSize: 13, fontWeight: 850, color: theme.colors.text }}>
            {title}
          </div>
        </div>
        <StatusBadge status={resolvedStatus} lang={lang} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ReconciliationValue label={lang === "ar" ? "المتوقع" : "Expected"} value={expectedValue} lang={lang} />
        <ReconciliationValue label={lang === "ar" ? "الفعلي" : "Actual"} value={actualValue} lang={lang} />
      </div>

      <div
        style={{
          marginTop: 13,
          paddingTop: 12,
          borderTop: `1px dashed ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: theme.colors.textSecondary, fontWeight: 750 }}>
          {lang === "ar" ? "الفرق" : "Difference"}
        </span>
        <span
          dir="ltr"
          style={{
            color: statusConfig.color,
            fontSize: 14,
            fontWeight: 900,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatMoney(differenceValue, lang)}
        </span>
      </div>
    </div>
  );
}

function ReconciliationValue({ label, value, lang }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10, color: theme.colors.textSecondary, marginBottom: 5, fontWeight: 700 }}>
        {label}
      </div>
      <div
        dir="ltr"
        style={{
          color: theme.colors.text,
          fontSize: 13,
          fontWeight: 850,
          fontVariantNumeric: "tabular-nums",
          overflowWrap: "anywhere",
        }}
      >
        {formatMoney(value, lang)}
      </div>
    </div>
  );
}

function BreakdownCard({ title, value, color, icon, lang, isMoney = true }) {
  return (
    <div
      style={{
        ...cardStyle,
        minWidth: 0,
        minHeight: isMoney ? 112 : 100,
        padding: 15,
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(15, 23, 42, .025)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 13,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 11, lineHeight: 1.5, fontWeight: 750, color: theme.colors.textSecondary }}>
          {title}
        </div>
        <div
          style={{
            width: 33,
            height: 33,
            minWidth: 33,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${color}13`,
            color,
          }}
        >
          {icon}
        </div>
      </div>

      <div
        dir={isMoney ? "ltr" : undefined}
        style={{
          color,
          fontSize: isMoney ? "clamp(15px, 2vw, 19px)" : 22,
          fontWeight: 900,
          lineHeight: 1.3,
          fontVariantNumeric: "tabular-nums",
          overflowWrap: "anywhere",
        }}
      >
        {isMoney ? formatMoney(value, lang) : Number(value || 0)}
      </div>
    </div>
  );
}

function CellWithIcon({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <span style={{ display: "inline-flex", color: "#94A3B8", flexShrink: 0 }}>{icon}</span>
      <span style={{ color: "#334155", fontWeight: 650 }}>{text}</span>
    </div>
  );
}

function Th({ children, width }) {
  return (
    <th
      style={{
        width,
        position: "sticky",
        top: 0,
        zIndex: 2,
        padding: "14px 15px",
        background: "#F8FAFC",
        borderBottom: `1px solid ${theme.colors.border}`,
        color: "#64748B",
        whiteSpace: "nowrap",
        textAlign: "start",
        fontSize: 11,
        fontWeight: 850,
        letterSpacing: ".01em",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, color, center = false }) {
  return (
    <td
      style={{
        padding: "13px 15px",
        borderBottom: `1px solid ${theme.colors.borderLight}`,
        whiteSpace: "nowrap",
        fontSize: 12,
        fontWeight: 650,
        color: color || theme.colors.text,
        textAlign: center ? "center" : "start",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}
