import { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  increment,
  addDoc,
  getDocs,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { useTranslate } from "../useTranslate";
export default function Waste() {
  const t = useTranslate();
  const { user } = useAuth();
  const { selectedBranch } = useApp();

  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [items, setItems] = useState([{ productId: "", quantity: "" }]);
  const [note, setNote] = useState("");
  const [wasteList, setWasteList] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  const branchToUse =
    user?.role === "admin" ? selectedBranch : user?.branchId;

  // 🟢 Fetch Products
  

  // 🟢 Realtime Stock
  useEffect(() => {
    if (!branchToUse || branchToUse === "all") return;

    const q = query(
      collection(db, "stock"),
      where("branchId", "==", branchToUse)
    );

    const unsub = onSnapshot(q, (snap) => {
      const map = {};

      snap.docs.forEach((doc) => {
        const d = doc.data();

        if (d.type === "sale" || d.type === "waste") {
          map[d.productId] = (map[d.productId] || 0) - d.quantity;
        } else {
          map[d.productId] = (map[d.productId] || 0) + d.quantity;
        }
      });

      setStockMap(map);
    });

    return () => unsub();
  }, [branchToUse]);

  // 🟢 Realtime Waste History
  useEffect(() => {
    if (!branchToUse || branchToUse === "all") return;

    const q = query(
      collection(db, "stock"),
      where("branchId", "==", branchToUse)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((d) => d.type === "waste")
        .sort((a, b) => {
          const da = a.createdAt?.seconds || 0;
          const dbb = b.createdAt?.seconds || 0;
          return dbb - da;
        });

      setWasteList(data);
    });

    return () => unsub();
  }, [branchToUse]);

  // 🟢 Fetch Products (once)
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "products"));
      setProducts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      );
    };
    load();
  }, []);
  useEffect(() => {
  if (!showToast) return;

  const t = setTimeout(() => {
    setShowToast(false);
  }, 1500);

  return () => clearTimeout(t);
}, [showToast]);

  // ➕ Add Row
  const addRow = () => {
    setItems([...items, { productId: "", quantity: "" }]);
  };

  // ❌ Remove Row
  const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // 🔥 Submit Waste
  const handleWaste = async () => {
  if (!branchToUse || branchToUse === "all") {
    setToastText(t("branches.select"));
    setShowToast(true);
    return;
  }

  const validItems = items.filter(
    (i) => i.productId && Number(i.quantity) > 0
  );

  if (!validItems.length) {
    setToastText(t("waste.addItems"));
    setShowToast(true);
    return;
  }

  try {
    await runTransaction(db, async (transaction) => {

      for (const item of validItems) {

        const ref = doc(db, "inventory", `${branchToUse}_${item.productId}`);
        const snap = await transaction.get(ref);

        if (!snap.exists()) {
          throw new Error(t("waste.productNotFound"));
        }

        const current = snap.data().quantity || 0;

        if (Number(item.quantity) > current) {
          throw new Error(t("waste.qtyExceeded"));
        }

        transaction.update(ref, {
          quantity: increment(-Number(item.quantity))
        });

        
        
      }


    });
    for (const item of validItems) {
  await addDoc(collection(db, "stock"), {
    productId: item.productId,
    quantity: Number(item.quantity),
    branchId: branchToUse,
    type: "waste",
    note,
    createdAt: serverTimestamp(),
    userId: user.uid
  });
}

    setItems([{ productId: "", quantity: "" }]);
    setNote("");

    setToastText(t("waste.success"));
    setShowToast(true);

  } catch (err) {
    console.error(err);
    setToastText(err.message || t("common.error"));
    setShowToast(true);
  }
};

  return (
    <div
      style={{
        padding: "25px",
        background: theme.colors.background,
        minHeight: "100vh"
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>{t("navigation.waste")} ♻️</h1>

      {/* FORM */}
      <div
        style={{
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "20px"
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "10px"
            }}
          >
            <select
              value={item.productId}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i].productId = e.target.value;
                setItems(newItems);
              }}
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "10px",
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.card,
                color: theme.colors.text
              }}
            >
              <option value="">{t("products.select")}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({stockMap[p.id] || 0})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder={t("common.qty")}
              value={item.quantity}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i].quantity = e.target.value;
                setItems(newItems);
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.card,
                color: theme.colors.text
              }}
            />

            <button onClick={() => removeRow(i)}>❌</button>
          </div>
        ))}

        <button onClick={addRow} style={{ marginBottom: "10px" }}>
          + {t("waste.addItem")}
        </button>

        <textarea
          placeholder={t("waste.reason")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "10px"
          }}
        />

        <button
          onClick={handleWaste}
          style={{
            width: "100%",
            background: theme.colors.danger,
            color: "#fff",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer"
          }}
        >
          {t("waste.add")}
        </button>
      </div>

      {/* HISTORY */}
      <div>
        <h3>{t("waste.history")}</h3>

        {wasteList.map((w) => (
          <div
            key={w.id}
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "10px"
            }}
          >
            <div>
              {t("common.qty")}: {w.quantity} | {w.note || "—"}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.6 }}>
              {new Date(
                w.createdAt?.seconds
                  ? w.createdAt.seconds * 1000
                  : w.createdAt
              ).toLocaleString()}
            </div>
          </div>
        ))}
            </div>

      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            background: theme.colors.primary,
            padding: "12px 20px",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
          }}
        >
          {toastText}
        </div>
      )}

    </div>
  );
}