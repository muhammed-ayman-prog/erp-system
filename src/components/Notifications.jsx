import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { useApp } from "../store/useApp";
import { useNavigate }
from "react-router-dom";
import timeAgo from
"../utils/timeAgo";
export default function Notifications() {
  const { selectedBranch } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [hiddenIds, setHiddenIds] = useState([]); // 🧠 حل Clear All
  const [readIds, setReadIds] =
  useState(() => {

    const saved =
      localStorage.getItem(
        "readNotifications"
      );

    return saved
      ? JSON.parse(saved)
      : [];

});
  const dropdownRef = useRef(null);
  const prevCount = useRef(0);
  const lastSoundTime =
  useRef(0);
  const navigate = useNavigate();
  
  // 🔊 صوت
  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  const branchesRef = useRef({});

  const productsRef = useRef({});
  // 🔔 Real-time
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onSnapshot(collection(db, "stock"), (snapshot) => {
      const processData = async () => {

        const latestStock = {};
snapshot.forEach(doc => {
  const data = doc.data();

  const key = JSON.stringify({
  productId: data.productId,
  branchId: data.branchId
});
  const existing = latestStock[key];

  const currentTime =
    data.createdAt?.seconds || 0;

  const existingTime =
    existing?.createdAt?.seconds || 0;

  if (
      !existing ||
      currentTime > existingTime ||
      data.after !== existing?.after // 🔥 أهم سطر
    ) {
    latestStock[key] = data;
      }
    });

        if (Object.keys(productsRef.current).length === 0) {
          const snap = await getDocs(collection(db, "products"));
          snap.forEach(doc => {
            productsRef.current[doc.id] = doc.data();
          });
        }

        // 🔥 تحميل الفروع
        if (Object.keys(branchesRef.current).length === 0) {
          const snap = await getDocs(collection(db, "branches"));
          snap.forEach(doc => {
            branchesRef.current[doc.id] = doc.data();
          });
        }
        const stockByProduct = {};

        Object.values(latestStock).forEach(data => {
          if (!stockByProduct[data.productId]) {
            stockByProduct[data.productId] = [];
          }
          stockByProduct[data.productId].push(data);
        });

        let alerts = Object.entries(productsRef.current).map(([productId, p]) => {

          // 🔥 دور على كل الفروع لهذا المنتج
          const relatedStock = stockByProduct[productId] || [];

          
          if (relatedStock.length === 0) return [];
          
          // 🔥 لكل فرع
          return relatedStock.map((data) => {
            const branchId = data.branchId;
            const qty = Number(data.after || data.quantity || 0);

            const category = p.category?.trim().toLowerCase() || "";
            const sub = p.subCategory?.trim().toLowerCase() || "";

            let priority = null;

            if (qty === 0) {
              priority = "high";
            } else if (
              category.includes("french") ||
              category.includes("oriental") ||
              category.includes("musk")
            ) {
              if (qty < 20) priority = "high";
              else if (qty < 35) priority = "medium";
              else if (qty < 50) priority = "low";
            } else if (sub.includes("bottle")) {
              if (qty < 10) priority = "high";
              else if (qty < 20) priority = "medium";
              else if (qty < 30) priority = "low";
            } else if (sub.includes("box")) {
              if (qty < 5) priority = "high";
              else if (qty < 8) priority = "medium";
              else if (qty < 10) priority = "low";
            } else if (sub.includes("sample")) {
              if (qty < 5) priority = "high";
              else if (qty < 8) priority = "medium";
              else if (qty < 10) priority = "low";
            }

            return {
              id: `${productId}_${branchId}`,
              productId,
              branchId,
              name: p.name,
              quantity: qty,
              priority,
              read: false,

              createdAt:
                data.createdAt || null
            };
          });
        }).flat();
        alerts = alerts.filter(Boolean);
        if (selectedBranch && selectedBranch !== "all") {
  alerts = alerts.filter(a => a.branchId === selectedBranch);
}
        

        // ⚠️ فلترة
        
        alerts = alerts.filter(p => p.priority !== null);
        const priorityOrder = {
          high: 1,
          medium: 2,
          low: 3
        };

        alerts.sort((a, b) => {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        // 🧹 اخفاء اللي اتعمله Clear
        alerts = alerts.filter(n => !hiddenIds.includes(n.id));

        // 🔊 صوت عند زيادة جديدة فقط
        if (alerts.length > prevCount.current) {

        const now = Date.now();

        if (
          now - lastSoundTime.current
          > 3000
        ) {

          playSound();

          lastSoundTime.current = now;

        }

      }

        prevCount.current = alerts.length;
        if (
          Object.keys(productsRef.current).length === 0 ||
          Object.keys(branchesRef.current).length === 0
        ) {
          return;
        }
        if (!isMounted) return;
        setNotifications(

        alerts.map(alert => ({
          ...alert,

          read:
            readIds.includes(alert.id)
        }))

      );
      };

      processData();
    });

    return () => {
  isMounted = false;
  unsubscribe();
};
  }, [
  selectedBranch,
  hiddenIds
]);

  // ❌ قفل لما تدوس برا
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

return () =>
  document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✔️ mark as read
  const markAsRead = (id) => {

  setReadIds(prev => {

    const updated = [
      ...new Set([...prev, id])
    ];

    localStorage.setItem(
      "readNotifications",
      JSON.stringify(updated)
    );

    return updated;

  });

  setNotifications(prev =>
    prev.map(n =>
      n.id === id
        ? { ...n, read: true }
        : n
    )
  );

};

  // 🧹 Clear All (FIXED)
  const clearAll = () => {
  setHiddenIds(prev => [...new Set([...prev, ...notifications.map(n => n.id)])]);
  setNotifications([]);
};

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>

      {/* 🔔 Bell */}
      <div
  onClick={(e) => {
  e.stopPropagation();
  setShowNotif(prev => !prev);
}}
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
      {notifications.filter(n => !n.read && n.priority === "high").length > 0 && (
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
          {notifications.filter(n => !n.read && n.priority === "high").length}
        </span>
      )}

      {/* 📦 Dropdown */}
      {showNotif && (
        <div
          style={{
  position: "absolute",
  right: 0,
  top: "45px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  width: "300px",
  maxHeight: "320px",
  overflowY: "auto",
  padding: "8px",
  border: "1px solid #eee",
  zIndex: 99999,

  // 🔥 animation

  
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
              onClick={() => {

              markAsRead(n.id);

              setShowNotif(false);

              navigate(
                `/inventory?product=${n.productId}`
              );

            }}
              style={{
                padding: "10px",
                borderBottom: "1px solid #eee",
                borderRadius: "8px",
                marginBottom: "5px",
                background:
                  n.read
                    ? "#fff"
                    : n.priority === "high"
                    ? "#fee2e2"
                    : n.priority === "medium"
                    ? "#ffedd5"
                    : "#fef9c3",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
  e.currentTarget.style.opacity = "0.85";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.opacity = "1";
}}
            >
              <strong style={{ fontSize: "13px" }}>
  {n.name} ({branchesRef.current[n.branchId]?.name || "Unknown"})
</strong>

              <div
                style={{
                  fontSize: "12px",
                  color:
                    n.priority === "high"
                      ? "#b91c1c"
                      : n.priority === "medium"
                      ? "#c2410c"
                      : "#a16207",
                }}
              >
                {n.quantity === 0
                  ? "Out of stock"
                  : `Low stock (${n.quantity})`}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginTop: "4px"
                }}
              >
                {timeAgo(n.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}