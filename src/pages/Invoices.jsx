import { db } from "../firebase";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  deleteDoc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  where,
  writeBatch
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { useTranslate } from "../useTranslate";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { DollarSign, Banknote, CreditCard, Smartphone } from "lucide-react";
const branchMap = {
  "Abbas Akkad 1": "abbasAkkad1",
  "Abbas Akkad 2": "abbasAkkad2",
  "Abbas Akkad 3": "abbasAkkad3",
  "City Stars": "cityStars",
  "El Obour": "elObour",
  "El Rehab": "elRehab"
};

export default function Invoices() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { selectedBranch } = useApp();
  const [branchName, setBranchName] = useState("");

  const [sales, setSales] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [action, setAction] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search); 
  // Exchange state
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [refundItems, setRefundItems] = useState([]);
  const hasValidRefund = useMemo(
  () => refundItems.some(i => i.qty > 0),
  [refundItems]
);
  const refundMap = useMemo(() =>
  Object.fromEntries(refundItems.map(i => [i.id, i.qty])),
[refundItems]);
  const [loading, setLoading] = useState(false);
  const [previousReturns, setPreviousReturns] = useState([]);
  const [salesFilter, setSalesFilter] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const handleRowHover = (e, active) => {
  if (!active) {
    e.currentTarget.style.transform = "scale(1.01)";
    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
  }
};

const handleRowLeave = (e) => {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
};
  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (selectedBranch && selectedBranch !== "all") {
        data = data.filter(s => s.branchId === selectedBranch);
      }
      setSales(data);
    });
    return () => unsub();
  }, [selectedBranch]);
  useEffect(() => {
  const fetchBranch = async () => {
    if (!selectedInvoice?.branchId) return;

    try {
      const ref = doc(db, "branches", selectedInvoice.branchId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setBranchName(snap.data().name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  fetchBranch();
}, [selectedInvoice]);
useEffect(() => {
  const fetchReturns = async () => {
    if (!selectedInvoice) return;

    const snap = await getDocs(
      query(
        collection(db, "returns"),
        where("invoiceId", "==", selectedInvoice.id)
      )
    );

    setPreviousReturns(snap.docs.map(d => d.data()));
  };

  fetchReturns();
}, [selectedInvoice]);
useEffect(() => {
  if (showRefundPopup || showConfirm) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}, [showRefundPopup, showConfirm]);
useEffect(() => {
  setPage(1);
}, [search, salesFilter, fromDate, toDate]);
useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes pulse {
      0% { opacity: 0.5 }
      50% { opacity: 1 }
      100% { opacity: 0.5 }
    }
  `;
  document.head.appendChild(style);
}, []);
useEffect(() => {
  const t = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);

  return () => clearTimeout(t);
}, [search]);
  // 🔍 Filter
  const searchKey = (debouncedSearch || "").toLowerCase();
  const salesKey = (salesFilter || "").toLowerCase();
  const filtered = useMemo(() => {
  return sales.filter(s => {
    const match =
      (s.customerName || "").toLowerCase().includes(searchKey) ||
      (s.customerPhone || "").includes(searchKey) ||
      s.invoiceNumber?.toString().includes(searchKey);

    const matchSales =
      !salesKey ||
      (s.salesName || "").toLowerCase().includes(salesKey);

    const date = s.createdAt?.seconds
      ? new Date(s.createdAt.seconds * 1000)
      : null;

    let ok = true;

    if (date) {
      if (fromDate && date < new Date(fromDate)) ok = false;
      if (toDate && date > new Date(toDate)) ok = false;
    }

    return match && matchSales && ok;
  });
}, [sales, searchKey, salesKey, fromDate, toDate]);
  const isLoadingTable = sales.length === 0;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // 💰 totals
  const totals = useMemo(() => {
    let total = 0,
      cash = 0,
      visa = 0,
      instapay = 0;

    filtered.forEach(i => {
      if (i.status === "cancelled") return;
      let net = i.total || 0;

      const totalQty =
        i.totalQty || i.items?.reduce((s, it) => s + it.qty, 0);

      const refundedQty = i.refundedQty || 0;

      // 👇 لو الفاتورة متردة بالكامل
      if (refundedQty >= totalQty) {
        net = 0;
      }

      // 👇 حماية
      if (net < 0) net = 0;

      total += net;
      const method = (i.paymentMethod || "").toLowerCase();

      if (method === "cash") cash += net;
      if (method === "visa") visa += net;
      if (method === "instapay") instapay += net;
          });

    return { total, cash, visa, instapay };
  }, [filtered]);

  // 🧠 helpers
 

  // 🔴 CANCEL
  const handleCancel = async (inv) => {
  if (inv.status === "cancelled" || cancelling) return;

  setCancelling(true);

  try {
    const batch = writeBatch(db);

    const returnsSnap = await getDocs(
      query(
        collection(db, "returns"),
        where("invoiceId", "==", inv.id)
      )
    );

    const refundedMap = {};
    returnsSnap.docs.forEach(d => {
      const data = d.data();
      refundedMap[data.productId] =
        (refundedMap[data.productId] || 0) + (data.quantity || 0);
    });

    for (const item of inv.items) {
      const alreadyRefunded = refundedMap[item.id] || 0;
      const remaining = item.qty - alreadyRefunded;

      if (remaining <= 0) continue;

      const invRef = doc(db, "inventory", `${inv.branchId}_${item.id}`);

      batch.update(invRef, {
        quantity: increment(remaining)
      });
    }

    const saleRef = doc(db, "sales", inv.id);

    batch.update(saleRef, {
      status: "cancelled",
      cancelledAt: serverTimestamp()
    });
    // optimistic update
setSales(prev =>
  prev.map(s =>
    s.id === inv.id
      ? { ...s, status: "cancelled" }
      : s
  )
);


    await batch.commit();
    toast.success("Invoice cancelled"); 

  } catch (err) {
    console.error(err);
    toast.error("Error cancelling invoice");
  } finally {
    setCancelling(false);
  }
};
// 🎬 Execute Action
  const confirmAction = async () => {
    if (!selectedInvoice) return;

    if (action === "cancel") await handleCancel(selectedInvoice);

    setShowConfirm(false);
    setAction("");
  };
  const handlePrint = () => {
  const content = document.getElementById("invoice-print");
  if (!content) return;

  const win = window.open("", "", "width=800,height=600");

  win.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body {
            font-family: Arial;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
};
const handleRefundQty = (item, qty) => {
  const q = Math.max(0, Number(qty) || 0);

  setRefundItems(prev => {
    if (q === 0) {
      return prev.filter(p => p.id !== item.id);
    }

    const exists = prev.find(p => p.id === item.id);

    if (exists) {
      return prev.map(p =>
        p.id === item.id ? { ...p, qty: q } : p
      );
    }

    return [...prev, { ...item, qty: q }];
  });
};
const handlePartialRefund = async () => {
  if (!selectedInvoice) return;

const refunded = selectedInvoice.refundedQty || 0;
const total =
  selectedInvoice.totalQty ||
  selectedInvoice.items.reduce((s, i) => s + i.qty, 0);
if (refunded >= total) {
  toast.error(t("invoices.closed"));
  return;
}
  
  setLoading(true); // 👈 هنا
  const validItems = (refundItems || []).filter(i => i.qty > 0);

 if (validItems.length === 0) {
 toast.error(t("invoices.selectQty"));
  setLoading(false);
  return;
}
  for (const item of validItems) {
  const original = selectedInvoice.items.find(i => i.id === item.id);
  if (!original) continue;

  const alreadyRefunded = previousReturns
    .filter(r => r.productId === item.id)
    .reduce((sum, r) => sum + r.quantity, 0);

  const remaining = original.qty - alreadyRefunded;

  if (remaining <= 0) {
   toast.error(`المنتج ${item.name} مترد بالكامل ❌`);
    setLoading(false);
    return;
  }

  if (item.qty > remaining) {
  toast.error(`المتاح ترجع ${remaining} بس من ${item.name} ❌`);
  setLoading(false);
  return;
}
}

const batch = writeBatch(db); 
  try {
    for (const item of validItems) {

      if (item.type && item.type !== "oil") {
  const invRef = doc(
    db,
    "inventory",
    `${selectedInvoice.branchId}_${item.id}`
  );

  batch.update(invRef, {
    quantity: increment(item.qty)
  });
} else {
  const returnedRef = doc(collection(db, "returned_items"));

  batch.set(returnedRef, {
    productId: item.id,
    name: item.name,
    quantity: item.qty,
    branchId: selectedInvoice.branchId,
    reason: "refund",
    createdAt: serverTimestamp()
  });
}

const returnRef = doc(collection(db, "returns"));

batch.set(returnRef, {
  invoiceId: selectedInvoice.id,
  productId: item.id,
  productName: item.name,
  productType: item.type,
  size: item.size || "",
  unit: item.size?.includes("ml") ? "ml" : "",
  quantity: item.qty,
  price: item.price,
  type: "refund",
  branchId: selectedInvoice.branchId,
  container: item.containerType?.toUpperCase() || "",
  refundDate: serverTimestamp(),
  originalSaleDate: selectedInvoice.createdAt,
  createdAt: serverTimestamp()
});
}


const totalRefundedNow = validItems.reduce((s, i) => s + i.qty, 0);

const saleRef = doc(db, "sales", selectedInvoice.id);

batch.update(saleRef, {
  hasRefund: true,
  refundedQty: increment(totalRefundedNow),
  lastRefundDate: serverTimestamp()
});

setSales(prev =>
  prev.map(s =>
    s.id === selectedInvoice.id
      ? {
          ...s,
          refundedQty: (s.refundedQty || 0) + totalRefundedNow,
          hasRefund: true
        }
      : s
  )
);
// 🔥 مرة واحدة بس
await batch.commit();
toast.success("Refund done successfully");

  // UI
  setShowRefundPopup(false);
  setRefundItems([]);
  setSelectedInvoice(null);

} catch (err) {
  console.error(err);
  toast.error(t("common.error"));
} finally {
  setLoading(false);
}

    


};




 
  return (
    <div style={{ padding: 20 }}>
 <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  }}
>
  {/* الشمال */}
  <div>
    <h1 style={{ margin: 0 }}>{t("invoices.title")}</h1>

    <span
      style={{
        color: theme.colors.textSecondary,
        fontSize: "13px"
      }}
    >
      {t("invoices.subtitle")}
    </span>
  </div>

  {/* اليمين */}
  <button
    onClick={() => navigate(-1)}
    style={{
      padding: "6px 12px",
      borderRadius: "8px",
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.card,
      cursor: "pointer",
      fontWeight: "500"
    }}
    onMouseEnter={e => handleRowHover(e, false)}
onMouseLeave={handleRowLeave}
  >
    {t("common.back")}
  </button>
</div>

      {/* 🔥 HEADER */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "15px"
        }}>
        <input
  placeholder={t("invoices.search")}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1px solid ${theme.colors.border}`,
    outline: "none",
    fontSize: "14px"
  }}
/>
<input
  placeholder={t("invoices.filter.sales")}
  value={salesFilter}
  onChange={(e) => setSalesFilter(e.target.value)}
  style={{
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1px solid ${theme.colors.border}`,
    marginTop: "8px",
    fontSize: "14px"
  }}
/>

        <input
            type="date"
            onChange={e => setFromDate(e.target.value)}
            style={{
            padding: "10px",
            borderRadius: "10px",
            border: `1px solid ${theme.colors.border}`
            }}
        />
          
        <input
            type="date"
            onChange={e => setToDate(e.target.value)}
            style={{
            padding: "10px",
            borderRadius: "10px",
            border: `1px solid ${theme.colors.border}`
            }}
        />
        </div>

      {/* 💰 CARDS */}
      <div style={{ display: "flex", gap: 10 }}>
        <Card title={t("total")} value={totals.total} type="total" />
        <Card title={t("cash")} value={totals.cash} type="cash" />
        <Card title={t("visa")} value={totals.visa} type="visa" />
        <Card title={t("instapay")} value={totals.instapay} type="instapay" />
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {/* TABLE */}
        <div style={{
  flex: 3,
  maxHeight: "500px",
  overflowY: "auto"
}}>
          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 8px"
            }}>
            <thead style={{
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: theme.colors.textSecondary,
  background: theme.colors.cardSoft,
  position: "sticky",
  top: 0,
  zIndex: 2
}}>
            <tr>
  <th style={{ padding: "10px" }}>{t("invoices.invoice")}</th>
  <th style={{ padding: "10px" }}>{t("customer.title")}</th>
  <th style={{ padding: "10px" }}>{t("common.date")}</th>
  <th style={{ padding: "10px" }}>{t("payment.method")}</th>
  <th style={{ padding: "10px" }}>{t("cart.total")}</th>
  <th style={{ padding: "10px" }}>{t("common.status")}</th>
</tr>
            </thead>
            <tbody>
              {isLoadingTable
    ? Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          <td colSpan="6" style={{ padding: "12px" }}>
            <div
              style={{
                height: "20px",
                borderRadius: "6px",
                background: "#eee",
                animation: "pulse 1.5s infinite"
              }}
            />
          </td>
        </tr>
      ))
      
    : paginated.length === 0 ? (
  <tr>
    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
      <div style={{ color: "#999" }}>
        📭 مفيش فواتير بالفلتر ده
      </div>
    </td>
  </tr>
) : (
  paginated.map(s => {
                const totalQty =
  s.totalQty ||
  s.items?.reduce((sum, i) => sum + i.qty, 0);

const refundedQty = s.refundedQty || 0;
 const statusStyle =
  s.status === "cancelled"
    ? { bg: "#e5e7eb", color: "#374151" }
    : refundedQty >= totalQty
    ? { bg: "#fee2e2", color: "#dc2626" }
    : refundedQty > 0
    ? { bg: "#fef9c3", color: "#ca8a04" }
    : { bg: "#dcfce7", color: "#16a34a" };
return (          
  <tr
  key={s.id}
  onClick={() => setSelectedInvoice(s)}
  style={{
    cursor: "pointer",
    background:
      selectedInvoice?.id === s.id
        ? theme.colors.secondary
        : theme.colors.card,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    borderRadius: "12px",
    overflow: "hidden",
    opacity: s.status === "cancelled" ? 0.5 : 1,
  }}
  onMouseEnter={e => handleRowHover(e, false)}
onMouseLeave={handleRowLeave}
>
    {/* Invoice */}
    <td style={{ padding: "14px 12px", fontWeight: "600" }}>
  {s.invoiceNumber}
</td>

    {/* Customer */}
    <td style={{
  padding: "14px 12px",
  fontSize: "14px"
}}>
      {s.customerName || "-"}
    </td>

    {/* Date */}
    <td style={{
  padding: "14px 12px",
  fontSize: "14px"
}}>
      {s.createdAt?.seconds
        ? new Date(s.createdAt.seconds * 1000).toLocaleDateString()
        : "-"}
    </td>

    {/* Payment */}
    <td style={{
  padding: "14px 12px",
  fontSize: "14px"
}}>
      <span style={{
  padding: "4px 10px",
  borderRadius: "999px",
  background: "#f1f5f9",
  fontSize: "12px",
  fontWeight: "500"
}}>
  {t((s.paymentMethod || "").toLowerCase())}
</span>
    </td>

    {/* Total */}
    <td style={{ padding: "12px", fontWeight: "600" }}>
      {s.total} EGP
    </td>
        
    {/* Status */}
    <td style={{
  padding: "14px 12px",
  fontSize: "14px"
}}>
      <span
        style={{
          background: statusStyle.bg,
          color: statusStyle.color,
          padding: "5px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: "600"
        }}
      >
        {
  s.status === "cancelled"
    ? t("invoices.cancelled")
    : refundedQty >= totalQty
    ? t("invoices.refunded")
    : refundedQty > 0
    ? t("invoices.partialRefunded")
    : t("invoices.completed")
}
      </span>
    </td>
    
    
  </tr>
);
}))
}

 
            </tbody>
          </table>

          <div style={{
  marginTop: "10px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}}>
  <button
    disabled={page === 1}
    onClick={() => setPage(p => p - 1)}
    style={{
      padding: "6px 12px",
      borderRadius: "8px",
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.card,
      cursor: "pointer"
    }}
  >
    {t("common.prev")}
  </button>

  <span style={{ fontSize: "13px" }}>
    {t("common.page")} {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(p => p + 1)}
    style={{
      padding: "6px 12px",
      borderRadius: "8px",
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.card,
      cursor: "pointer"
    }}
  >
    {t("common.next")}
  </button>
</div>
        </div>

        {/* SIDE PANEL */}
        <div style={{
  flex: 2,
  position: "sticky",
  top: "20px",
  height: "fit-content",
  background: theme.colors.card,
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",

  transform: selectedInvoice ? "translateX(0)" : "translateX(20px)",
  opacity: selectedInvoice ? 1 : 0.6,
  transition: "0.3s"
}}>
        {!selectedInvoice && <p>{t("invoices.select")}</p>}
        
        {selectedInvoice && (
          
            <div id="invoice-print">
            <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px"
}}>
  <div>
    <h3 style={{ margin: 0 }}>
      {selectedInvoice.invoiceNumber}
    </h3>

    <div style={{
      fontSize: "12px",
      color: theme.colors.textSecondary,
      marginTop: "4px"
    }}>
      {new Date(selectedInvoice.createdAt?.seconds * 1000).toLocaleString()}
    </div>
  </div>

  {/* Actions */}
  <button
    onClick={() => setDropdownOpen(prev => !prev)}
    style={{
      padding: "6px 12px",
      borderRadius: "8px",
      border: "none",
      background: theme.colors.primary,
      color: "#fff",
      cursor: "pointer",
      fontSize: "12px"
    }}
  >
    {t("common.actions")} ⋮
  </button>
</div>

  {/* Dropdown */}
  {dropdownOpen && (
    <div style={{
      position: "absolute",
      top: "40px",
      right: "10px",
      background: theme.colors.card,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "12px",
      padding: "6px 0",
      boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
      overflow: "hidden",
      zIndex: 1000,
      minWidth: "150px"
    }}>
        {[
  { key: "refund", label: "Refund", color: theme.colors.warning },
  { key: "cancel", label: "Cancel", color: theme.colors.danger }
].map(a => (
  <div
    key={a.key}
    onClick={() => {
  if (selectedInvoice.status === "cancelled" || cancelling) return;
  if (cancelling) return;
  if (a.key === "refund") {
    setRefundItems([]);
    setShowRefundPopup(true);
  } 
  
  else {
    setAction("cancel");
    setShowConfirm(true);
  }

  setDropdownOpen(false);
}}
    style={{
      padding: "10px 14px",
      cursor: "pointer",
      color: a.color,
      fontWeight: "500"
    }}
  >
    {a.label}
  </div>
))}
      </div>
    )}
  


            
            <div style={{
  marginTop: "12px",
  padding: "12px",
  borderRadius: "10px",
  background: theme.colors.cardSoft
}}>

  {/* Customer */}
  <div style={{ marginBottom: "8px" }}>
    <div style={{ fontWeight: "600" }}>
      {selectedInvoice.customerName || "-"}
    </div>
    <div style={{
      fontSize: "12px",
      color: theme.colors.textSecondary
    }}>
      {selectedInvoice.customerPhone || ""}
    </div>
  </div>

  

</div>

  {/* 🔵 Sales Info */}
  <div style={{
    display: "flex",
    gap: "10px",
    marginBottom: "6px",
    flexWrap: "wrap"
  }}>
    <span style={{
      padding: "4px 10px",
      borderRadius: "999px",
      background: "#eef2ff",
      fontSize: "12px",
      fontWeight: "600"
    }}>
      👨‍💼 {t("invoices.salesName")}: {selectedInvoice.salesName || "—"}
    </span>

    {selectedInvoice.enteredBy !== selectedInvoice.salesName && (
  <span style={{
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#ecfeff",
    fontSize: "12px"
  }}>
    🖥️ {t("invoices.enteredBy")}: {selectedInvoice.enteredBy || "—"}
  </span>
)}


  </div>

  {/* 🏪 Branch */}
  <div>
    {t("branches.title")}: {
      branchMap[branchName]
        ? t(`branches.${branchMap[branchName]}`)
        : branchName
    }
  </div>

  {/* 💳 Payment */}
  <div>
    {t("payment.method")}: {t((selectedInvoice.paymentMethod || "").toLowerCase())}
  </div>


            
            {(() => {
  const refunded = selectedInvoice.refundedQty || 0;
  const total = selectedInvoice.totalQty || selectedInvoice.items.reduce((s,i)=>s+i.qty,0);

  return (
    <div style={{
      marginTop: "10px",
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      background:
        refunded >= total
          ? "#fee2e2"
          : refunded > 0
          ? "#fef9c3"
          : "#dcfce7",
      color:
        refunded >= total
          ? "#dc2626"
          : refunded > 0
          ? "#ca8a04"
          : "#16a34a"
    }}>
      {
        refunded >= total
          ? t("invoices.refunded")
          : refunded > 0
          ? t("invoices.partialRefunded")
          : t("invoices.completed")
      }
    </div>
      );
    })()}
            <div style={{
              fontSize: "28px",
              fontWeight: "800",
              color: theme.colors.success,
              marginTop: "15px",
              background: "#ecfdf5",
              padding: "10px",
              borderRadius: "10px",
              textAlign: "center"
            }}>
              {selectedInvoice.total} EGP
            </div>

            {/* 🧾 Items Table */}
        <div style={{
        marginTop: "15px",
        borderTop: `1px solid ${theme.colors.border}`,
        paddingTop: "10px",
        background: theme.colors.cardSoft,
        borderRadius: "10px",
        padding: "12px"
        }}>

        {/* 🔹 Header */}
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: theme.colors.textSecondary,
            marginBottom: "8px"
        }}>
          
            <span style={{ flex: 2 }}>{t("products.title")}</span>
            <span style={{ flex: 1, textAlign: "center" }}>{t("common.qty")}</span>
            <span style={{ flex: 1, textAlign: "right" }}>{t("common.price")}</span>
        </div>
        

        {/* 🔹 Items */}
        {selectedInvoice.items.map((item, i) => (
            <div key={item.id} style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
padding: "6px 0",
borderBottom: "1px dashed #eee",
            fontSize: "14px"
            }}>
            <div style={{ flex: 2 }}>
  {item.name}

  <div style={{
    fontSize: "12px",
    color: theme.colors.textSecondary,
    marginTop: "2px"
  }}>
    {[
      item.containerType,
      item.size
    ]
      .filter(Boolean)
      .join(" • ")
    }
  </div>

  {/* 🛢 الزيت */}
  {item.oilQty > 0 && (
    <div style={{
      fontSize: "12px",
      color: theme.colors.textSecondary,
      marginTop: "2px"
    }}>
      {t("products.oil")}: {item.oilQty} ml
    </div>
  )}
</div>

            <span style={{ flex: 1, textAlign: "center" }}>
                {item.qty}
            </span>

            <span style={{ flex: 1, textAlign: "right" }}>
                {(item.price || 0) * item.qty} EGP
            </span>
            </div>
        ))}

        </div>
        {/* 💰 Totals */}
<div style={{
  marginTop: "15px",
  borderTop: `1px solid ${theme.colors.border}`,
  paddingTop: "10px"
}}>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px"
  }}>
    <span>{t("cart.subtotal")}</span>
    <span>{selectedInvoice.total} EGP</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px"
  }}>
    <span>{t("cart.discount")}</span>
    <span>{selectedInvoice.discount || 0} EGP</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    marginTop: "6px",
    fontSize: "15px"
  }}>
    <span>{t("cart.total")}</span>
    <span>{selectedInvoice.total} EGP</span>
  </div>

</div>

            {/* Print */}
            <button
            onClick={handlePrint}
            style={{
                marginTop: "5px",
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: theme.colors.primary,
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 10px 20px rgba(37,99,235,0.3)",
                transition: "0.2s"
            }}
            onMouseEnter={e => handleRowHover(e, false)}
onMouseLeave={handleRowLeave}
            >
            🖨 {t("invoices.print")}
            </button>
            </div>
        )}
        
        </div>
      </div>
      {showRefundPopup && (
        createPortal(
      <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
      }}>
      <div style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      width: "100%",

      }}>

      <h3>{t("invoices.refundItems")}</h3>

      {selectedInvoice?.items.map((item, i) => {
  const alreadyRefunded = previousReturns
    .filter(r => r.productId === item.id)
    .reduce((sum, r) => sum + r.quantity, 0);

  const remaining = item.qty - alreadyRefunded;

  return (
    <div key={item.id} style={{ marginBottom: "10px" }}>
      <div>
        {item.name}

        <span style={{ fontSize: "12px", marginLeft: "6px" }}>
          ({alreadyRefunded} / {t("common.qty")})
        </span>

        {remaining === 0 && (
          <span style={{ color: "red", marginLeft: "6px" }}>
            {t("invoices.refunded")}
          </span>
        )}
      </div>

      <input
        type="number"
        min="0"
        max={remaining}
        onBlur={(e) => {
        let value = Number(e.target.value) || 0;

        if (value > remaining) value = remaining;

        handleRefundQty(item, value);
      }}
        disabled={remaining === 0}
        placeholder="Qty"
        value={refundMap[item.id] || ""}
        onChange={(e) =>
          handleRefundQty(item, e.target.value)
        }
      />
    </div>
  );
})}

        <button
          onClick={handlePartialRefund}
         disabled={loading || !hasValidRefund}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
        {loading ? "⏳ Processing..." : t("invoices.confirmRefund")}
      </button>

      <button
  onClick={() => {
    setShowRefundPopup(false);
    setRefundItems([]);
  }}
>
        {t("common.cancel")}
      </button>

    </div>
  </div>,
  document.body
  )
)}
      {/* 🔴 CONFIRM MODAL */}
      {showConfirm && (
        createPortal(
        <div style={modalStyle}>
          <div style={modalBox}>
            <div style={{ marginBottom: "15px" }}>
  <h3 style={{ margin: 0 }}>{t("common.confirmAction")}</h3>

  <p style={{
    fontSize: "13px",
    color: theme.colors.textSecondary,
    marginTop: "6px"
  }}>
    {t("invoices.cancelWarning")}
  </p>
</div>
            <button
  onClick={() => setShowConfirm(false)}
  style={{
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
    marginRight: "8px"
  }}
>
  {t("common.cancel")}
</button>

<button
  onClick={confirmAction}
  style={{
    padding: "8px 12px",
    borderRadius: "8px",
    background: theme.colors.danger,
    color: "#fff",
    border: "none"
  }}
>
  {t("common.confirm")}
</button>
          </div>
        </div>,
      document.body
        )
      )}
    </div>
  );
}

const Card = ({ title, value, type }) => {
  const styles = {
    total: {
      bg: "#16a34a",       // أخضر غامق
      color: "#ffffff",    // أبيض
      border: "#16a34a"
    },
    cash: {
      bg: "#ecfdf5",       // أخضر فاتح
      color: "#16a34a",
      border: "#bbf7d0"
    },
    visa: {
      bg: "#fef3c7",
      color: "#b45309"
    },
    instapay: {
      bg: "#f3e8ff",
      color: "#7c3aed"
    }
  };

  const s = styles[type] || {};
  const icons = {
  total: <DollarSign size={20} color="#fff" strokeWidth={2.5} />,
  cash: <Banknote size={18} />,
  visa: <CreditCard size={18} />,
  instapay: <Smartphone size={18} />
};
  return (
  <div
    style={{
      background: s.bg || theme.colors.card,
      border: `1px solid ${s.border || theme.colors.border}`,
      padding: 15,
      borderRadius: 12,
      flex: 1,
      cursor: "pointer",
      transition: "0.2s",
      boxShadow:
        type === "total"
          ? "0 10px 30px rgba(22,163,74,0.3)"
          : "0 8px 20px rgba(0,0,0,0.05)"
    }}
    onMouseEnter={e => {
  e.currentTarget.style.transform = "scale(1.02)";
}}
onMouseLeave={e => {
  e.currentTarget.style.transform = "scale(1)";
}}
  >
        {/* 🔥 Top Row */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{
            fontSize: "12px",
            color: type === "total" ? "#d1fae5" : theme.colors.textSecondary
          }}>
            {title}
          </span>

          <div style={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              type === "total"
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.05)"
          }}>
            {icons[type]}
          </div>
        </div>

        {/* 💰 Value */}
        <div style={{
          fontSize: type === "total" ? "26px" : "20px",
          fontWeight: "700",
          marginTop: "8px",
          color: s.color || theme.colors.text
        }}>
          {value} EGP
        </div>
      </div>
  );
};

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000   // 👈 مهم
};

const modalBox = {
  background: theme.colors.card,
  padding: 20,
  borderRadius: 12,

  width: "100%",
  maxWidth: "380px",   // 👈 صغير وبروفشنال

  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  position: "relative"
};