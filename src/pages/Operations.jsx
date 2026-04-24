import { addDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  runTransaction
} from "firebase/firestore";
import { useApp } from "../store/useApp";



export default function Operations() {
  const [purchaseProduct, setPurchaseProduct] = useState("");
const [purchaseQty, setPurchaseQty] = useState(0);
const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);

useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("user"));
  if (stored) setUser(stored);
}, []);
const { selectedBranch } = useApp();
const branchToUse =
  user?.role === "admin"
    ? selectedBranch
    : user?.branchId;
  const [activeAction, setActiveAction] = useState(null);
  const [returnedItems, setReturnedItems] = useState([]);
  
  useEffect(() => {
  const fetchReturned = async () => {
    try {
      if (activeAction !== "returned") return;

      let q;

      if (
  !branchToUse ||
  branchToUse === "all" ||
  branchToUse === "All Branches"
) {
        q = query(collection(db, "returned_items"));
      } else {
        q = query(
          collection(db, "returned_items"),
          where("branchId", "==", branchToUse)
        );
      }

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReturnedItems(data);

    } catch (err) {
      console.error(err);
    }
  };

  fetchReturned();
}, [activeAction, branchToUse]);

  const [branches, setBranches] = useState([]);
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState(0);

  // 📥 تحميل الفروع
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
useEffect(() => {
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setProducts(data);
  };

  fetchProducts();
}, []);
  // 🔄 Transfer Logic
  const handleTransfer = async () => {
    if (!fromBranch || !toBranch || !productName || !qty) {
      alert("كمل البيانات ❗");
      return;
    }

    if (fromBranch === toBranch) {
      alert("مينفعش تحول لنفس الفرع ❌");
      return;
    }

    try {
      const qFrom = query(
        collection(db, "products"),
        where("branchId", "==", fromBranch),
        where("name", "==", productName.trim())
      );

      const qTo = query(
        collection(db, "products"),
        where("branchId", "==", toBranch),
        where("name", "==", productName.trim())
      );

      const fromSnap = await getDocs(qFrom);
      const toSnap = await getDocs(qTo);

      if (fromSnap.empty || toSnap.empty) {
        alert("المنتج مش موجود ❌");
        return;
      }

      const fromRef = doc(db, "products", fromSnap.docs[0].id);
      const toRef = doc(db, "products", toSnap.docs[0].id);

      await runTransaction(db, async (transaction) => {
        const fromData = (await transaction.get(fromRef)).data();
        const toData = (await transaction.get(toRef)).data();

        if (fromData.quantity < qty) {
          throw new Error("المخزون مش كفاية ❌");
        }

        transaction.update(fromRef, {
          quantity: fromData.quantity - qty
        });

        transaction.update(toRef, {
          quantity: toData.quantity + qty
        });
      });

      alert("تم التحويل 🔥");

      // 🔄 reset
      setFromBranch("");
      setToBranch("");
      setProductName("");
      setQty(0);

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  
  const handleResell = async (item) => {
  try {
    await addDoc(collection(db, "sales"), {
      items: [item],
      total: item.price,
      branchId: item.branchId,
      createdAt: new Date(),
      source: "resell"
    });

    await updateDoc(doc(db, "returned_items", item.id), {
      status: "sold"
    });

    setReturnedItems(prev => prev.filter(i => i.id !== item.id));
    alert("تم إعادة البيع 🔥");

  } catch (err) {
    console.error(err);
  }
};
  const handlePurchase = async (productId, quantity) => {
  if (!productId || !quantity) {
    alert("كمل البيانات ❗");
    return;
  }

  try {
    const inventoryRef = doc(
      db,
      "inventory",
      `${branchToUse}_${productId}`
    );

    await runTransaction(db, async (transaction) => {
      const invSnap = await transaction.get(inventoryRef);

      const currentQty = invSnap.exists()
        ? invSnap.data().quantity || 0
        : 0;

      // ✅ زود inventory
      transaction.set(
        inventoryRef,
        {
          branchId: branchToUse,
          productId,
          quantity: currentQty + quantity
        },
        { merge: true }
      );
    });

    // ✅ سجل في stock
    await addDoc(collection(db, "stock"), {
      productId,
      quantity,
      type: "purchase",
      branchId: branchToUse,
      createdAt: new Date()
    });

    alert("تمت عملية الشراء 🔥");

  } catch (err) {
    console.error(err);
    alert("حصل خطأ ❌");
  }
};

  return (
    <div style={{
    padding: "30px",
    maxWidth: "900px",
    margin: "auto"
  }}>
      <h1>Operations ⚙️</h1>

      <div
  style={{
    background: "#ffffff",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginTop: "20px"
  }}
>
        <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",gap: "20px",
  marginTop: "20px"
}}>
  <button
  onClick={() => setActiveAction("transfer")}
  style={{
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: activeAction === "transfer" ? "#3b82f6" : "#f3f4f6",
    color: activeAction === "transfer" ? "#fff" : "#000",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  🔄 Transfer
</button>
<button
  onClick={() => setActiveAction("refund")}
  style={{
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: activeAction === "refund" ? "#3b82f6" : "#f3f4f6",
    color: activeAction === "refund" ? "#fff" : "#000",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  💸 Refund
</button>
<button
  onClick={() => setActiveAction("exchange")}
  style={{
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: activeAction === "exchange" ? "#3b82f6" : "#f3f4f6",
    color: activeAction === "exchange" ? "#fff" : "#000",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  🔁 Exchange
</button>
<button
  onClick={() => setActiveAction("returned")}
  style={{
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: activeAction === "returned" ? "#3b82f6" : "#f3f4f6",
    color: activeAction === "returned" ? "#fff" : "#000",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  📦 Returned Items
</button>

</div>
    {activeAction === "transfer" && (
  <div style={{
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "15px",
    marginTop: "20px"
  }}>
    <h3>Transfer Stock 🔄</h3>

    <select value={fromBranch} onChange={(e) => setFromBranch(e.target.value)}>
      <option value="">From Branch</option>
      {branches.map(b => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>

    <select value={toBranch} onChange={(e) => setToBranch(e.target.value)}>
      <option value="">To Branch</option>
      {branches.map(b => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>

    <input
      placeholder="Product Name"
      value={productName}
      onChange={(e) => setProductName(e.target.value)}
    />

    <input
      type="number"
      placeholder="Quantity"
      value={qty}
      onChange={(e) => setQty(Number(e.target.value))}
    />

    <button onClick={handleTransfer}>Transfer</button>
  </div>
)}
 
    {activeAction === "returned" && (
  <div style={{
    marginTop: "20px",
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "15px"
  }}>
    <h3>Returned Items 📦</h3>

    {returnedItems.length === 0 && (
      <p style={{ marginTop: "10px" }}>
        مفيش منتجات مرتجعة حالياً
      </p>
    )}

    {returnedItems.map(item => (
      <div key={item.id} style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#ffffff",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
}}>
        <span>{item.name}</span>
        <span>{item.size}</span>
        <span>{item.price} EGP</span>

        <button
  onClick={() => handleResell(item)}
  style={{
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Resell
</button>
      </div>
    ))}
  </div>
)}
    </div>
  </div>
);
}