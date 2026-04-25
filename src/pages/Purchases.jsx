    import { useState, useEffect } from "react";
    import {
  addDoc,
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
    
    export default function Purchases() {
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
    const addRow = () => {
    setItems([...items, { productId: "", quantity: "" }]);
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
    const [openId, setOpenId] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [search, setSearch] = useState("");
    // 🔥 نجيب المنتجات
    useEffect(() => {
        const fetchProducts = async () => {
        const snap = await getDocs(collection(db, "products"));
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchProducts();
    }, []);
    useEffect(() => {
  if (!user) return;
  if (user.role === "admin" && !selectedBranch) return;

  const branchToUse =
    user.role === "admin"
      ? selectedBranch
      : user.branchId;

  let q;

if (branchToUse === "all") {
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

    
    const handlePurchase = async () => {

  const branchToUse =
    user.role === "admin"
      ? selectedBranch
      : user.branchId;

  if (!branchToUse || branchToUse === "all") {
    alert("اختار فرع ❗");
    return;
  }

  const validItems = items.filter(
    (i) => i.productId && i.quantity
  );

  if (!validItems.length) {
    alert("ضيف منتجات ❗");
    return;
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

  // ✅ 1) stock log
  await addDoc(collection(db, "stock"), {
    productId,
    quantity: qty,
    branchId: branchToUse,
    createdAt: serverTimestamp(),
    type: "purchase",
    purchaseId: purchaseRef.id
  });

  // ✅ 2) inventory (per branch 🔥)
  await setDoc(
    doc(db, "inventory", `${branchToUse}_${productId}`),
    {
      quantity: increment(qty)
    },
    { merge: true }
  );
}

    alert("تمت الفاتورة ✅");
    setItems([{ productId: "", quantity: "" }]);

  } catch (err) {
    alert("في مشكلة ❌");
  }
};
const isMobile = window.innerWidth < 768;
const productsMap = Object.fromEntries(
  products.map(p => [p.id, p])
);
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
    Purchases
  </h2>

  <span style={{
    fontSize: "13px",
    color: theme.colors.muted
  }}>
    Manage and track your purchases
  </span>
</div>
    <div style={{ 
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "20px",
      alignItems: "flex-start",
      width: "100%" // 🔥 ده اللي ناقصك
    }}>

  {user?.role === "admin" && !selectedBranch && (
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
        {items.map((item, index) => (
    <div key={index} style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "10px",
        marginBottom: "10px"
    }}>

        {/* Product */}
        <select
        value={item.productId}
        onChange={(e) => updateItem(index, "productId", e.target.value)}
        style={{
            flex: 2,
            width: isMobile ? "100%" : "auto",
            padding: "10px",
            borderRadius: "10px",
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.card,
            color: theme.colors.text
        }}
        >
        <option value="">Product</option>
        {products.map(p => (
  <option key={p.id} value={p.id}>
    {p.name}
  </option>
))}
        </select>

        {/* Quantity */}
        <input
        type="number"
        max={9999}
        placeholder="Qty"
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
            background: "rgba(239,68,68,0.1)",
            color: theme.colors.danger,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
            padding: "10px",
        }}
        >
        ❌
        </button>

    </div>
    ))}
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
    + Add Item
    </button>

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
            Add Purchase
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
        <div
        
  onClick={() => setShowHistory(!showHistory)}
  onMouseEnter={(e) => {
  if (!isMobile) {
    e.currentTarget.style.background = theme.colors.secondary;
  }
}}
onMouseLeave={(e) => {
  if (!isMobile) {
    e.currentTarget.style.background = theme.colors.card;
  }
}}
  style={{
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: "6px",
    alignItems: isMobile ? "flex-start" : "center",
    cursor: "pointer",
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    padding: "16px 18px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "14px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
    marginBottom: "10px",
    transition: "0.2s"
  }}
>
  
  <span style={{ fontWeight: "600" }}>History 📊</span>

  <span style={{
    transform: showHistory ? "rotate(180deg)" : "rotate(0deg)",
    transition: "0.2s"
  }}>
    ⌄
  </span>
</div>
    
    {showHistory && (
  <>
  <input
  placeholder="🔍 Search..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
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
  📦
  <div style={{ marginTop: "10px" }}>
    No purchases yet
  </div>
</div>
    )}

    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
  {purchases
  .filter(p =>
    p.items.some(i =>
      productsMap[i.productId]?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )
  )
  .map((p) => {
    const isOpen = openId === p.id;

    return (
    <div
      key={p.id}
      style={{
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "14px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
        overflow: "hidden"
      }}
    >

      {/* 🔘 HEADER */}
      <div
        onClick={() => setOpenId(isOpen ? null : p.id)}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.background = theme.colors.secondary;
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.background = theme.colors.card;
          }
        }}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          transition: "0.2s"
        }}
      >
        <span style={{ fontSize: "13px", color: theme.colors.muted }}>
          📅 {new Date(
            p.createdAt?.seconds
              ? p.createdAt.seconds * 1000
              : p.createdAt
          ).toLocaleString()}
        </span>

        <span style={{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "0.2s"
        }}>
          ⌄
        </span>
      </div>

      {/* 📦 DETAILS */}
      {isOpen && (
        <div style={{
          padding: "10px 16px",
          borderTop: `1px solid ${theme.colors.border}`,
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          {p.items.map((item, i) => {
  const product = productsMap[item.productId];

  return (
    <div
      key={i}
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "6px",
        alignItems: isMobile ? "flex-start" : "center",
        background: theme.colors.secondary,
        padding: "10px",
        borderRadius: "10px"
      }}
    >
      <div>
        <div style={{ fontWeight: "600" }}>
          {product?.name || "منتج"}
        </div>
        <div style={{ fontSize: "12px", opacity: 0.6 }}>
          Item
        </div>
      </div>

      <div style={{
        fontWeight: "bold",
        color: theme.colors.success
      }}>
        +{item.quantity}
      </div>
    </div>
  );
})}
        </div>
      )}

    </div>
  );
})}
        </div>
  </>
)}
    </div>
    </div>
    </div>
    );
    }