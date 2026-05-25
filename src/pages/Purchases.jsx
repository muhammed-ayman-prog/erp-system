    import { useState, useEffect, useRef } from "react";
    import {
  addDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  increment
} from "firebase/firestore";
    import { db } from "../firebase";
    import { useAuth } from "../store/useAuth";
    import { useApp } from "../store/useApp";
    import { theme } from "../theme";
    import { serverTimestamp } from "firebase/firestore";
    import { useTranslate } from "../useTranslate";
    import React from "react";
    export default function Purchases() {
      const { t, tt, lang } = useTranslate();
      const cardStyle = {
      flex: 1,
      background: theme.colors.card,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "14px",
      padding: "12px"
    };
    const { user } = useAuth();
    const { selectedBranch } = useApp();

    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([
    { productId: "", quantity: "" }
    ]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [highlightIndex, setHighlightIndex] = useState({});


    const inputRefs = useRef([]);
    const dropdownRefs = useRef({});
    const addRow = () => {
    setItems(prev => [...prev, { productId: "", quantity: "", search: "" }]);
    };

    const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
    };
    const [purchases, setPurchases] = useState([]);
    const [stockLogs, setStockLogs] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [activeTab, setActiveTab] = useState("history");
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    // 🔥 نجيب المنتجات
    useEffect(() => {
        const fetchProducts = async () => {
        const snap = await getDocs(collection(db, "products"));
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchProducts();
    }, []);
    useEffect(() => {
  const last = inputRefs.current[items.length - 1];
  if (last) last.focus();
}, [items.length]);
useEffect(() => {

  if (!user) return;

  if (
    user.role === "owner" &&
    !selectedBranch
  ) {
    return;
  }

  const branchToUse =
    user.role === "owner"
      ? selectedBranch
      : user.branchIds?.[0];

  if (!branchToUse) {
    return;
  }

  let q;

if (
  branchToUse === "all" &&
  user?.role === "owner"
) {

  q = query(
    collection(db, "purchases"),
    orderBy("createdAt", "desc")
  );

} else {
  q = query(
    collection(db, "purchases"),
    where("branchId", "==", branchToUse),
    orderBy("createdAt", "desc")
  );
}

  

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setPurchases(data);
  });

  return () => unsubscribe();

}, [selectedBranch, user]);
useEffect(() => {
  if (!user) return;

  const branchToUse =
  user.role === "owner"
    ? selectedBranch
    : user.branchIds?.[0];

if (!branchToUse) return;

const q =
  user?.role === "owner" &&
branchToUse === "all"

  ? query(
      collection(db, "stock"),
      orderBy("createdAt", "desc")
    )

  : query(
      collection(db, "stock"),
      where("branchId", "==", branchToUse),
      orderBy("createdAt", "desc")
    );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setStockLogs(data);
  });

  return () => unsubscribe();
}, [user, selectedBranch]);

    
    const handlePurchase = async () => {

  const branchToUse =
    user.role === "owner"
      ? selectedBranch
      : user.branchIds?.[0];

  if (!branchToUse || branchToUse === "all") {
    alert(t("stockEntry.selectBranch"));
    return;
  }

  const validItems = items.filter(
    (i) => i.productId && i.quantity
  );
  for (const item of validItems) {
  if (Number(item.quantity) <= 0) {
    alert(t("stockEntry.invalidQty"));
    return;
  }
}

  if (!validItems.length) {
    alert(t("stockEntry.addItemsFirst"));
    return;
  }
  const productIds = validItems.map(i => i.productId);
const hasDuplicates = new Set(productIds).size !== productIds.length;

if (hasDuplicates) {
  const confirmDup = confirm(t("stockEntry.duplicateWarning"));
  if (!confirmDup) return;
}
  try {
    const purchaseRef = await addDoc(collection(db, "purchases"), {
      items: validItems.map(i => ({
        productId: i.productId,
        quantity: Number(i.quantity)
      })),
      branchId: branchToUse,
      userId: user.uid,
      createdAt: serverTimestamp()
    });

    for (const item of validItems) {

  const productId = item.productId;
const qty = Number(item.quantity);

// 🔥 get current quantity
const inventoryRef = doc(db, "inventory", `${branchToUse}_${productId}`);
const currentSnap = await getDoc(inventoryRef);

const beforeQty = currentSnap.exists()
  ? currentSnap.data().quantity
  : 0;

const afterQty = beforeQty + qty;

// ✅ stock log
await addDoc(collection(db, "stock"), {
  productId,
  quantity: qty,
  before: beforeQty,
  after: afterQty,
  branchId: branchToUse,
  createdAt: serverTimestamp(),
  type: "purchase",
  purchaseId: purchaseRef.id
});

// ✅ update inventory
await setDoc(
  doc(db, "inventory", `${branchToUse}_${productId}`),
  {
    quantity: increment(qty)
  },
  { merge: true }
);
}

    alert("✅ " + t("common.save"));
    setItems([{ productId: "", quantity: "" }]);

  } catch (err) {
    alert("في مشكلة ❌");
  }
};
const handleUndo = async (purchase) => {
  const confirmUndo = confirm("متأكد ترجع العملية؟");
  if (!confirmUndo) return;

  try {
    for (const item of purchase.items) {
      const productId = item.productId;
      const qty = Number(item.quantity);

      const inventoryRef = doc(
        db,
        "inventory",
        `${purchase.branchId}_${productId}`
      );

      const snap = await getDoc(inventoryRef);
      const beforeQty = snap.exists() ? snap.data().quantity : 0;
      const afterQty = Math.max(0, beforeQty - qty);

      // 🔥 log عكسي
      await addDoc(collection(db, "stock"), {
        productId,
        quantity: -qty,
        before: beforeQty,
        after: afterQty,
        branchId: purchase.branchId,
        createdAt: serverTimestamp(),
        type: "undo_purchase",
        purchaseId: purchase.id
      });

      // 🔥 update inventory
      await setDoc(
        inventoryRef,
        { quantity: increment(-qty) },
        { merge: true }
      );
    }
await setDoc(
      doc(db, "purchases", purchase.id),
      {
        undone: true
      },
      { merge: true }
    );
    alert("✅ تم التراجع");
  } catch (err) {
    alert("❌ حصل خطأ");
  }
};
const isMobile = window.innerWidth < 768;
const totalQty = items.reduce(
  (sum, i) => sum + Number(i.quantity || 0),
  0
);

const totalItems = items.filter(i => i.productId).length;
const productsMap = Object.fromEntries(
  products.map(p => [p.id, p])
);

const stockMap = stockLogs.reduce((acc, s) => {
  const key = `${s.purchaseId}_${s.productId}`;
  if (!acc[key]) acc[key] = [];
  acc[key].push(s);
  return acc;
}, {});

const [timelineSearch, setTimelineSearch] = useState("");

const globalLogs = stockLogs
  .filter(log => {
    const name = productsMap[log.productId]?.name || "";
    return name.toLowerCase().includes(timelineSearch.toLowerCase());
  })
  .sort(
    (a, b) =>
      (b.createdAt?.seconds || 0) -
      (a.createdAt?.seconds || 0)
  );
const groupedLogs = globalLogs.reduce((acc, log) => {
  const dateObj = new Date(
    log.createdAt?.seconds
      ? log.createdAt.seconds * 1000
      : log.createdAt
  );

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let label;

  if (dateObj.toDateString() === today.toDateString()) {
    label = "Today";
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    label = "Yesterday";
  } else {
    label = dateObj.toLocaleDateString();
  }

  if (!acc[label]) acc[label] = [];
  acc[label].push(log);

  return acc;
}, {});

return (
      
    <div style={{
  padding: isMobile ? "10px" : "25px",
  background: theme.colors.background,
  minHeight: "100vh"
}}>
  <div style={{ marginBottom: "25px" }}>
  <h2 style={{
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "5px"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <span style={{ fontSize: "24px" }}>📦</span>
  <span>{t("stockEntry.title")}</span>
</div>
  </h2>

  <span style={{
    fontSize: "13px",
    color: theme.colors.muted
  }}>
    {t("stockEntry.subtitle")}
  </span>
</div>
    <div style={{ 
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  gap: "20px",
  alignItems: "flex-start",
  width: "100%"
}}>

  {user?.role === "owner" && !selectedBranch && (
  <p style={{
    marginBottom: "15px",
    color: theme.colors.muted
  }}>
    اختار فرع الأول 👆
  </p>
)}
  {/* 🟢 الكارد */}
  <div style={{
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    width: isMobile ? "100%" : "420px",
    padding: isMobile ? "16px" : "24px",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    flexShrink: 0,
  }}>
   

        {/* Product */}
        {items.map((item, index) => {
          const filteredProducts = products
            .filter(p =>
              p.name?.toLowerCase().includes((item.search || "").toLowerCase())
            )
            .slice(0, 5);

          return (
          
  
    <div key={index} style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "10px",
        marginBottom: "10px"
    }}>

        {/* Product */}
        <div style={{ flex: 2, position: "relative" }}>
  <input
  onKeyDown={(e) => {
  if (!filteredProducts.length) return;

  if (e.key === "ArrowDown") {
  e.preventDefault();

  setHighlightIndex(prev => {
    const newIndex = Math.min(
      (prev[index] || 0) + 1,
      filteredProducts.length - 1
    );

    setTimeout(() => {
      const container = dropdownRefs.current[index];
      const activeItem = container?.children[newIndex];

      if (activeItem) {
        activeItem.scrollIntoView({
          block: "nearest"
        });
      }
    }, 0);

    return {
      ...prev,
      [index]: newIndex
    };
  });
}

  if (e.key === "ArrowUp") {
  e.preventDefault();

  setHighlightIndex(prev => {
    const newIndex = Math.max((prev[index] || 0) - 1, 0);

    setTimeout(() => {
      const container = dropdownRefs.current[index];
      const activeItem = container?.children[newIndex];

      if (activeItem) {
        activeItem.scrollIntoView({
          block: "nearest"
        });
      }
    }, 0);

    return {
      ...prev,
      [index]: newIndex
    };
  });
}

  if (e.key === "Enter") {
  e.preventDefault();
  const selected = filteredProducts[highlightIndex[index] || 0];

  if (selected) {
    updateItem(index, "productId", selected.id);
    updateItem(index, "search", selected.name);
    setActiveIndex(null);
    setHighlightIndex(prev => ({ ...prev, [index]: 0 }));
  }
}

  if (e.key === "Escape") {
  setActiveIndex(null);
  setHighlightIndex(prev => ({ ...prev, [index]: 0 }));
}
}}  
    ref={(el) => (inputRefs.current[index] = el)}
    placeholder={t("stockEntry.searchProduct")}
    value={item.search || ""}
    onFocus={(e) => {
      e.target.select();
      setActiveIndex(index);
      setHighlightIndex(prev => ({ ...prev, [index]: 0 }));
    }}
    onBlur={() => {
      setTimeout(() => {
        setActiveIndex(null);
        setHighlightIndex(prev => ({ ...prev, [index]: 0 }));
      }, 150);
    }}
    onChange={(e) => {
      const value = e.target.value;
      setHighlightIndex(prev => ({ ...prev, [index]: 0 }));
      updateItem(index, "search", value);

      const found = products.find(p =>
  p.name?.toLowerCase().includes(value.toLowerCase())
);

      if (found) {
       updateItem(index, "productId", found.id);
      } else {
        updateItem(index, "productId", "");
      }
    }}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "10px",
      border: `1px solid ${theme.colors.border}`
    }}
  />

  {/* suggestions */}
  {activeIndex === index && item.search && (
    <div
    ref={(el) => (dropdownRefs.current[index] = el)}
    style={{
      position: "absolute",
      top: "110%",
      left: 0,
      right: 0,
      background: theme.colors.card,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: "10px",
      maxHeight: "150px",
      overflowY: "auto",
      zIndex: 10
    }}>
      {filteredProducts.map((p, i) => (
          <div
            key={p.id}
            onMouseDown={() => {
              updateItem(index, "productId", p.id);
              updateItem(index, "search", p.name);
              setActiveIndex(null);
              setHighlightIndex(prev => ({ ...prev, [index]: 0 }));
            }}
            style={{
              padding: "8px",
              cursor: "pointer",
              background:
                i === (highlightIndex[index] || 0)
                ? theme.colors.secondary 
                : "transparent"
            }}
          >
            {p.name}
          </div>
        ))}
    </div>
  )}
</div>

        {/* Quantity */}
        <input
        type="number"
        max={9999}
        placeholder={t("stockEntry.quantity")}
        value={item.quantity}
        onChange={(e) => updateItem(index, "quantity", e.target.value)}
        style={{
            flex: 1,
            width: isMobile ? "100%" : "auto",
            padding: "12px",
            borderRadius: "12px",
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.card,
            color: theme.colors.text
        }}
        />

        {/* Delete */}
        <button
          onClick={() => removeRow(index)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          🗑️
        </button>

    </div>
      );
})}
    <button
    onClick={addRow}
    style={{
        marginBottom: "15px",
        background: "transparent",
        border: `1px dashed ${theme.colors.border}`,
        padding: "10px",
        color: theme.colors.text,
        borderRadius: "10px",
        cursor: "pointer",
        width: "100%"
    }}
    >
    {t("stockEntry.addItem")}
    </button>

        <div style={{
          marginBottom: "12px",
          padding: "10px",
          borderRadius: "10px",
          background: theme.colors.secondary,
          fontSize: "13px"
        }}>
          📦 {t("stockEntry.items")}: {totalItems} <br />
          🔢 {t("stockEntry.totalQty")}: {totalQty}
        </div>
        {/* Button */}
        <button
            onClick={handlePurchase}
            disabled={!items.some(i => i.productId && i.quantity)}
            style={{
            width: "100%",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            fontSize: "15px",
            letterSpacing: "0.3px",
            transition: "0.2s",
            color: "#fff",
            border: "none",
            padding: "12px",
            borderRadius: "12px",
            fontWeight: "600",
            opacity: !items.some(i => i.productId && i.quantity) ? 0.5 : 1,
            cursor: !items.some(i => i.productId && i.quantity)
              ? "not-allowed"
              : "pointer",
            boxShadow: "0 6px 16px rgba(59,130,246,0.3)"
            }}
        >
            {t("stockEntry.addButton")}
        </button>
        

        
    </div>
    
    <div style={{
  flex: 1,
  width: "100%", // 🔥 أهم سطر
  maxWidth: "100%", // 🔥 يمنع أي ضغط
  maxHeight: isMobile ? "none" : "80vh",
  overflowY: "auto",
  paddingRight: "5px",
  marginTop: "5px"
}}>
        <div style={{
  display: "flex",
  gap: "6px",
  background: theme.colors.secondary,
  padding: "6px",
  borderRadius: "12px",
  width: "fit-content",
  marginBottom: "12px"
}}>
  
  {/* History */}
  <button
    onClick={() => setActiveTab("history")}
    style={{
      padding: "8px 14px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      boxShadow:
      activeTab === "history"
        ? "0 4px 10px rgba(0,0,0,0.1)"
        : "none",

        borderBottom:
          activeTab === "history"
            ? "2px solid " + theme.colors.primary
            : "2px solid transparent",
      background:
  activeTab === "history"
    ? theme.colors.primary
    : "transparent",

color:
  activeTab === "history"
    ? "#fff"
    : theme.colors.text,
      fontWeight: "600"
    }}
  >
    {t("stockEntry.history")}
  </button>

  {/* Timeline */}
  <button
    onClick={() => setActiveTab("timeline")}
    style={{
      padding: "8px 14px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      background:
  activeTab === "timeline"
    ? theme.colors.primary
    : "transparent",

  borderBottom:
    activeTab === "timeline"
      ? "2px solid " + theme.colors.primary
      : "2px solid transparent",
      color:
        activeTab === "timeline"
          ? "#fff"
          : theme.colors.text,
      fontWeight: "600"
    }}
  >
    Timeline
  </button>
  </div>



  
  

    
    {activeTab === "timeline" && (
  <div style={{
    marginBottom: "15px",
    background: theme.colors.card,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",    
    border: `1px solid ${theme.colors.border}`,
    borderRadius: "14px",
    padding: "18px",
    transition: "all 0.15s ease"
  }}>

    <h3 style={{
  marginBottom: "10px",
  fontSize: "16px",
  fontWeight: "600"
}}>
      📊 Global Timeline
    </h3>
  <input
  placeholder="🔍 Search product..."
  value={timelineSearch}
  onChange={(e) => setTimelineSearch(e.target.value)}
  style={{
    width: "100%",
    marginBottom: "10px",
    padding: "12px",
fontSize: "14px",
    borderRadius: "10px",
    border: `1px solid ${theme.colors.border}`
  }}
/>
    {Object.entries(groupedLogs).map(([date, logs]) => (
  <div key={date} style={{ marginBottom: "15px" }}>
    
    {/* 🔥 Date Header */}
    <div style={{
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "6px",
      color: theme.colors.muted
    }}>
      <span style={{
  fontWeight: date === "Today" || date === "Yesterday" ? "700" : "500"
}}>
  {date}
</span>
    </div>

    {logs.map((log, i) => {
      const product = productsMap[log.productId];
      const isUndo = log.type === "undo_purchase";

      return (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px",
            marginBottom: "6px",
            borderBottom: `1px solid ${theme.colors.border}`,
            borderRadius: "8px",
            cursor: "default"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.secondary;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        >
          <span style={{
  fontSize: "10px"
}}>
  {isUndo ? "🔴" : "🟢"}
</span>

          <div style={{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "2px"
}}>
            <div>{product?.name || "—"}</div>

            <div style={{ fontSize: "11px", color: "#888" }}>
              {isUndo ? "Undo" : "Purchase"} • {log.branchId || "-"}
            </div>
          </div>

          <span style={{ fontSize: "11px", color: "#888" }}>
            {new Date(
              log.createdAt?.seconds
                ? log.createdAt.seconds * 1000
                : log.createdAt
            ).toLocaleTimeString()}
          </span>

          <span style={{
            fontWeight: "bold",
            color: isUndo ? "#ef4444" : "#22c55e"
          }}>
            {isUndo ? "-" : "+"}
            {Math.abs(log.quantity)}
          </span>
        </div>
      );
    })}
  </div>
))}

  </div>
)}
    {activeTab === "history" && (
  <>
  <div style={{
  display: "flex",
gap: "6px",
background: theme.colors.secondary,
padding: "6px",
borderRadius: "12px",
width: "fit-content",
marginBottom: "16px",

}}>
  
  {/* Date filter */}
  <input
    type="date"
    onChange={(e) => setDateFilter(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: "8px",
      border: `1px solid ${theme.colors.border}`
    }}
  />

  {/* User filter (placeholder دلوقتي) */}
  <input
    placeholder={t("users.title")}
    style={{
      padding: "8px",
      borderRadius: "8px",
      border: `1px solid ${theme.colors.border}`
    }}
  />

</div>
  <input
  placeholder={`🔍 ${t("common.search")}`}
  value={search}
  onChange={(e) => setSearch(e.target.value.trimStart())}
  style={{
    width: "100%",
    marginBottom: "10px",
    padding: "12px",
    borderRadius: "12px",
    display: "block",
  }}
/>
    {purchases.length === 0 && (
      <div style={{
  textAlign: "center",
  padding: "40px",
  opacity: 0.6
}}>
  <div style={{ fontSize: "40px" }}>📭</div>
  <div style={{ marginTop: "10px" }}>
    {t("stockEntry.noData")}
  </div>
</div>
    )}

    <div style={{
  width: "100%",
  overflowX: "auto"
}}>
  <table style={{
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px"
  }}>

    {/* HEADER */}
    <thead>
      <tr style={{
        textAlign: "left",
        borderBottom: `1px solid ${theme.colors.border}`,
borderRadius: "8px",
transition: "0.2s",

      }}>
        
        
        <th>{t("common.date")}</th>
        <th>{t("stockEntry.items")}</th>
        <th>{t("stockEntry.totalQty")}</th>
        <th>{t("users.title")}</th>
        <th></th>
      </tr>
    </thead>

    {/* BODY */}
    <tbody>
      {purchases
        .filter(p => {
  const matchesSearch = p.items.some(i =>
    productsMap[i.productId]?.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const matchesDate = dateFilter
    ? new Date(
        p.createdAt?.seconds
          ? p.createdAt.seconds * 1000
          : p.createdAt
      )
        .toISOString()
        .slice(0, 10) === dateFilter
    : true;

  return matchesSearch && matchesDate;
})
        .map(p => {
          const purchaseLogs = stockLogs
          .filter(s => s.purchaseId === p.id)
          .sort(
            (b, a) =>
              (b.createdAt?.seconds || 0) -
              (a.createdAt?.seconds || 0)
          );

          const totalQty = p.items.reduce(
            (sum, i) => sum + Number(i.quantity),
            0
          );
          
          return (
          <React.Fragment key={p.id}>
              <tr  
                
                style={{
                  borderBottom: `1px solid ${theme.colors.border}`,
                  borderRadius: "8px",
                  transition: "0.2s",
                  cursor: "pointer",
                }}
                
                onMouseEnter={(e) => {
  e.currentTarget.style.background = theme.colors.secondary;
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background = "transparent";
}}
                onClick={() =>
                  setOpenId(openId === p.id ? null : p.id)
                }
              >
                <td style={{ padding: "10px" }}>
                  {new Date(
                    p.createdAt?.seconds
                      ? p.createdAt.seconds * 1000
                      : p.createdAt
                  ).toLocaleString()}
                </td>

                <td style={{ padding: "10px" }}>{p.items.length}</td>
                <td style={{ padding: "10px" }}>{totalQty}</td>
               <td style={{ padding: "10px" }}>{p.userName || p.userId || "-"}</td>
                <td style={{ padding: "10px" }}>
  <button
  disabled={p.undone}
  onClick={(e) => {
    e.stopPropagation();
    handleUndo(p);
  }}
  style={{
    background: p.undone ? "#9ca3af" : "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: p.undone ? "not-allowed" : "pointer"
  }}
>
  {p.undone ? "Undone" : "Undo"}
</button>
</td>

                <td style={{ padding: "10px" }}>
                  {openId === p.id ? "▲" : "▼"}
                </td>
              </tr>

              {/* DETAILS */}
              {openId === p.id && (
                <tr>
                  <td colSpan="6">
                    <div style={{
                      padding: "12px",
                      background: theme.colors.secondary,
                      borderRadius: "10px",
                      margin: "5px 0"
                    }}>

  {/* 🔥 Timeline */}
  <div style={{ marginBottom: "10px" }}>
    {purchaseLogs.map((log, i) => {
      const product = productsMap[log.productId];

      const isUndo = log.type === "undo_purchase";

      return (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px",
            fontSize: "13px",
            borderRadius: "6px"
          }}
        >
          <span>
            {isUndo ? "🔴" : "🟢"}
          </span>

          <div style={{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "2px"
}}>
            <div>{product?.name || "—"}</div>

            <div style={{ fontSize: "11px", color: "#888" }}>
              {isUndo ? "Undo" : "Purchase"} • {log.branchId || "-"}
            </div>
          </div>

          <span style={{ fontSize: "11px", color: "#888" }}>
  {new Date(
    log.createdAt?.seconds
      ? log.createdAt.seconds * 1000
      : log.createdAt
  ).toLocaleTimeString()}
</span>

<span>
  {isUndo ? "-" : "+"}
  {Math.abs(log.quantity)}
</span>
        </div>
      );
    })}
  </div>

  {/* 🔥 Summary per item */}
  {p.items.map((item, i) => {
    const product = productsMap[item.productId];

    const logs = stockMap[`${p.id}_${item.productId}`] || [];
    const log = logs.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    )[0];

    const before = log?.before ?? "-";
    const after = log?.after ?? item.quantity;
    const beforeNum = Number(before);
    const afterNum = Number(after);

    return (
      <div
        key={i}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "6px 0"
        }}
      >
        <span>{product?.name || "—"}</span>

        <span style={{ fontWeight: "bold" }}>
          <span style={{ color: "#888" }}>{before}</span>
          <span style={{ margin: "0 5px" }}>→</span>
          <span style={{ color: afterNum > beforeNum ? "#22c55e" : "#ef4444" }}>
            {after}
          </span>
        </span>
      </div>
    );
  })}

</div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
    </tbody>

  </table>
</div>
  </>
)}
</div>
    </div>
    </div>
    );
    }