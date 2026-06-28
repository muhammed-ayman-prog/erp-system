import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where
} from "firebase/firestore";

import { db } from "../firebase";
import { useTranslate } from "../useTranslate";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { theme } from "../theme";
export default function Returns() {
  const { user } = useAuth();
  const { selectedBranch } = useApp();
  const { t } = useTranslate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
const [selectedReturn, setSelectedReturn] = useState(null);

const [page, setPage] = useState(1);

const pageSize = 10;

const [isMobile, setIsMobile] = useState(
  typeof window !== "undefined"
    ? window.innerWidth < 900
    : false
);

  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true);
      setData([]);
      try {
        const q =
  user?.role === "owner" &&
  selectedBranch === "all"

    ? query(
        collection(db, "returns"),
        orderBy("createdAt", "desc")
      )

    : query(
        collection(db, "returns"),

        where(
          "branchId",
          "==",
          selectedBranch
        ),

        orderBy("createdAt", "desc")
      );

        const snap = await getDocs(q);

        const result = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setData(result);
      } catch (err) {
        console.error("Error fetching returns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [
  selectedBranch,
  user
]);
useEffect(() => {
  const resize = () =>
    setIsMobile(window.innerWidth < 900);

  resize();

  window.addEventListener("resize", resize);

  return () =>
    window.removeEventListener(
      "resize",
      resize
    );
}, []);

  const formatDate = (ts) => {
    if (!ts) return "-";
    try {
      return new Date(ts.seconds * 1000).toLocaleString(
  undefined,
  {
    dateStyle: "medium",
    timeStyle: "short"
  }
);
    } catch {
      return "-";
    }
  };
  const filtered = useMemo(() => {
  const key = search.trim().toLowerCase();

  return data.filter(r =>
  (r.productName || "").toLowerCase().includes(key) ||
  (r.invoiceId || "").toLowerCase().includes(key) ||
  (r.branchName || "").toLowerCase().includes(key)
);
}, [data, search]);

const totalPages = Math.max(
  1,
  Math.ceil(filtered.length / pageSize)
);

const paginated = filtered.slice(
  (page - 1) * pageSize,
  page * pageSize
);
useEffect(() => {
  if (
    selectedReturn &&
    !filtered.some(x => x.id === selectedReturn.id)
  ) {
    setSelectedReturn(null);
  }
}, [filtered, selectedReturn]);
useEffect(() => {
  if (page > totalPages) {
    setPage(totalPages);
  }
}, [page, totalPages]);
const stats = useMemo(() => {
  const totalQty = filtered.reduce(
    (sum, r) => sum + (r.quantity || 0),
    0
  );

  const soldCount = filtered.filter(
    x => x.status === "sold"
  ).length;

  return {
    totalReturns: filtered.length,
    totalQty,
    soldCount,
    returnedCount: filtered.length - soldCount
  };
}, [filtered]);
const thStyle = {
  position: "sticky",
  textAlign: "center",
  top: 0,
  zIndex: 2,
  background: theme.colors.cardSoft,
  padding: 12
};
  return (
    
    <div style={{ padding: "20px" }}>
      
      {/* Header */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12
  }}
>
  <div>
    <h2
      style={{
        margin: 0
      }}
    >
      {t("returns.title")}
    </h2>

    <div
      style={{
        fontSize: 13,
        color: theme.colors.textSecondary
      }}
    >
      {t("returns.subtitle")}
    </div>
  </div>
</div>
<div
  style={{
    display: "flex",
    gap: 12,
    marginBottom: 18,
    flexWrap: "wrap"
  }}
>
  <input
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
    placeholder={t("returns.search")}
    style={{
      flex: 1,
      minWidth: isMobile ? "100%" : 280,
      padding: "14px 16px",
      borderRadius: 12,
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.card,
      outline: "none",
      fontSize: 14
    }}
  />
  {search && (
  <button
    onClick={() => {
      setSearch("");
      setPage(1);
    }}
    style={{
      padding: "0 16px",
      borderRadius: 12,
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.card,
      cursor: "pointer",
      fontWeight: 600
    }}
  >
    {t("common.clear")}
  </button>
)}
</div>
<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 12,
    marginBottom: 20
  }}
>
  <Card
  title={t("returns.total")}
  value={stats.totalReturns}
/>

<Card
  title={t("returns.items")}
  value={stats.totalQty}
/>

<Card
  title={t("returns.sold")}
  value={stats.soldCount}
/>

<Card
  title={t("returns.returned")}
  value={stats.returnedCount}
/>
</div>

      {/* Loading */}
      {loading && (
  <div
    style={{
      background: theme.colors.card,
      borderRadius: 16,
      padding: 40,
      textAlign: "center",
      color: theme.colors.textSecondary
    }}
  >
    {t("common.loading")}
  </div>
)}

      {/* Table */}
      {!loading && (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "1fr 380px",
      gap: 20,
      alignItems: "start"
    }}
  >
    <div
  style={{
    flex: 1,
    minWidth: 0,
    background: theme.colors.card,
    borderRadius: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,.06)",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch"
  }}
>
          <table
  style={{
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px", 
    minWidth: 850
  }}
>
            
            <thead
  style={{
    background: theme.colors.cardSoft,
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: 700
  }}
>
  
  <tr>
    <th style={{ ...thStyle, textAlign: "center" }}>{t("returns.invoice")}</th>
<th style={{ ...thStyle, textAlign: "left" }}>
  {t("returns.product")}
</th>
<th style={{ ...thStyle, textAlign: "center" }}>{t("returns.type")}</th>
<th style={{ ...thStyle, textAlign: "center" }}>{t("common.qty")}</th>
<th style={{ ...thStyle, textAlign: "center" }}>{t("common.status")}</th>
<th style={{ ...thStyle, textAlign: "center" }}>{t("common.date")}</th>
  </tr>
</thead>

            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: "30px", textAlign: "center" }}>
                    <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    color: theme.colors.textSecondary
  }}
>
  <div style={{ fontSize: 40 }}>📦</div>

  <div
    style={{
      fontWeight: 600
    }}
  >
    {t("returns.noReturns")}
  </div>
</div>
                  </td>
                </tr>
              )}

              {paginated.map((r) => {
  const isSelected =
    selectedReturn?.id === r.id;

  return (
                <tr
                  key={r.id}
                  onClick={() => setSelectedReturn(r)}
                  style={{
  cursor: "pointer",
  outline:
  isSelected
    ? `2px solid ${theme.colors.primary}`
    : "none",

outlineOffset: -2,
  background:
    isSelected
      ? theme.colors.secondary
      : theme.colors.card,

  transition: "all .2s ease",

  boxShadow: isSelected
  ? "0 10px 24px rgba(37,99,235,.18)"
  : "0 4px 12px rgba(0,0,0,.05)"
}}
onMouseEnter={(e) => {
  if (!isSelected) {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow =
      "0 10px 24px rgba(0,0,0,.10)";
  }
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow =
    "0 4px 12px rgba(0,0,0,.05)";
}}
                  
                >
                 <td
  style={{
    padding: 14,
    fontWeight: 700,
    textAlign: "center"
  }}
>{r.invoiceId}</td>
                 <td
  style={{
    padding: 14,
    minWidth: 260
  }}
>
                  <div
  style={{
    fontWeight: 600,
    marginBottom: 6
  }}
>
                    {r.productName}
                  </div>

                  <div
  style={{
    fontSize: 12,
    color: theme.colors.textSecondary
  }}
>
                  {r.containerName ||
                  [
  r.container,
  String(r.size || "").includes("ml")
    ? r.size
    : r.size
    ? `${r.size}${r.unit || ""}`
    : null
]
                    .filter(Boolean)
                    .join(" • ")
                  }
                </div>
                 </td>
                 <td
  style={{
    textAlign: "center"
  }}
>
  <span
    style={{
      padding: "5px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background:
        r.type === "refund"
          ? "#fee2e2"
          : "#dbeafe",
      color:
        r.type === "refund"
          ? "#dc2626"
          : "#2563eb"
    }}
  >
    {t(`returns.${r.type}`)}
  </span>
</td>

<td
  style={{
    textAlign: "center",
    fontWeight: 600
  }}
>
  {r.quantity ?? "-"}
</td>

<td
  style={{
    textAlign: "center"
  }}
>
  <span
    style={{
      padding: "5px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background:
        r.status === "sold"
          ? "#dcfce7"
          : "#fef3c7",
      color:
        r.status === "sold"
          ? "#166534"
          : "#92400e"
    }}
  >
    {r.status === "sold"
      ? t("returns.sold")
      : t("returns.returned")}
  </span>
</td>

<td
  style={{
    textAlign: "center"
  }}
>
  {formatDate(r.createdAt)}
</td>
                </tr>
              );
})}
            </tbody>

          </table>
          <div
  style={{
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderTop: `1px solid ${theme.colors.border}`
}}
>
  <button
    disabled={page === 1}
    onClick={() =>
  setPage(p => Math.max(1, p - 1))
}
    style={{
  padding: "10px 18px",
  borderRadius: 12,
  border: `1px solid ${theme.colors.border}`,
  background: page === 1 ? "#f3f4f6" : theme.colors.card,
  cursor: page === 1 ? "not-allowed" : "pointer",
  fontWeight: 600,
  transition: ".2s"
}}
  >
    {t("common.prev")}
  </button>

  <span
    style={{
      fontWeight: 600
    }}
  >
    {filtered.length} {t("common.records")} • {page} / {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() =>
  setPage(p => Math.min(totalPages, p + 1))
}
    style={{
  padding: "10px 18px",
  borderRadius: 12,
  border: `1px solid ${theme.colors.border}`,
 background:
  page === totalPages
    ? "#f3f4f6"
    : theme.colors.card,
  cursor:
  page === totalPages
    ? "not-allowed"
    : "pointer",
  fontWeight: 600,
  transition: ".2s"
}}
  >
    {t("common.next")}
  </button>
</div>
               </div>

    <div
      style={{
        background: theme.colors.card,
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 8px 24px rgba(0,0,0,.06)",
        position: isMobile ? "static" : "sticky",
        top: 20,
        alignSelf: "start",
      }}
    >
      {!selectedReturn ? (
        <div
          style={{
            textAlign: "center",
            color: theme.colors.textSecondary,
            padding: "60px 20px"
          }}
        >
          <div style={{ fontSize: 42 }}>📄</div>
          <div
            style={{
              marginTop: 12,
              fontWeight: 600
            }}
          >
            {t("returns.selectReturn")}
          </div>
          <div
  style={{
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.textSecondary
  }}
>
  {t("returns.selectReturnDescription")}
</div>

          
        </div>
      ) : (
        <>
          <h3
            style={{
              marginTop: 0,
              marginBottom: 20
            }}
          >
            {selectedReturn.productName || "-"}
          </h3>
          <div
  style={{
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 18
  }}
>
  #{selectedReturn.invoiceId || "-"}
</div>

          <InfoRow
            label={t("returns.invoice")}
            value={selectedReturn.invoiceId}
          />

          <InfoRow
            label={t("common.qty")}
            value={selectedReturn.quantity}
          />

          <InfoRow
            label={t("returns.type")}
            value={t(`returns.${selectedReturn.type}`)}
          />

          <InfoRow
            label={t("common.status")}
            value={
              selectedReturn.status === "sold"
                ? t("returns.sold")
                : t("returns.returned")
            }
          />

          <InfoRow
            label={t("common.date")}
            value={formatDate(selectedReturn.createdAt)}
          />

          <InfoRow
            label={t("returns.container")}
            value={
              selectedReturn.containerName ||
              selectedReturn.container ||
              "-"
            }
          />
          <InfoRow
  label={t("branches.branch")}
  value={selectedReturn.branchName}
/>

<InfoRow
  label={t("products.size")}
  value={selectedReturn.size || "-"}
/>
<div
  style={{
    marginTop: 20
  }}
>
  <button
    onClick={() => setSelectedReturn(null)}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: 12,
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.card,
      cursor: "pointer",
      transition: ".2s",
      fontWeight: 600
    }}
    onMouseEnter={(e)=>{
  e.currentTarget.style.background = theme.colors.secondary;
}}

onMouseLeave={(e)=>{
  e.currentTarget.style.background = theme.colors.card;
}}
  >
    {t("common.close")}
  </button>
</div>
        </>
      )}
    </div>
  </div>
      )}
    </div>
  );
}
const Card = ({
  title,
  value,
  color
}) => (
  <div
    style={{
  background: theme.colors.card,
  borderRadius: 16,
  borderTop: `4px solid ${color}`,
  padding: 18,
  minHeight: 110,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxShadow: "0 8px 20px rgba(0,0,0,.05)"
}}
  >
    <div
      style={{
        fontSize: 12,
        color: theme.colors.textSecondary
      }}
    >
      {title}
    </div>

    <div
      style={{
        fontSize:32,
        marginTop: 8,
        fontWeight: 700,
        color
      }}
    >
      {Number(value).toLocaleString()}
    </div>
  </div>
);
const InfoRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px 0",
      borderBottom: `1px solid ${theme.colors.border}`,
      gap: 12
    }}
  >
    <span
      style={{
        color: theme.colors.textSecondary
      }}
    >
      {label}
    </span>

    <span
      style={{
        fontWeight: 600,
        textAlign:"right",
        wordBreak:"break-word",
        maxWidth:180
      }}
    >
      {value !== undefined && value !== null && value !== ""
  ? value
  : "-"}
    </span>
  </div>
);