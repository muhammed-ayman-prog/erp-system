import { useState, useEffect } from "react";
import Topbar from "./Topbar";
import {
  Outlet,
  Link,
  useLocation
} from "react-router-dom";

import {
  AnimatePresence,
  motion
} from "framer-motion";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { theme } from "../theme";
import { useTranslate } from "../useTranslate";
import {
  NAVIGATION_ITEMS
} from "../constants/navigation";
import {
  hasPermission
} from "../utils/permissions";

export default function Layout() {
  const { t, tt, lang } = useTranslate();
  const [branches, setBranches] = useState([]);
  const { selectedBranch, setSelectedBranch } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user, logout, loading } = useAuth();
  if (loading) return <div>{t("common.loading")}</div>;

  useEffect(() => {
    if (user?.status === "disabled") {
      console.log("🚫 USER DISABLED → LOGOUT");
      logout();
    }
  }, [user?.status]);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      if (branches.length) return;
      const snap = await getDocs(collection(db, "branches"));

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setBranches(data);
    };

    fetchBranches();
  }, []);

  // 🔥 MENU
 
  return (
    <div
      style={{
        direction: lang === "ar" ? "rtl" : "ltr",
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: "#f5f3ef",
        color: "#000",
        position: "relative"
      }}
    >
      {/* 🔥 Watermark */}
      

      {/* 🧱 Sidebar */}
      <div
        style={{
          position: "fixed",
          left:
  lang === "ar"
    ? "auto"
    : mobileOpen
    ? 0
    : "-100%",

right:
  lang === "ar"
    ? mobileOpen
      ? 0
      : "-100%"
    : "auto",
          top: 0,
          zIndex: 1000,
          width: isMobile ? "85%" : "260px",
          maxWidth: "320px",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "#ffffff",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderInlineEnd: "1px solid #eee",
          padding: "16px",
          height: "100vh",
          overflowY: "auto",
          overflowX: "visible",   // 🔥 دي أهم سطر هنا
          boxShadow:
  "2px 0 30px rgba(0,0,0,0.18)"
        }}
        
      >
        <div style={{ marginBottom: "10px" }} />

        {NAVIGATION_ITEMS
  .map((section) => ({

    ...section,

    items:
      section.items.filter(
        (item) => {
          if (
            item.ownerOnly &&
            user?.role !== "owner"
          ) {
            return false;
          }
          if (
            !item.permission
          ) {
            return true;
          }

          return hasPermission(
            user,
            item.permission
          );
        }
      )
  }))
  .filter(
    section =>
      section.items.length > 0
  )
  .map((section, sIndex) => (
  <div key={sIndex}>
    
    {/* اسم السيكشن */}
    {(
      <div style={{ 
        fontSize: "12px", 
        opacity: 0.6, 
        margin: "10px 0 5px" 
      }}>
        {section.section}
      </div>
    )}

    {/* العناصر */}
    {section.items
      .map((item, i) => {
        const isActive = location.pathname.startsWith(item.path)
        return (
          <Link
  className={isActive ? "active-link" : ""}
  key={i}
  to={item.path}
  onClick={() => setMobileOpen(false)}
  style={{
    position: "relative", // مهم
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
gap: "10px",
flexDirection:
  lang === "ar"
    ? "row-reverse"
    : "row",
    padding: "12px 10px",
    borderRadius: "10px",
    marginBottom: "8px",
    textDecoration: "none",
    transition: "0.2s",
    background: isActive ? theme.colors.primary : "transparent",
    color: isActive ? "#fff" : theme.colors.text
  }}
>
            <item.icon size={18} />
            
            {isActive && (
  <span style={{
    position: "absolute",
    [lang === "ar" ? "right" : "left"]: 0,
    top: "20%",
    height: "60%",
    width: "3px",
    background: "#000",
    borderRadius:
  lang === "ar"
    ? "4px 0 0 4px"
    : "0 4px 4px 0",
  }} />
)}
            
            {item.label}
          </Link>
          
        );
      })}
  </div>
))}
      </div>

      {/* 📱 Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 999
          }}
        />
      )}

      {/* 📦 Content */}
      <div style={{ 
  flex: 1, 
  minWidth: 0,
  padding: isMobile ? "8px" : "20px", // 👈 الحل
  width: "100%",
  maxWidth: "100%",
  overflow: "visible",
  position: "relative", 
}}>
        <Topbar
          openMobile={() =>
            setMobileOpen(prev => !prev)
          } // 👈 مهم
          branches={branches}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
        />

        <AnimatePresence mode="wait">

  <motion.div

    key={location.pathname}

    initial={{
      opacity: 0,
      y: 18
    }}

    animate={{
      opacity: 1,
      y: 0
    }}

    exit={{
      opacity: 0,
      y: -18
    }}

    transition={{
      duration: 0.28,
      ease: "easeOut"
    }}

    style={{
      marginTop: "20px"
    }}
  >

    <Outlet />

  </motion.div>

</AnimatePresence>
      </div>
</div>
);
}
