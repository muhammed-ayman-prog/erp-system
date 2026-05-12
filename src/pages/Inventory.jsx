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
  const [sortType, setSortType] = useState("newest");
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  
  

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

        inventoryMap[data.productId] =
  (inventoryMap[data.productId] || 0)
  + data.quantity;
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
  const fetchTransfers = async () => {
    const snap = await getDocs(collection(db, "transfers"));
    setTransfers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchAdjustments = async () => {
    const snap = await getDocs(collection(db, "adjustments"));
    setAdjustments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  fetchTransfers();
  fetchAdjustments();
}, []);
useEffect(() => {
  getDocs(collection(db, "products")).then((snap) => {
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProductsList(data);
  });
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
  const items = filtered
  .filter(p => {
    const sub = (p.subCategory || "").toLowerCase().trim();
    const cat = (p.category || "").toLowerCase().trim();

    return isSub
      ? sub === type.toLowerCase()
      : cat === type.toLowerCase();
  })
  .sort((a, b) => {

    const getPriority = (p) => {
      const category = (p.category || "").toLowerCase();
      const sub = (p.subCategory || "").toLowerCase();

      const isComposed =
        category.includes("french") ||
        category.includes("oriental") ||
        category.includes("musk");

      const isReadyOrContainer =
        ["cream", "makhmaria", "original"].includes(category) ||
        ["bottle", "box", "samples"].includes(sub);

      const isLowStock =
        p.quantity > 0 &&
        (
          (isComposed && p.quantity <= 100) ||
          (isReadyOrContainer && p.quantity <= 5)
        );

      // ✅ Out of stock آخر حاجة
      if (p.quantity === 0) return 3;

      // ✅ Low stock قبل الـ out
      if (isLowStock) return 2;

      // ✅ الباقي الطبيعي
      return 1;
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    // الأولوية
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // داخل نفس المجموعة → أعلى stock الأول
    return b.quantity - a.quantity;
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
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
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
  ["bottle", "box", "samples"].includes(sub);

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
    padding: isMobile ? "12px" : "16px",
    borderRadius: "20px",
    margin: "10px 0",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
    transition: "0.2s",
    cursor: "pointer"
  }}

  onMouseEnter={(e) => {
  if (window.innerWidth > 768) {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)";
  }
}}

onMouseLeave={(e) => {
  if (window.innerWidth > 768) {
    e.currentTarget.style.transform = "translateY(0)";
  }
}}
>
            <div>
              <strong style={{
  fontSize: isMobile ? "14px" : "16px",
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
    : isLowStock
    ? "rgba(245,158,11,0.1)"
    : "rgba(34,197,94,0.1)",

color:
  p.quantity === 0
    ? theme.colors.danger
    : isLowStock
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
      if (
  s.direction === "OUT"
) {
        stat.opening -= s.quantity;
      } else {
        stat.opening += s.quantity;
      }
    }

    // خلال الشهر
    if (date >= start && date < end) {
      if (
  s.direction === "OUT"
) {
        stat.outQty += s.quantity;
      } else {
        stat.inQty += s.quantity;
      }
    }

    stat.closing = stat.opening + stat.inQty - stat.outQty;
  });
    // 🔄 TRANSFERS
  transfers.forEach(t => {
    if (!t.productId) return;

    if (!map[t.productId]) {
      map[t.productId] = { opening: 0, inQty: 0, outQty: 0, closing: 0 };
    }

    const stat = map[t.productId];

    const date = t.createdAt?.toDate
      ? t.createdAt.toDate()
      : new Date(t.createdAt);

    const currentBranch = selectedBranch;

    if (!currentBranch) return;

    // قبل الشهر
    if (date < start) {
      if (t.toBranch === currentBranch) stat.opening += t.qty;
      if (t.fromBranch === currentBranch) stat.opening -= t.qty;
    }

    // خلال الشهر
    if (date >= start && date < end) {
      if (t.toBranch === currentBranch) stat.inQty += t.qty;
      if (t.fromBranch === currentBranch) stat.outQty += t.qty;
    }

    stat.closing = stat.opening + stat.inQty - stat.outQty;
  });

  // ⚖️ ADJUSTMENTS
  adjustments.forEach(a => {
    if (!a.productId) return;

    if (!map[a.productId]) {
      map[a.productId] = { opening: 0, inQty: 0, outQty: 0, closing: 0 };
    }

    const stat = map[a.productId];

    const date = a.createdAt?.toDate
      ? a.createdAt.toDate()
      : new Date(a.createdAt);

    const type = a.adjustType || a.type;

    if (date < start) {
      if (type === "increase") stat.opening += a.qty;
      else stat.opening -= a.qty;
    }

    if (date >= start && date < end) {
      if (type === "increase") stat.inQty += a.qty;
      else stat.outQty += a.qty;
    }

    stat.closing = stat.opening + stat.inQty - stat.outQty;
  });
  return map;

}, [stockData, transfers, adjustments, selectedMonth, selectedBranch]);



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
const isMobile = window.innerWidth < 768;
return (
  <div style={{ padding: isMobile ? "10px" : "20px" }}>

    

    <h1>Inventory 📦</h1>
    
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
    color: theme.colors.text,
    width: "100%"
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
  flexWrap: "wrap", // 🔥 مهم
  gap: "10px",
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
      ["bottle", "box", "samples"].includes(sub);

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
        flex: "1 1 120px",
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        backdropFilter: "blur(10px)",
        padding: "18px",
        borderRadius: "16px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        transition: "0.2s"
      }}
      onMouseEnter={(e) => {
        if (window.innerWidth > 768)
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
<div style={{ position: "relative", marginBottom: "20px" }}>
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
      maxWidth: "100%", // 🔥 ضيف دي
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
    
    </div>
  );
}