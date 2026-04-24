import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  increment
} from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState, useMemo } from "react";
import Topbar from "../components/Topbar";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp"
import { theme } from "../theme";
export default function Inventory() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [showReturned, setShowReturned] = useState(false);
  const [returnedItems, setReturnedItems] = useState([]);
  const [resellData, setResellData] = useState({});
  const [returnedSearch, setReturnedSearch] = useState("");
  const [sortType, setSortType] = useState("newest");
  useEffect(() => {
  const fetchBranches = async () => {
    const snapshot = await getDocs(collection(db, "branches"));

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setBranches(data);
  };

  fetchBranches();
}, []);
  
const { selectedBranch } = useApp();
  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
  new Date().toISOString().slice(0, 7)
);
  const [productsList, setProductsList] = useState([]);
  useEffect(() => {
  if (!user) return;

  const branchToUse =
    user.role === "admin"
      ? selectedBranch
      : user.branchId;

  if (!branchToUse) return;

  // 🟢 ALL → نسيبه زي ما هو (getDocs)
  if (branchToUse === "all") {
    const fetchAll = async () => {
      const [productsSnap, inventorySnap, stockSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "inventory")),
        getDocs(collection(db, "stock"))
      ]);

      const inventoryMap = {};

      inventorySnap.forEach(doc => {
        const data = doc.data();
        if (!data.productId) return;

        inventoryMap[data.productId] =
          (inventoryMap[data.productId] || 0) + data.quantity;
      });

      const finalProducts = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        quantity: inventoryMap[doc.id] || 0
      }));

      setProducts(finalProducts);
      setStockData(stockSnap.docs.map(d => d.data()));
    };

    fetchAll();
return () => {};
  }

  // 🔥 BRANCH → Real-time
  const unsubInventory = onSnapshot(
    query(
      collection(db, "inventory"),
      where("branchId", "==", branchToUse)
    ),
    (inventorySnap) => {

      const inventoryMap = {};

      inventorySnap.forEach(doc => {
        const data = doc.data();
        if (!data.productId) return;

        inventoryMap[data.productId] = data.quantity;
      });

      // 🟢 نجيب products مرة واحدة بس
      if (productsList.length === 0) return;

const finalProducts = productsList.map(p => ({
  ...p,
  quantity: inventoryMap[p.id] || 0
}));

setProducts(finalProducts);
    }
  );

  const unsubStock = onSnapshot(
    query(
      collection(db, "stock"),
      where("branchId", "==", branchToUse)
    ),
    (snap) => {
      setStockData(snap.docs.map(d => d.data()));
    }
  );

  return () => {
    unsubInventory();
    unsubStock();
  };

}, [selectedBranch, user, productsList.length]);
useEffect(() => {
  getDocs(collection(db, "products")).then((snap) => {
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProductsList(data);
  });
}, []);
useEffect(() => {
  let q;

  if (selectedBranch === "all") {
    q = collection(db, "returned_items");
  } else {
    q = query(
      collection(db, "returned_items"),
      where("branchId", "==", selectedBranch)
    );
  }

  const unsub = onSnapshot(q, (snap) => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(i => i.status !== "sold");

    setReturnedItems(data);
  });

  return () => unsub();
}, [selectedBranch]);
useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setShowReturned(false);
    }
  };

  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, []);

  const filtered = useMemo(() => {
  return products.filter(p =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );
}, [products, search]);

const emptyStats = {
  opening: 0,
  inQty: 0,
  outQty: 0,
  closing: 0
}; 
const renderSection = (title, type, isSub = false) => {
  const items = filtered.filter(p => {
  const sub = (p.subCategory || "").toLowerCase().trim();
  const cat = (p.category || "").toLowerCase().trim();

  return isSub
    ? sub === type.toLowerCase()
    : cat === type.toLowerCase();
});

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: "30px" }}>
      <div style={{ display: "inline-block" }}>
  <h2 style={{
    marginBottom: "6px",
    marginTop: "25px",
    fontSize: "20px",
    fontWeight: "600",
    letterSpacing: "-0.3px",
    color: theme.colors.text
  }}>
    {title}
  </h2>

  <div style={{
    height: "3px",
    background: theme.colors.primary,
    borderRadius: "10px",
    width: "100%"
  }} />
</div>
      <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "15px"
}}>
      {items.map((p) => {
  const stats = statsMap[p.id] || emptyStats;
        const category = (p.category || "").toLowerCase();
const sub = (p.subCategory || "").toLowerCase();

// 🟣 French / Oriental / Musk
const isComposed =
  category.includes("french") ||
  category.includes("oriental") ||
  category.includes("musk");

// 🟢 Ready + Containers
const isReadyOrContainer =
  ["cream", "makhmaria", "original"].includes(category) ||
  ["bottle", "box"].includes(sub);

// 🔥 condition النهائي
const isLowStock =
  p.quantity > 0 &&
  (
    (isComposed && p.quantity <= 100) ||
    (isReadyOrContainer && p.quantity <= 5)
  );

        return (
          <div
  key={p.id}
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    background:
  p.quantity === 0
    ? "rgba(239,68,68,0.05)"
    : isLowStock
    ? "rgba(245,158,11,0.05)"
    : theme.colors.card,

border:
  p.quantity === 0
    ? `1px solid ${theme.colors.danger}`
    : isLowStock
    ? `1px solid ${theme.colors.warning}`
    : `1px solid ${theme.colors.border}`,
    padding: "16px",
    borderRadius: "18px",
    margin: "10px 0",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
    transition: "0.2s",
    cursor: "pointer"
  }}

  onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-6px)";
  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)";
}}

 onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
}}
>
            <div>
              <strong style={{
  fontSize: "16px",
  fontWeight: "600",
  color: theme.colors.text
}}>
  {p.name}
</strong>


              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                {(p.category || "")} {p.size && `- ${p.size}`}
              </div>
            </div>

            <div style={{ marginTop: "10px" }}>
              <span style={{
  fontWeight: "600",
  fontSize: "13px",
  padding: "6px 14px",
  borderRadius: "999px",
  background:
  p.quantity === 0
    ? "rgba(239,68,68,0.1)"
    : p.quantity <= 5
    ? "rgba(245,158,11,0.1)"
    : "rgba(34,197,94,0.1)",

color:
  p.quantity === 0
    ? theme.colors.danger
    : p.quantity <= 5
    ? theme.colors.warning
    : theme.colors.success
      
}}>
  {p.quantity}
</span>
{p.quantity === 0 && (
  <div style={{ color: theme.colors.danger, fontSize: "12px" }}>
    ❌ Out of stock
  </div>
)}

{isLowStock && (
  <div style={{ color: theme.colors.warning, fontSize: "12px" }}>
    ⚠️ Low stock
  </div>
)}
<div style={{
  marginTop: "8px",
  fontSize: "12px",
  opacity: 0.7
}}>
  <div>Opening: {stats.opening}</div>
  <div>In: {stats.inQty}</div>
  <div>Out: {stats.outQty}</div>
  <div>Closing: {stats.closing}</div>
</div>


            </div>
          </div>
        );
      })}
</div>
    </div>
  );
};
const statsMap = useMemo(() => {

  const map = {};

  const start = new Date(selectedMonth + "-01");
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  stockData.forEach((s) => {

    if (!s.productId) return;

    if (!map[s.productId]) {
      map[s.productId] = {
        opening: 0,
        inQty: 0,
        outQty: 0,
        closing: 0
      };
    }

    const stat = map[s.productId];

    if (!s.createdAt) return;

const date = new Date(
  s.createdAt?.seconds
    ? s.createdAt.seconds * 1000
    : s.createdAt
);

    // قبل الشهر
    if (date < start) {
      if (s.type === "sale" || s.type === "waste") {
        stat.opening -= s.quantity;
      } else {
        stat.opening += s.quantity;
      }
    }

    // خلال الشهر
    if (date >= start && date < end) {
      if (s.type === "sale" || s.type === "waste") {
        stat.outQty += s.quantity;
      } else {
        stat.inQty += s.quantity;
      }
    }

    stat.closing = stat.opening + stat.inQty - stat.outQty;
  });

  return map;

}, [stockData, selectedMonth]);

const handleResell = async (item) => {
  if (!item) return;
  try {
    const data = resellData[item.id] || {};
    const price = data.price ?? item.price;
    if (price <= 0) {
  alert("السعر لازم يكون أكبر من 0 ❗");
  return;
}
    const payment = data.payment || "Cash";
    if (!item.productId) {
  alert("❌ المنتج ده مش مربوط بمنتج أساسي");
  return;
}
    await addDoc(collection(db, "sales"), {
      items: [{
        id: item.productId,
        name: item.name,
        price,
        qty: 1,
        containerType: item.containerType || "",
        containerName: item.containerName || "",
      }],
      total: price,
      paymentMethod: payment,
      customerName: "Walk-in",
      customerPhone: "-",
      branchId: item.branchId,
      source: "resell",
      createdAt: serverTimestamp()
    });
    await addDoc(collection(db, "stock"), {
  productId: item.productId,
  quantity: 1,
  type: "sale",
  branchId: item.branchId,
  createdAt: serverTimestamp()
});
if (item.productId) {
  await updateDoc(
    doc(db, "inventory", `${item.branchId}_${item.productId}`),
    {
      quantity: increment(-1)
    }
  );
}

    await updateDoc(doc(db, "returned_items", item.id), {
      status: "sold"
    });

    setReturnedItems(prev =>
      prev.filter(i => i.id !== item.id)
    );

    alert("تم إعادة البيع 🔥");
    setResellData(prev => {
  const copy = { ...prev };
  delete copy[item.id];
  return copy;
});

  } catch (err) {
    console.error(err);
  }
};
const filteredReturned = useMemo(() => {
  let data = [...returnedItems].filter(i =>
    (i.name || "").toLowerCase().includes(returnedSearch.toLowerCase()) ||
    (i.containerName || "").toLowerCase().includes(returnedSearch.toLowerCase())
  );

  if (sortType === "price") {
    data.sort((a, b) => b.price - a.price);
  } else {
    data.sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );
  }

  return data;
}, [returnedItems, returnedSearch, sortType]);
useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);
const getBranchName = (id) => {
  return branches.find(b => b.id === id)?.name || "Unknown";
};

return (
  <div style={{ padding: "20px" }}>

    

    <h1>Inventory 📦</h1>
    <button
  onClick={() => setShowReturned(true)}
  style={{
    marginBottom: "15px",
    padding: "10px 15px",
    borderRadius: "10px",
    border: "none",
    background: theme.colors.primary,
    color: "#fff",
    cursor: "pointer"
  }}
>
  📦 Returned Items ({returnedItems.length})
</button>
    <input
  type="month"
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(e.target.value)}
  style={{
    marginBottom: "20px",
    padding: "10px",
    borderRadius: "10px",
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.card,
    color: theme.colors.text
  }}
/>

{user?.role === "admin" && !selectedBranch && (
  <p style={{ marginBottom: "20px", opacity: 0.6,color: theme.colors.muted }}>
    اختار فرع من فوق 👆
  </p>
)}

{/* 🔥 Stats */}
<div style={{
  display: "flex",
  gap: "15px",
  marginBottom: "25px"
}}>
  {[
    { label: "Products", value: products.length, icon: "📦" },
    {
  label: "Low Stock",
  value: products.filter(p => {
    const category = (p.category || "").toLowerCase();
    const sub = (p.subCategory || "").toLowerCase();

    const isComposed =
      category.includes("french") ||
      category.includes("oriental");

    const isReadyOrContainer =
      ["cream", "makhmaria", "original"].includes(category) ||
      ["bottle", "box"].includes(sub);

    return (
      p.quantity > 0 &&
      (
        (isComposed && p.quantity <= 100) ||
        (isReadyOrContainer && p.quantity <= 5)
      )
    );
  }).length,
  icon: "⚠️"
},
    { label: "Out", value: products.filter(p => p.quantity === 0).length, icon: "❌" }
  ].map((card, i) => (
    <div
      key={i}
      style={{
        flex: 1,
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        backdropFilter: "blur(10px)",
        padding: "18px",
        borderRadius: "16px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        transition: "0.2s"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontSize: "13px", opacity: 0.6 }}>
        {card.icon} {card.label}
      </div>
      <div style={{
        fontSize: "22px",
        fontWeight: "600",
        marginTop: "5px"
      }}>
        {card.value}
      </div>
    </div>
  ))}
</div>
{/* 🔍 Search */}
<div style={{ position: "relative", marginBottom: "30px" }}>
  <span style={{
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    opacity: 0.5
  }}>
    🔍
  </span>

  <input
    placeholder="Search product..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      padding: "14px 18px 14px 35px",
      width: "100%",
      borderRadius: "16px",
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.card,
      color: theme.colors.text,
      outline: "none",
      fontSize: "14px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.04)"
    }}
  />
</div>
      {filtered.length === 0 && selectedBranch && (
  <p style={{
    opacity: 0.6,
    color: theme.colors.muted,
    textAlign: "center"
  }}>
    مفيش نتائج
  </p>
)}


      
      {!selectedBranch && user?.role === "admin" ? null : (
  <>
    
    {renderSection("French", "French")}
    {renderSection("Oriental A 🟤", "Oriental-A")}
    {renderSection("Oriental B 🟤", "Oriental-B")}
    {renderSection("Oriental C 🟤", "Oriental-C")}

    {renderSection("Musk 🟢", "Musk")}
    {renderSection("Cream 🧴", "Cream")}
    {renderSection("Makhmaria 🌸", "Makhmaria")}

    {renderSection("Bottles 🧴", "Bottle", true)}
    {renderSection("Samples 🧪", "samples", true)}
    {renderSection("Boxes 🎁", "Box", true)}
    {renderSection("Original 🔴", "Original")}
  </>
)}
    {showReturned && (
  <div
  onClick={() => setShowReturned(false)} // 🔥 يقفل لما تدوس برا
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999
  }}
>
    <div
  onClick={(e) => e.stopPropagation()} // 🔥 يمنع القفل جوه
  style={{
    position: "relative",
    background: theme.colors.card,
    padding: "20px",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "700px",
    maxHeight: "80vh",
    overflowY: "auto",
    animation: "fadeIn 0.25s ease"
  }}
>

      <h2>Returned Items</h2>
      <input
  placeholder="Search..."
  value={returnedSearch}
  onChange={(e) => setReturnedSearch(e.target.value)}
  style={{
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "10px"
  }}
/>

<select
  value={sortType}
  onChange={(e) => setSortType(e.target.value)}
  style={{
    marginBottom: "15px",
    padding: "8px",
    borderRadius: "10px"
  }}
>
  <option value="newest">Newest</option>
  <option value="price">Highest Price</option>
</select>

      <button
  onClick={() => setShowReturned(false)}
  style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer"
  }}
>
  ✖
</button>

      {filteredReturned.length === 0 && (
  <p style={{ opacity: 0.6 }}>مفيش منتجات مرتجعة</p>
)}
      {filteredReturned.map(item => {
        const data = resellData[item.id] || {};

        return (
          <div
  key={item.id}
  style={{
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  }}
>
  <strong>{item.name}</strong>

<div style={{ fontSize: "13px", opacity: 0.7 }}>
  {item.containerName}
</div>
<div style={{
  fontSize: "11px",
  opacity: 0.6,
  marginTop: "3px"
}}>
  📅 {item.createdAt?.seconds
    ? new Date(item.createdAt.seconds * 1000).toLocaleString()
    : "—"}
</div>

{selectedBranch === "all" && (
  <div
    style={{
      fontSize: "11px",
      marginTop: "4px",
      display: "inline-block",
      background: theme.colors.primary,
      color: "#fff",
      padding: "2px 8px",
      borderRadius: "8px"
    }}
  >
    {getBranchName(item.branchId)}
  </div>
)}

  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
    <input
      type="number"
      value={data.price ?? ""}
placeholder={item.price}
      onChange={(e) =>
        setResellData({
          ...resellData,
          [item.id]: {
            ...data,
            price: e.target.value === "" ? "" : Number(e.target.value)
          }
        })
      }
      style={{ flex: 1, padding: "8px", borderRadius: "8px" }}
    />

    <select
      value={data.payment || "Cash"}
      onChange={(e) =>
        setResellData({
          ...resellData,
          [item.id]: {
            ...data,
            payment: e.target.value
          }
        })
      }
      style={{ flex: 1, borderRadius: "8px" }}
    >
      <option>Cash</option>
      <option>Visa</option>
      <option>Instapay</option>
    </select>
  </div>

  <button
    onClick={() => handleResell(item)}
    style={{
      marginTop: "8px",
      width: "100%",
      background: theme.colors.success,
      color: "#fff",
      padding: "10px",
      borderRadius: "10px",
      border: "none"
    }}
  >
    Resell
  </button>
</div>
        );
      })}
    </div>
  </div>
)}
    </div>
  );
}