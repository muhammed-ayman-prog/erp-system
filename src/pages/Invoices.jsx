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
  where
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { useTranslate } from "../useTranslate";
import { createPortal } from "react-dom";
const READY_TYPES = ["cream", "مخمرية", "original"];
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

  // 🔍 Filter
  const filtered = useMemo(() => {
  return sales.filter(s => {
    const key = (search || "").toLowerCase();
    const salesKey = (salesFilter || "").toLowerCase();

    const match =
      (s.customerName || "").toLowerCase().includes(key) ||
      (s.customerPhone || "").includes(key) ||
      s.invoiceNumber?.toString().includes(key);

    const matchSales =
      !salesKey ||
      (s.salesName || "").toLowerCase().includes(salesKey);

    const date = s.createdAt?.seconds
      ? new Date(s.createdAt.seconds * 1000)
      : null;

    let ok = true;
    if (fromDate && date) ok = date >= new Date(fromDate);
    if (toDate && date) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59);
      ok = ok && date <= end;
    }

    return match && matchSales && ok;
  });
}, [sales, search, salesFilter, fromDate, toDate]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // 💰 totals
  const totals = useMemo(() => {
    let total = 0,
      cash = 0,
      visa = 0,
      instapay = 0;

    filtered.forEach(i => {
      const t = +i.total || 0;
      total += t;
      if (i.paymentMethod === "Cash") cash += t;
      if (i.paymentMethod === "Visa") visa += t;
      if (i.paymentMethod === "Instapay") instapay += t;
    });

    return { total, cash, visa, instapay };
  }, [filtered]);

  // 🧠 helpers
  const isReady = item =>
    READY_TYPES.includes((item.category || "").toLowerCase());

  // 🔴 CANCEL
  const handleCancel = async inv => {
    for (const item of inv.items) {
      await updateDoc(
        doc(db, "inventory", `${inv.branchId}_${item.id}`),
        { quantity: increment(item.qty) }
      );
    }

    await setDoc(
      doc(db, "stats", "dashboard"),
      {
        totalSales: increment(-inv.total),
        invoices: increment(-1)
      },
      { merge: true }
    );

    await deleteDoc(doc(db, "sales", inv.id));
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
  alert(t("invoices.closed"));
  return;
}
  
  setLoading(true); // 👈 هنا
  const validItems = (refundItems || []).filter(i => i.qty > 0);

 if (validItems.length === 0) {
  alert(t("invoices.selectQty"));
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
    alert(`المنتج ${item.name} مترد بالكامل ❌`);
    setLoading(false);
    return;
  }

  if (item.qty > remaining) {
  alert(`المتاح ترجع ${remaining} بس من ${item.name} ❌`);
  setLoading(false);
  return;
}
}


  try {
    for (const item of validItems) {

      if (isReady(item)) {
  // يرجع للمخزن
  await updateDoc(
    doc(db, "inventory", `${selectedInvoice.branchId}_${item.id}`),
    { quantity: increment(item.qty) }
  );
} else {
  // يتحط في returned_items
  await addDoc(collection(db, "returned_items"), {
    productId: item.id,
    name: item.name,
    quantity: item.qty,
    branchId: selectedInvoice.branchId,
    reason: "refund",
    createdAt: serverTimestamp()
  });
}

      await addDoc(collection(db, "returns"), {
      invoiceId: selectedInvoice.id,
      productId: item.id,
      productName: item.name,
      quantity: item.qty,
      price: item.price,
      type: "refund",
      branchId: selectedInvoice.branchId,

      // 🔥 الجديد
      refundDate: serverTimestamp(),
      originalSaleDate: selectedInvoice.createdAt,

      createdAt: serverTimestamp()
    });
    }
    const totalRefundedNow = validItems.reduce(
      (sum, i) => sum + i.qty,
      0
    );

    
    await updateDoc(doc(db, "sales", selectedInvoice.id), {
  hasRefund: true,
  refundedQty: increment(totalRefundedNow),
  lastRefundDate: serverTimestamp()
});
    

    
    
    

    

    setShowRefundPopup(false);
    setRefundItems([]);
    setSelectedInvoice(prev => ({ ...prev }));
    setLoading(false); // 👈 هنا
  } catch (err) {
  console.error(err);
  alert(t("common.error"));
  setLoading(false); // 👈 مهم
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
    onMouseEnter={e => {
  e.currentTarget.style.background = theme.colors.secondary;
}}
onMouseLeave={e => {
  e.currentTarget.style.background = theme.colors.card;
}}
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
        <Card title={t("total")} value={totals.total} />
        <Card title={t("cash")} value={totals.cash} />
        <Card title={t("visa")} value={totals.visa} />
        <Card title={t("instapay")} value={totals.instapay} />
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
              {paginated.map(s => {
                const totalQty =
  s.totalQty ||
  s.items?.reduce((sum, i) => sum + i.qty, 0);

const refundedQty = s.refundedQty || 0;
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
      transition: "0.2s",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
    }}
    onMouseEnter={e => {
      if (selectedInvoice?.id !== s.id)
        e.currentTarget.style.background = theme.colors.cardSoft;
    }}
    onMouseLeave={e => {
      if (selectedInvoice?.id !== s.id)
        e.currentTarget.style.background = theme.colors.card;
    }}
  >
    {/* Invoice */}
    <td style={{ padding: "12px" }}>
      {s.invoiceNumber}
    </td>

    {/* Customer */}
    <td style={{ padding: "12px" }}>
      {s.customerName || "-"}
    </td>

    {/* Date */}
    <td style={{ padding: "12px" }}>
      {s.createdAt?.seconds
        ? new Date(s.createdAt.seconds * 1000).toLocaleDateString()
        : "-"}
    </td>

    {/* Payment */}
    <td style={{ padding: "12px" }}>
      {t(s.paymentMethod.toLowerCase())}  
    </td>

    {/* Total */}
    <td style={{ padding: "12px", fontWeight: "600" }}>
      {s.total} EGP
    </td>
        
    {/* Status */}
    <td style={{ padding: "12px" }}>
      <span
        style={{
          background:
            refundedQty >= totalQty
              ? theme.colors.warning
              : refundedQty > 0
              ? "#facc15"
              : theme.colors.success,
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "8px",
          fontSize: "12px"
        }}
      >
        {
  refundedQty >= totalQty
    ? t("invoices.refunded")
    : refundedQty > 0
    ? t("invoices.partialRefunded")
    : t("invoices.completed")
}
      </span>
    </td>
    
    
  </tr>
);
})}
 
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
  position: "relative",
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
  alignItems: "center"
}}>

  <h3 style={{ margin: 0 }}>
    {selectedInvoice.invoiceNumber}
  </h3>
  

  {/* Actions */}
            <div style={{ marginTop: "15px" }}>
  <div style={{ position: "relative", display: "inline-block" }}>

    {/* Button */}
    <button
      onClick={() => setDropdownOpen(prev => !prev)}
       style={{
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: theme.colors.primary,
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  }}
    >
      {t("common.actions")} ⌄
    </button>

    {/* Dropdown */}
    {dropdownOpen && (
      <div style={{
        position: "absolute",
        top: "110%",
        right: 0,
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
  </div>
</div>
  
</div>


            <div style={{ color: theme.colors.textSecondary, fontSize: "13px" }}>
                {new Date(selectedInvoice.createdAt?.seconds * 1000).toLocaleString()}
            </div>
            <div style={{
  marginTop: "10px",
  fontSize: "13px",
  color: theme.colors.textSecondary
}}>

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
    {t("payment.method")}: {t(selectedInvoice.paymentMethod?.toLowerCase())}
  </div>

</div>
            
            {(() => {
  const refunded = selectedInvoice.refundedQty || 0;
  const total = selectedInvoice.totalQty || selectedInvoice.items.reduce((s,i)=>s+i.qty,0);

  return (
    <div
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "8px",
        background:
          refunded >= total
            ? theme.colors.warning
            : refunded > 0
            ? "#facc15"
            : theme.colors.success,
        color: "#fff",
        fontSize: "12px",
        marginTop: "10px"
      }}
    >
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
                fontSize: "26px",
                fontWeight: "bold",
                color: theme.colors.success,
                marginTop: "10px"
            }}>
                {selectedInvoice.total} EGP
            </div>
            <div style={{
            marginTop: "6px",
            color: theme.colors.text
            }}>
            {selectedInvoice.customerName || "-"}
            <div style={{
            fontSize: "13px",
            color: theme.colors.textSecondary
            }}>
            {selectedInvoice.customerPhone || ""}
            </div>
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
            marginBottom: "8px",
            fontSize: "14px"
            }}>
            <div style={{ flex: 2 }}>
  {item.name}

  {/* 🛢 الزيت */}
  {item.oilQty > 0 && (
    <div style={{
      fontSize: "12px",
      color: theme.colors.textSecondary,
      marginTop: "2px"
    }}>
      {t("products.oil")}: {item.oilQty} ml × {item.qty}
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
            onMouseEnter={e=>{
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = theme.colors.primaryHover;
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = theme.colors.primary;
            }}
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
      width: "400px"
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
          
        >
        {loading ? t("common.processing") : t("invoices.confirmRefund")}
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
            <p>{t("common.confirmAction")}</p>
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

const Card = ({ title, value }) => (
  <div
    style={{
  background: theme.colors.card,
  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  border: `1px solid ${theme.colors.border}`,
  padding: 15,
  borderRadius: 12,
  flex: 1
}}
  >
    <div style={{
  fontSize: "12px",
  color: theme.colors.textSecondary
}}>
  {title}
</div>

<div style={{
  fontSize: "20px",
  fontWeight: "700",
  marginTop: "5px"
}}>
  {value} EGP
</div>
  </div>
);

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
  width: "90vw",        // 👈 بدل 300px
  maxWidth: "900px",    // 👈 مهم
  height: "80vh",       // 👈 عشان السكرول
  overflow: "auto",     // 👈 مهم جدًا
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  position: "relative",
  zIndex: 1000
};