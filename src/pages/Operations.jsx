import { addDoc } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  runTransaction,
  query
} from "firebase/firestore";
import { useApp } from "../store/useApp";
import { getDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useTranslate } from "../useTranslate";
import { serverTimestamp } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
export default function Operations() {
const [selectedActivity, setSelectedActivity] = useState(null);
const t = useTranslate();
const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);

useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("user"));
  if (stored) setUser(stored);
}, []);
const { selectedBranch } = useApp();

  const [activeAction, setActiveAction] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
 

  const [branches, setBranches] = useState([]);
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [productId, setProductId] = useState("");
  const [availableQty, setAvailableQty] = useState(0);

  const [adjustBranch, setAdjustBranch] = useState("");
  const [adjustProduct, setAdjustProduct] = useState("");
  const [adjustType, setAdjustType] = useState("increase"); // increase / decrease
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustments, setAdjustments] = useState([]);
  const [adjustAvailableQty, setAdjustAvailableQty] = useState(0);


  useEffect(() => {
  const fetchQty = async () => {
    if (!fromBranch || !productId) {
      setAvailableQty(0);
      return;
    }

    try {
      const ref = doc(db, "inventory", `${fromBranch}_${productId}`);
      const docSnap = await getDoc(ref);

      if (docSnap.exists()) {
        setAvailableQty(docSnap.data().quantity || 0);
      } else {
        setAvailableQty(0);
      }

    } catch (err) {
      console.error(err);
    }
  };

  fetchQty();
}, [fromBranch, productId]);
useEffect(() => {
  const fetchAdjustQty = async () => {
    if (!adjustBranch || !adjustProduct) {
      setAdjustAvailableQty(0);
      return;
    }

    try {
      const ref = doc(db, "inventory", `${adjustBranch}_${adjustProduct}`);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setAdjustAvailableQty(snap.data().quantity || 0);
      } else {
        setAdjustAvailableQty(0);
      }

    } catch (err) {
      console.error(err);
    }
  };

  fetchAdjustQty();
}, [adjustBranch, adjustProduct]);
  const [qty, setQty] = useState("");
  const [transfers, setTransfers] = useState([]);
  useEffect(() => {
  const fetchTransfers = async () => {
    try {
      const snapshot = await getDocs(
  query(collection(db, "transfers"))
);

  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // 🔥 sort هنا
  data.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA;
  });

  setTransfers(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchTransfers();
}, []);
useEffect(() => {
  const fetchAdjustments = async () => {
    try {
      const snapshot = await getDocs(collection(db, "adjustments"));

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAdjustments(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchAdjustments();
}, []);

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
useEffect(() => {
  setQty("");
}, [productId, fromBranch]);
const [search, setSearch] = useState("");
const [filterBranch, setFilterBranch] = useState(""); 
useEffect(() => {
  if (!search) setFilterBranch("");
}, [search]);
useEffect(() => {
  setFilterBranch("");
}, [fromBranch, toBranch]);


  // 🔄 Transfer Logic
  const handleTransfer = async () => {
  if (!fromBranch || !toBranch || !productId || Number(qty) <= 0) {
    toast.error(t("common.error"));
    return;
  }

  if (fromBranch === toBranch) {
   toast.error(t("operations.sameBranch"));
    return;
  }
  setTransferLoading(true);
  try {
    const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
    const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

    await runTransaction(db, async (transaction) => {
      const fromSnap = await transaction.get(fromRef);
      const toSnap = await transaction.get(toRef);

      const fromQty = fromSnap.exists()
        ? fromSnap.data().quantity || 0
        : 0;

      const toQty = toSnap.exists()
        ? toSnap.data().quantity || 0
        : 0;

      if (fromQty < Number(qty)) {
        throw new Error(t("operations.notEnoughStock"));
      }

      // ➖ خصم
      transaction.set(
        fromRef,
        {
          branchId: fromBranch,
          productId,
          quantity: fromQty - Number(qty)
        },
        { merge: true }
      );

      // ➕ إضافة
      transaction.set(
        toRef,
        {
          branchId: toBranch,
          productId,
          quantity: toQty + Number(qty)
        },
        { merge: true }
      );
    });
    const docRef = await addDoc(collection(db, "transfers"), {
  fromBranch,
  toBranch,
  productId,
  qty: Number(qty),
  user: user?.name || "unknown",
  createdAt: serverTimestamp(),
  reversed: false
});
setTransfers(prev => [
  {
    id: docRef.id, // 🔥 الصح
    fromBranch,
    toBranch,
    productId,
    qty: Number(qty),
    user: user?.name || "unknown",
    createdAt: new Date(),
    reversed: false
  },
  ...prev
]);

    toast.success(t("operations.transferSuccess"));
    setTransferLoading(false);;
    setFromBranch("");
    setToBranch("");
    setProductId("");
    setQty("");
    setActiveAction(null);

  } catch (err) {
    console.error(err);
    toast.error(err.message);
    setTransferLoading(false);
  }
};
const handleDelete = async () => {
  if (!selectedActivity) return;
  const oldData = selectedActivity;

  // 🔥 ADD HERE
  if (oldData.reversed) {
    toast.error("Already reversed");
    return;
  }

  

  try {
    if (oldData.actionType === "transfer") {
      const { fromBranch, toBranch, productId } = oldData;
const amount = Number(oldData.qty);

      const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
      const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

      await runTransaction(db, async (transaction) => {
        const fromSnap = await transaction.get(fromRef);
        const toSnap = await transaction.get(toRef);

        const fromQty = fromSnap.exists() ? fromSnap.data().quantity || 0 : 0;
        const toQty = toSnap.exists() ? toSnap.data().quantity || 0 : 0;

        // 🔥 reverse
        transaction.set(fromRef, {
          quantity: fromQty + amount
        }, { merge: true });

        if (toQty - amount < 0) {
          throw new Error("Invalid inventory state");
        }

      transaction.set(toRef, {
        quantity: toQty - amount
      }, { merge: true });
      });
    }

    if (oldData.actionType === "adjust") {
      const { branchId, productId, qty, adjustType } = oldData;

      const ref = doc(db, "inventory", `${branchId}_${productId}`);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        const currentQty = snap.exists() ? snap.data().quantity || 0 : 0;

        let newQty =
        adjustType === "increase"
          ? currentQty - qty
          : currentQty + qty;

      if (newQty < 0) {
        throw new Error("Invalid inventory state");
      }

        transaction.set(ref, {
          quantity: newQty
        }, { merge: true });
      });
    }

    // 🔥 بعد ما رجعنا inventory
    const collectionName =
      oldData.actionType === "transfer"
        ? "transfers"
        : "adjustments";

    await updateDoc(doc(db, collectionName, oldData.id), {
      reversed: true
    });

    toast.success(t("common.deleted"));
    setSelectedActivity(null);
    setIsEditing(false);
    setEditData(null);
      

  } catch (err) {
    console.error(err);
    toast.error(err.message || t("common.error"));
  }
};
  const branchKeyMap = {
  "Abbas Akkad 1": "abbasAkkad1",
  "Abbas Akkad 2": "abbasAkkad2",
  "Abbas Akkad 3": "abbasAkkad3",
  "City Stars": "cityStars",
  "El Obour": "elObour",
  "El Rehab": "elRehab"
};


const productMap = useMemo(
  () => Object.fromEntries(products.map(p => [p.id, p.name])),
  [products]
);
const branchMap = useMemo(
  () => Object.fromEntries(branches.map(b => [b.id, b.name])),
  [branches]
);

const getBranchName = (id) => {
  if (!id) return "";

  const name = branchMap[id] || id;
  const key = branchKeyMap[name];

  return key ? t(`branches.${key}`) : name;
};
  
const allActivities = useMemo(() => {
  const combined = [
    ...transfers.map(t => ({ ...t, actionType: "transfer" })),
    ...adjustments.map(a => ({ ...a, actionType: "adjust" }))
  ];

  return combined
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
}, [transfers, adjustments]);
const filteredActivities = allActivities.filter(item => {
  const productName =
  (productMap[item.productId] || item.productId).toLowerCase();
  

  

const branchName =
  getBranchName(item.fromBranch) ||
  getBranchName(item.toBranch) ||
  getBranchName(item.branchId) ||
  "";

  const searchValue = search.toLowerCase().trim();

  const matchesSearch =
    productName.includes(searchValue) ||
    (branchName || "").toLowerCase().includes(searchValue);

  const matchesFilter =
    !filterBranch ||
    item.fromBranch === filterBranch ||
    item.toBranch === filterBranch ||
    item.branchId === filterBranch;

  return matchesSearch && matchesFilter;
});

const handleUndo = async () => {
  if (!selectedActivity) return;

  const oldData = selectedActivity;

  // 🔥 ADD HERE
  if (oldData.reversed) {
    toast.error("Already reversed");
    return;
  }

  try {
    if (oldData.actionType === "transfer") {
      const { fromBranch, toBranch, productId } = oldData;
const amount = Number(oldData.qty);

      const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
      const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

      await runTransaction(db, async (t) => {
        const fromSnap = await t.get(fromRef);
        const toSnap = await t.get(toRef);

        const fromQty = fromSnap.exists() ? fromSnap.data().quantity || 0 : 0;
        const toQty = toSnap.exists() ? toSnap.data().quantity || 0 : 0;

        t.set(fromRef, { quantity: fromQty + amount }, { merge: true });
        if (toQty - amount < 0) {
          throw new Error("Invalid inventory state");
        }

t.set(toRef, { quantity: toQty - amount }, { merge: true });
      });
    }

    if (oldData.actionType === "adjust") {
      const { branchId, productId, qty, adjustType } = oldData;

      const ref = doc(db, "inventory", `${branchId}_${productId}`);

      await runTransaction(db, async (t) => {
        const snap = await t.get(ref);
        const currentQty = snap.exists() ? snap.data().quantity || 0 : 0;

        let newQty =
        adjustType === "increase"
          ? currentQty - qty
          : currentQty + qty;

      if (newQty < 0) {
        throw new Error("Invalid inventory state");
      }

        t.set(ref, { quantity: newQty }, { merge: true });
      });
    }

    // 🔥 بدل delete → mark reversed
    const collectionName =
      oldData.actionType === "transfer"
        ? "transfers"
        : "adjustments";

    await updateDoc(doc(db, collectionName, oldData.id), {
      reversed: true
    });

    toast.success(t("operations.undoSuccess"));
    setSelectedActivity(null);

  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
};

const handleAdjust = async () => {
  if (!adjustBranch || !adjustProduct || Number(adjustQty) <= 0) {
    toast.error(t("common.error"));
    return;
  }
  setAdjustLoading(true);
  try {
    const ref = doc(db, "inventory", `${adjustBranch}_${adjustProduct}`);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);

      const currentQty = snap.exists()
        ? snap.data().quantity || 0
        : 0;

      let newQty;

      if (adjustType === "increase") {
        newQty = currentQty + Number(adjustQty);
      } else {
        if (Number(adjustQty) > currentQty) {
          throw new Error(t("operations.notEnoughStock"));
        }
        newQty = currentQty - Number(adjustQty);
      }

      transaction.set(ref, {
        branchId: adjustBranch,
        productId: adjustProduct,
        quantity: newQty
      }, { merge: true });
    });

    const docRef = await addDoc(collection(db, "adjustments"), {
  branchId: adjustBranch,
  productId: adjustProduct,
  adjustType,
  qty: Number(adjustQty),
  reason: adjustReason,
  user: user?.name || "unknown",
  createdAt: serverTimestamp(),
  reversed: false
});
    setAdjustments(prev => [
  {
    id: docRef.id, // 🔥 الصح
    branchId: adjustBranch,
    productId: adjustProduct,
    adjustType,
    qty: Number(adjustQty),
    reason: adjustReason,
    user: user?.name || "unknown",
    createdAt: new Date(),
    reversed: false
  },
  ...prev
]);

    toast.success(t("common.save"));

    setAdjustBranch("");
    setAdjustProduct("");
    setAdjustQty("");
    setAdjustReason("");
    setAdjustType("increase");
    setActiveAction(null);
    setAdjustLoading(false);

  } catch (err) {
    console.error(err);
    toast.error(err.message);
    setAdjustLoading(false);
  }
};

const branchOrder = [
  "abbasAkkad1",
  "abbasAkkad2",
  "abbasAkkad3",
  "cityStars",
  "elObour",
  "elRehab"
];

const sortedBranches = useMemo(() => {
  const orderMap = Object.fromEntries(
    branchOrder.map((id, index) => [id, index])
  );

  return [...branches].sort((a, b) => {
    const keyA = branchKeyMap[a.name]; // 🔥 المهم
    const keyB = branchKeyMap[b.name];

    const indexA = orderMap[keyA] ?? 999;
    const indexB = orderMap[keyB] ?? 999;

    return indexA - indexB;
  });
}, [branches]);

const handleEditSave = async () => {
  if (selectedActivity?.reversed) {
  toast.error("Already reversed");
  return;
}
  const oldData = selectedActivity;
  if (!editData) return;

  try {
    // 🔴 1) reverse القديم
    if (editData.actionType === "transfer") {
      const { fromBranch, toBranch, productId, qty } = oldData;

      const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
      const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

      await runTransaction(db, async (t) => {
        const fromSnap = await t.get(fromRef);
        const toSnap = await t.get(toRef);

        const fromQty = fromSnap.exists()
  ? fromSnap.data().quantity || 0
  : 0;
        const toQty = toSnap.exists()
        ? toSnap.data().quantity || 0
        : 0;

        t.set(fromRef, { quantity: fromQty + qty }, { merge: true });
        if (toQty - qty < 0) {
  throw new Error("Invalid reverse transfer");
}

t.set(toRef, { quantity: toQty - qty }, { merge: true });
      });
    }

    if (editData.actionType === "adjust") {
      const { branchId, productId, qty, adjustType } = oldData;

      const ref = doc(db, "inventory", `${branchId}_${productId}`);

      await runTransaction(db, async (t) => {
        const snap = await t.get(ref);
        const currentQty = snap.exists()
  ? snap.data().quantity || 0
  : 0;

        let reversed =
        adjustType === "increase"
          ? currentQty - qty
          : currentQty + qty;

      if (reversed < 0) {
        throw new Error("Invalid reverse operation");
      }

      t.set(ref, { quantity: reversed }, { merge: true });
      });
    }

    // 🟢 2) apply الجديد
    if (editData.actionType === "transfer") {
      const { fromBranch, toBranch, productId, qty } = editData;

      const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
      const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

      await runTransaction(db, async (t) => {
        const fromSnap = await t.get(fromRef);
        const toSnap = await t.get(toRef);

        const fromQty = fromSnap.exists()
        ? fromSnap.data().quantity || 0
        : 0;
        const toQty = toSnap.exists()
        ? toSnap.data().quantity || 0
        : 0;

        const amount = Number(qty);

        if (fromQty < amount) throw new Error("Not enough stock");

        t.set(fromRef, { quantity: fromQty - amount }, { merge: true });
        t.set(toRef, { quantity: toQty + amount }, { merge: true });
      });
    }

    if (editData.actionType === "adjust") {
  const { branchId, productId, qty, adjustType } = editData;

  const ref = doc(db, "inventory", `${branchId}_${productId}`);

  await runTransaction(db, async (t) => {
    const snap = await t.get(ref);
    const currentQty = snap.exists()
      ? snap.data().quantity || 0
      : 0;

    if (adjustType === "decrease" && Number(qty) > currentQty) {
      throw new Error("Not enough stock");
    }

    let newQty =
      adjustType === "increase"
        ? currentQty + Number(qty)
        : currentQty - Number(qty);

    if (newQty < 0) {
      throw new Error("Invalid quantity");
    }

    t.set(ref, { quantity: newQty }, { merge: true });
  });
}

    // 🔥 3) update document
    const collectionName =
      editData.actionType === "transfer"
        ? "transfers"
        : "adjustments";

    const { actionType, ...cleanData } = editData;

    await updateDoc(
      doc(db, collectionName, oldData.id),
      cleanData
    );

    toast.success(t("common.updated"));
    setIsEditing(false);
    setSelectedActivity(null);
    setEditData(null);

  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
};


  return (
    <>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "10px",
          fontSize: "14px"
        }
      }}
    />
    <div style={{
    padding: "30px",
    maxWidth: "900px",
    margin: "auto"
  }}>
      <h1 style={{
        fontSize: "24px",
        fontWeight: "700",
        marginBottom: "10px",
        color: "#111827" // 👈 ضيف دي
      }}>
        {t("operations.title")} ⚙️
      </h1>

      <div
  style={{
    background: "#ffffff",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  }}
>
        <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",gap: "20px",
  marginTop: "20px"
}}>
  <button
  onClick={() =>
    setActiveAction(prev =>
      prev === "transfer" ? null : "transfer"
    )
  }
  style={{
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: activeAction === "transfer" ? "#3b82f6" : "#f3f4f6",
    color: activeAction === "transfer" ? "#fff" : "#000",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
    transition: "0.2s",
    transform: activeAction === "transfer" ? "scale(1.02)" : "scale(1)",
  }}
>
  🔄 {t("operations.transfer")}
</button>

<button
  onClick={() =>
    setActiveAction(prev =>
      prev === "adjust" ? null : "adjust"
    )
  }
  style={{
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: activeAction === "adjust" ? "#10b981" : "#f3f4f6",
    color: activeAction === "adjust" ? "#fff" : "#000",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
    transition: "0.2s",
    transform: activeAction === "adjust" ? "scale(1.02)" : "scale(1)",
  }}
>
  ⚖️ {t("operations.adjust")}
</button>



</div>
    <div
  style={{
    maxHeight: activeAction === "transfer" ? "1000px" : "0px",
    opacity: activeAction === "transfer" ? 1 : 0,
    transform: activeAction === "transfer" ? "translateY(0)" : "translateY(-10px)",
    overflow: "hidden",
    transition: "max-height 0.35s ease, opacity 0.25s ease, transform 0.3s ease"
  }}
>
  <div style={{
  background: "#ffffff",
  padding: "25px",
  borderRadius: "20px",
  marginTop: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  border: "1px solid #f1f5f9" // 👈 ضيف دي
}}>
    <h3 style={{ marginBottom: "10px" }}>
      {t("operations.transfer")} 🔄
    </h3>
<div style={{
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "15px"
}}>
    <label style={{ fontWeight: "600", fontSize: "14px" }}>
  {t("operations.fromBranch")}
</label>
<select
  value={fromBranch}
  onChange={(e) => setFromBranch(e.target.value)}
  style={{
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px"
  }}
>
  <option value="">{t("operations.fromBranch")}</option>
  {sortedBranches.map(b => {
  
  
  return (
    <option key={b.id} value={b.id}>
  {getBranchName(b.id)}
</option>
  );
})}
</select>

<label style={{ fontWeight: "600", fontSize: "14px" }}>
  {t("operations.toBranch")}
  </label>
<select
  value={toBranch}
  onChange={(e) => setToBranch(e.target.value)}
  style={{
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px"
  }}
>
  <option value="">{t("operations.toBranch")}</option>
  {sortedBranches.map(b => (
  <option key={b.id} value={b.id}>
    {getBranchName(b.id)}
  </option>
))}
</select>
<label style={{ fontWeight: "600", fontSize: "14px" }}>
  {t("operations.selectProduct")}
</label>
    <select
  value={productId}
  onChange={(e) => setProductId(e.target.value)}
  style={{
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px"
  }}
>

  <option value="">{t("operations.selectProduct")}</option>
  {products.map(p => (
    <option key={p.id} value={p.id}>
      {p.name}
    </option>
  ))}
</select>
<p style={{
  background: "#eef2ff",
  padding: "10px",
  borderRadius: "10px",
  fontWeight: "600"
}}>
  {t("operations.available")}: {availableQty}
</p>

    <input
  type="number"
  min="1"
  max={availableQty}
  placeholder={t("operations.quantity")}
  value={qty}
  onChange={(e) => {
  const val = e.target.value;
  if (val === "" || Number(val) <= availableQty) {
    setQty(val);
  }
}}
  style={{
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",outline: "none",
    
  }}
  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px #3b82f6"}
onBlur={(e) => e.target.style.boxShadow = "none"}
/>
{Number(qty) > availableQty && (
  <p style={{ color: "red", marginTop: "5px" }}>
    {t("operations.exceedStock")} ❌
  </p>
)}

    <button
  onClick={handleTransfer}
  disabled={
    transferLoading ||
    !fromBranch ||
    !toBranch ||
    !productId ||
    Number(qty) <= 0 ||
    Number(qty) > availableQty  }
  style={{
    width: "100%",
    boxShadow: "0 4px 10px rgba(59,130,246,0.3)",
    marginTop: "10px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background:
      (transferLoading || !fromBranch || !toBranch || !productId || Number(qty) <= 0 || Number(qty) > availableQty)
        ? "#9ca3af"
        : "#3b82f6",
    color: "#fff",
    fontWeight: "600",
    fontSize: "15px",
    transition: "0.2s",
    opacity: transferLoading ? 0.7 : 1,
    cursor: transferLoading ? "wait" : "pointer",
  }}
>
  {transferLoading ? t("operations.loadingTransfer") : "🔄 " + t("operations.transfer")}
</button>
  </div>
  </div>
  
</div>
<div
  style={{
    maxHeight: activeAction === "adjust" ? "1000px" : "0px",
    opacity: activeAction === "adjust" ? 1 : 0,
    transform: activeAction === "adjust" ? "translateY(0)" : "translateY(-10px)",
    overflow: "hidden",
    transition: "max-height 0.35s ease, opacity 0.25s ease, transform 0.3s ease"
  }}
>
  <div style={{
    background: "#ffffff",
    padding: "25px",
    borderRadius: "20px",
    marginTop: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9"
  }}>
    <h3>{t("operations.adjust")} ⚖️</h3>

    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      marginTop: "15px"
    }}>

      {/* Branch */}
      <select
        value={adjustBranch}
        onChange={(e) => setAdjustBranch(e.target.value)}
        style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
      >
        <option value="">{t("branches.select")}</option>
        {sortedBranches.map(b => (
  <option key={b.id} value={b.id}>
    {getBranchName(b.id)}
  </option>
))}
      </select>

      {/* Product */}
      <select
        value={adjustProduct}
        onChange={(e) => setAdjustProduct(e.target.value)}
        style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
      >
        <option value="">{t("operations.selectProduct")}</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <p style={{
  background: "#ecfdf5",
  padding: "10px",
  borderRadius: "10px",
  fontWeight: "600"
}}>
  {t("operations.available")}: {adjustAvailableQty}
</p>

      {/* Type */}
      <select
        value={adjustType}
        onChange={(e) => setAdjustType(e.target.value)}
        style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
      >
        <option value="increase">
          {t("operations.increase")} ➕
          </option>

          <option value="decrease">
            {t("operations.decrease")} ➖
          </option>
      </select>

      {/* Quantity */}
      <input
        type="number"
        value={adjustQty}
        onChange={(e) => {
  const val = e.target.value;
  if (
    val === "" ||
    adjustType === "increase" ||
    Number(val) <= adjustAvailableQty
  ) {
    setAdjustQty(val);
  }
}}
        placeholder={t("operations.quantity")}
        style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
      />
      {adjustType === "decrease" && Number(adjustQty) > adjustAvailableQty && (
      <p style={{ color: "red", marginTop: "5px" }}>
        {t("operations.exceedStock")} ❌
      </p>
    )}

      {/* Reason */}
      <input
        type="text"
        value={adjustReason}
        onChange={(e) => setAdjustReason(e.target.value)}
        placeholder={t("operations.reason")}
        style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
      />

      <button
  onClick={handleAdjust}
  disabled={
    adjustLoading ||
    !adjustBranch ||
    !adjustProduct ||
    Number(adjustQty) <= 0 ||
    (adjustType === "decrease" && Number(adjustQty) > adjustAvailableQty)
  }
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background:
      (adjustLoading || !adjustBranch || !adjustProduct || Number(adjustQty) <= 0 ||
       (adjustType === "decrease" && Number(adjustQty) > adjustAvailableQty))
        ? "#9ca3af"
        : "#10b981",
    color: "#fff",
    fontWeight: "600",
    transition: "0.2s",
    opacity: adjustLoading ? 0.7 : 1,
cursor: adjustLoading ? "wait" : "pointer",
  }}
>
  {adjustLoading
  ? t("operations.loadingAdjust")
  : "⚖️ " + t("operations.adjust")}
</button>

    </div>
  </div>
</div>
<div style={{
  background: "#fff",
  padding: "20px",
  borderRadius: "15px",
  marginTop: "25px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  border: "1px solid #f1f5f9" // 👈 ضيف دي
}}>
<input
  type="text"
  placeholder={t("common.search")}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    
  }}
  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px #3b82f6"}
onBlur={(e) => e.target.style.boxShadow = "none"}
/>
<select
  value={filterBranch}
  onChange={(e) => setFilterBranch(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
  }}
>
  <option value="">{t("branches.all")}</option>
  {sortedBranches.map(b => (
  <option key={b.id} value={b.id}>
    {getBranchName(b.id)}
  </option>
))}
</select>
</div>
<div style={{ marginTop: "30px" }}>
  <h3 style={{ marginTop: "30px",
               fontSize: "18px",
               fontWeight: "700", }}>
  {t("operations.activityLog")} 📊
</h3>

  {filteredActivities.map(item => (
    <div
  key={item.id}
  onClick={() => setSelectedActivity(item)}
  style={{
    background: "#fff",
    padding: "15px",
    border: "1px solid #f1f5f9",
    marginBottom: "10px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    transition: "0.2s",
    cursor: "pointer",
  }}
>
  <p style={{ marginBottom: "5px", fontWeight: "600" }}>
  {item.actionType === "transfer"
    ? "🔄 " + t("operations.transfer")
    : "⚖️ " + t("operations.adjust")}
</p>

{/* 🔥 ADD HERE */}
{item.reversed && (
  <span style={{
  color: "#ef4444",
  fontWeight: "700",
  fontSize: "12px",
  background: "#fee2e2",
  padding: "3px 8px",
  borderRadius: "8px",
  marginLeft: "8px"
}}>
  REVERSED
</span>
)}

  <p>
    <strong>{t("operations.product")}:</strong> {productMap[item.productId] || item.productId}
  </p>

  {item.actionType === "transfer" && (
    <>
      <p>
  {t("operations.fromBranch")}: {getBranchName(item.fromBranch)}
</p>

<p>
  {t("operations.toBranch")}: {getBranchName(item.toBranch)}
</p>
    </>
  )}

  {item.actionType === "adjust" && (
    <>
      <p>
  {t("branches.single")}: {getBranchName(item.branchId)}
</p>
      <p>
  <strong>{t("operations.type")}:</strong>{" "}
  {(item.adjustType || item.type) === "increase"
    ? `${t("operations.increase")} ➕`
    : `${t("operations.decrease")} ➖`}
</p>
      {item.reason && <p><strong>{t("operations.reason")}:</strong> {item.reason}</p>}
    </>
  )}

  <p style={{ fontWeight: "700", color: "#3b82f6" }}>
    {t("common.qty")}: {item.qty}
  </p>

  <p><strong>{t("users.title")}:</strong> {item.user}</p>

  <p style={{ fontSize: "13px", color: "#6b7280" }}>
    {item.createdAt?.toDate
      ? new Date(item.createdAt.toDate()).toLocaleString()
      : new Date(item.createdAt).toLocaleString()}
  </p>
</div>
  ))}
  {filteredActivities.length === 0 && (
  <p style={{ textAlign: "center", marginTop: "20px" }}>
    {t("operations.noResults")} ❌
  </p>
)}
</div>

 
    
    
  </div>
  
</div>
{selectedActivity && (
  <div
    onClick={() => setSelectedActivity(null)}
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
  onClick={(e) => e.stopPropagation()}
  style={{
    background: "#fff",
    padding: "25px",
    borderRadius: "20px",
    width: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.2s ease"
  }}
>
      <h3 style={{
  marginBottom: "15px",
  fontSize: "18px",
  fontWeight: "700"
}}>
  {selectedActivity.actionType === "transfer"
    ? "🔄 " + t("operations.transfer")
    : "⚖️ " + t("operations.adjust")}
</h3>

      <p style={{ marginBottom: "8px" }}>
  <strong>{t("operations.product")}:</strong>{" "}
  {productMap[selectedActivity.productId] || selectedActivity.productId}
</p>

{selectedActivity.actionType === "transfer" && (
  <>
    <p style={{ marginBottom: "8px" }}>
  {t("operations.fromBranch")}:
      {getBranchName(selectedActivity.fromBranch)}
    </p>

    <p style={{ marginBottom: "8px" }}>
  {t("operations.toBranch")}:
      {getBranchName(selectedActivity.toBranch)}
    </p>
  </>
)}

{selectedActivity.actionType === "adjust" && (
  <>
    <p style={{ marginBottom: "8px" }}>
  {t("branches.single")}: {getBranchName(selectedActivity.branchId)}
</p>

    <p style={{ marginBottom: "8px" }}>
      {(selectedActivity.adjustType === "increase"
        ? t("operations.increase")
        : t("operations.decrease"))}
    </p>

    {selectedActivity.reason && (
      <p style={{ marginBottom: "8px" }}>
        {t("operations.reason")}: {selectedActivity.reason}
      </p>
    )}
  </>
)}

<p style={{ marginBottom: "8px" }}>
  <strong>{t("common.qty")}:</strong> {selectedActivity.qty}
</p>

<p style={{ marginBottom: "8px" }}>
  <strong>{t("users.title")}:</strong> {selectedActivity.user}
</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
  <button
    onClick={() => setSelectedActivity(null)}
    style={{
      flex: 1,
      padding: "12px",
      borderRadius: "10px",
      border: "none",
      background: "#e5e7eb",
      cursor: "pointer"
    }}
  >
    {t("common.close")}
  </button>

  <button
  onClick={handleDelete}
  disabled={selectedActivity.reversed}
    style={{
      flex: 1,
      padding: "12px",
      borderRadius: "10px",
      border: "none",
      background: "#ef4444",
      color: "#fff",
      cursor: "pointer"
    }}
  >
      🗑 Delete
  </button>
  
</div>
<button
  onClick={handleUndo}
  disabled={selectedActivity.reversed}
  style={{
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer"
  }}
>
  ⏪ {t("operations.undo")}
</button>
<button
  onClick={() => {
  setEditData({ ...selectedActivity });
  setIsEditing(true);
}}
 disabled={selectedActivity.reversed}
  style={{
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    cursor: "pointer"
  }}
>
  ✏️ Edit
</button>
{isEditing && editData && (
  <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
    
    <input
      type="number"
      value={editData.qty}
      onChange={(e) => {
        const val = Number(e.target.value);
        if (val > 0) {
          setEditData(prev => ({ ...prev, qty: val }));
        }
      }}
      placeholder="Quantity"
      style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
    />

    {editData.actionType === "adjust" && (
      <select
        value={editData.adjustType}
        onChange={(e) =>
          setEditData(prev => ({ ...prev, adjustType: e.target.value }))
        }
      >
        <option value="increase">Increase</option>
        <option value="decrease">Decrease</option>
      </select>
    )}

    <button
      onClick={handleEditSave}
      style={{
        padding: "12px",
        borderRadius: "10px",
        border: "none",
        background: "#3b82f6",
        color: "#fff"
      }}
    >
      💾 Save
    </button>
  </div>
)}
    </div>
  </div>
)}
  </>
);
}
