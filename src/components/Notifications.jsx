import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [hiddenIds, setHiddenIds] = useState([]); // 🧠 حل Clear All
  const dropdownRef = useRef(null);
  const prevCount = useRef(0);

  // 🔊 صوت
  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  // 🔔 Real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stock"), (snapshot) => {
      const processData = async () => {
        const stockMap = {};

        snapshot.forEach(doc => {
          const data = doc.data();

          if (data.type === "sale") {
            stockMap[data.productId] =
              (stockMap[data.productId] || 0) - data.quantity;
          } else {
            stockMap[data.productId] =
              (stockMap[data.productId] || 0) + data.quantity;
          }
        });

        const productsSnap = await getDocs(collection(db, "products"));

        let alerts = productsSnap.docs.map(doc => {
          const p = doc.data();
          const qty = stockMap[doc.id] || 0;

          return {
            id: doc.id,
            name: p.name,
            quantity: qty,
            category: p.category,
            subCategory: p.subCategory,
            read: false
          };
        });

        // ⚠️ فلترة
        alerts = alerts.filter(p => {
          if (p.quantity === 0) return true;

          if (
            p.category === "French" ||
            p.category?.includes("Oriental")
          ) {
            return p.quantity <= 80;
          }

          if (
            p.subCategory?.toLowerCase().trim() === "bottle" ||
            p.subCategory?.toLowerCase().trim() === "box"
          ) {
            return p.quantity <= 20;
          }

          return false;
        });

        // 🧹 اخفاء اللي اتعمله Clear
        alerts = alerts.filter(n => !hiddenIds.includes(n.id));

        // 🔊 صوت عند زيادة جديدة فقط
        if (alerts.length > prevCount.current) {
          playSound();
        }

        prevCount.current = alerts.length;

        setNotifications(alerts);
      };

      processData();
    });

    return () => unsubscribe();
  }, [hiddenIds]);

  // ❌ قفل لما تدوس برا
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✔️ mark as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // 🧹 Clear All (FIXED)
  const clearAll = () => {
    setHiddenIds(notifications.map(n => n.id));
    setNotifications([]);
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>

      {/* 🔔 Bell */}
      <div
  onClick={() => setShowNotif(prev => !prev)}
  style={{
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "#fff",
    border: "1px solid #eee",
    transition: "0.2s"
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#f1f5f9")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "#fff")
  }
>
  🔔
</div>

      {/* 🔴 Badge */}
      {notifications.filter(n => !n.read).length > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-3px",
            right: "-3px",
            minWidth: "18px",
            height: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ef4444",
            color: "#fff",
            fontSize: "10px",
            borderRadius: "50%",
            padding: "2px 6px",
            fontWeight: "600"
          }}
        >
          {notifications.filter(n => !n.read).length}
        </span>
      )}

      {/* 📦 Dropdown */}
      {showNotif && (
        <div
          style={{
  position: "absolute",
  right: 0,
  top: "40px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  width: "300px",
  maxHeight: "320px",
  overflowY: "auto",
  padding: "8px",
  border: "1px solid #eee",
  zIndex: 999,

  // 🔥 animation
  opacity: 0,
  transform: "translateY(-10px)",
  animation: "fadeIn 0.5s forwards"
}}
        >
          {/* 🧹 Clear */}
          {notifications.length > 0 && (
            <div
              onClick={clearAll}
              style={{
                textAlign: "right",
                fontSize: "12px",
                cursor: "pointer",
                color: "#3b82f6",
                marginBottom: "8px"
              }}
            >
              <button
  onClick={clearAll}
  style={{
    width: "100%",
    padding: "6px",
    fontSize: "12px",
    borderRadius: "6px",
    border: "none",
    background: "#f1f5f9",
    cursor: "pointer",
    marginBottom: "8px"
  }}
>
  Clear all
</button>
            </div>
          )}

          {/* 🧠 Empty */}
          {notifications.length === 0 && (
            <div style={{ padding: "15px", textAlign: "center", color: "#888" }}>
              🔕 No notifications
            </div>
          )}

          {/* 📋 List */}
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              style={{
                padding: "10px",
                borderBottom: "1px solid #eee",
                borderRadius: "8px",
                marginBottom: "5px",
                background: n.read ? "#fff" : "#eef2ff",
                cursor: "pointer"
              }}
              onMouseEnter={(e) =>
  (e.currentTarget.style.background = "#e0e7ff")
}
onMouseLeave={(e) =>
  (e.currentTarget.style.background =
    n.read ? "#fff" : "#eef2ff")
}
            >
              <strong style={{ fontSize: "13px" }}>
  {n.name}
</strong>

              <div
                style={{
                  fontSize: "12px",
                  color: n.quantity === 0 ? "#ef4444" : "#f59e0b"
                }}
              >
                {n.quantity === 0
  ? "Out of stock"
  : "Low stock"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}