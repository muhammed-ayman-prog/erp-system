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
const READY_TYPES = ["cream", "مخمرية", "original"];

export default function Invoices() {
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
  const [exchangeItem, setExchangeItem] = useState(null);
  const [newProductId, setNewProductId] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [refundItems, setRefundItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previousReturns, setPreviousReturns] = useState([]);

  // 🔥 Fetch
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

  // 🔍 Filter
  const filtered = useMemo(() => {
    return sales.filter(s => {
      const key = (search || "").toLowerCase();

      const match =
  (s.customerName || "").toLowerCase().includes(key) ||
  (s.customerPhone || "").includes(key) ||   // 👈 ضيف دي هنا
  s.invoiceNumber?.toString().includes(key);

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

      return match && ok;
    });
  }, [sales, search, fromDate, toDate]);

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

  // 🟢 REFUND
  const handleRefund = async () => {
  console.warn("Old refund disabled ❌");
  return;
};

  // 🟡 EXCHANGE (أساسي)
  const handleExchange = async () => {
    if (!exchangeItem || !newProductId) return;

    const inv = selectedInvoice;

    // القديم
    if (isReady(exchangeItem)) {
      await updateDoc(
        doc(db, "inventory", `${inv.branchId}_${exchangeItem.id}`),
        { quantity: increment(exchangeItem.qty) }
      );
    } else {
      await addDoc(collection(db, "returned_items"), {
        productId: exchangeItem.id,
        name: exchangeItem.name,
        quantity: exchangeItem.qty,
        branchId: inv.branchId,
        reason: "exchange",
        createdAt: serverTimestamp()
      });
    }

    // الجديد
    await updateDoc(
      doc(db, "inventory", `${inv.branchId}_${newProductId}`),
      { quantity: increment(-newQty) }
    );

    alert("Exchange done (logic basic)");
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
  alert("الفاتورة دي متقفلة (Refunded بالكامل) ❌");
  return;
}
  
  setLoading(true); // 👈 هنا
  const validItems = (refundItems || []).filter(i => i.qty > 0);

 if (validItems.length === 0) {
  alert("اختار كمية ❗");
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
    setSelectedInvoice(null);
    setLoading(false); // 👈 هنا
  } catch (err) {
  console.error(err);
  alert("Error ❌");
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
    <h1 style={{ margin: 0 }}>Invoices</h1>

    <span
      style={{
        color: theme.colors.textSecondary,
        fontSize: "13px"
      }}
    >
      Manage and track all sales invoices
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
    ← Back
  </button>
</div>

      {/* 🔥 HEADER */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "15px"
        }}>
        <input
  placeholder="Search by name / phone..."
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
        <Card title="Total" value={totals.total} />
        <Card title="Cash" value={totals.cash} />
        <Card title="Visa" value={totals.visa} />
        <Card title="Instapay" value={totals.instapay} />
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
  <th style={{ padding: "10px" }}>Invoice</th>
  <th style={{ padding: "10px" }}>Customer</th>
  <th style={{ padding: "10px" }}>Date</th>
  <th style={{ padding: "10px" }}>Payment</th>
  <th style={{ padding: "10px" }}>Total</th>
  <th style={{ padding: "10px" }}>Status</th>
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
      {s.paymentMethod}
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
    ? "Refunded"
    : refundedQty > 0
    ? "Partial Refunded"
    : "Completed"
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
    Prev
  </button>

  <span style={{ fontSize: "13px" }}>
    Page {page} of {totalPages}
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
    Next
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
        {!selectedInvoice && <p>Select invoice</p>}
        
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
      Actions ⌄
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
        zIndex: 9999,
        minWidth: "150px"
      }}>
        {[
  { key: "refund", label: "Refund", color: theme.colors.warning },
  { key: "exchange", label: "Exchange", color: theme.colors.primary },
  { key: "cancel", label: "Cancel", color: theme.colors.danger }
].map(a => (
  <div
    key={a.key}
    onClick={() => {
  if (a.key === "refund") {
    setRefundItems([]); // 👈 ضيف دي
    setShowRefundPopup(true);
  } else {
    setAction(a.key);
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
  color: theme.colors.textSecondary,
  display: "flex",
  gap: "15px",
  flexWrap: "wrap"
}}>
  <div>Branch: {branchName || selectedInvoice.branchId}</div>
  <div>Payment: {selectedInvoice.paymentMethod}</div>
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
          ? "Refunded"
          : refunded > 0
          ? "Partial Refunded"
          : "Completed"
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
            <span style={{ flex: 2 }}>Item</span>
            <span style={{ flex: 1, textAlign: "center" }}>Qty</span>
            <span style={{ flex: 1, textAlign: "right" }}>Price</span>
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
      Oil: {item.oilQty} ml × {item.qty}
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
    <span>Subtotal</span>
    <span>{selectedInvoice.total} EGP</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px"
  }}>
    <span>Discount</span>
    <span>{selectedInvoice.discount || 0} EGP</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    marginTop: "6px",
    fontSize: "15px"
  }}>
    <span>Total</span>
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
            🖨 Print Invoice
            </button>
            </div>
        )}
        
        </div>
      </div>
      {showRefundPopup && (
      <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
      }}>
      <div style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      width: "400px"
      }}>

      <h3>Refund Items</h3>

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
          ({alreadyRefunded} / {item.qty})
        </span>

        {remaining === 0 && (
          <span style={{ color: "red", marginLeft: "6px" }}>
            Refunded
          </span>
        )}
      </div>

      <input
        type="number"
        min="0"
        max={remaining}
        disabled={remaining === 0}
        placeholder="Qty"
        value={
          refundItems.find(i => i.id === item.id)?.qty || ""
        }
        onChange={(e) =>
          handleRefundQty(item, e.target.value)
        }
      />
    </div>
  );
})}

        <button
          onClick={handlePartialRefund}
          disabled={
  loading ||
  refundItems.filter(i => i.qty > 0).length === 0
}
          
        >
        {loading ? "Processing..." : "Confirm Refund"}
      </button>

      <button
  onClick={() => {
    setShowRefundPopup(false);
    setRefundItems([]);
  }}
>
        Cancel
      </button>

    </div>
  </div>
)}
      {/* 🔴 CONFIRM MODAL */}
      {showConfirm && (
        <div style={modalStyle}>
          <div style={modalBox}>
            <p>Are you sure you want to {action}?</p>
            <button
  onClick={() => setShowConfirm(false)}
  style={{
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
    marginRight: "8px"
  }}
>
  Cancel
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
  Confirm
</button>
          </div>
        </div>
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
  alignItems: "center"
};

const modalBox = {
  background: theme.colors.card,
  padding: 20,
  borderRadius: 12,
  width: "300px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
};