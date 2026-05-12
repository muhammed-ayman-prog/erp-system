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
import { LayoutDashboard } from "lucide-react";
import { theme } from "../theme";
import { useTranslate } from "../useTranslate";
import {
  ShoppingCart,
  Boxes,
  Users,
  BarChart3,
  Settings,
  Building2,
  Users2,
  PackagePlus,
  Receipt,
  Trash2,// 👈 NEW ICON
  RefreshCw,
  FileText,
  Repeat,
  DollarSign
} from "lucide-react";
import Notifications from "../components/Notifications";

export default function Layout() {
  const t = useTranslate();
  const [branches, setBranches] = useState([]);
  const { selectedBranch, setSelectedBranch } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = false;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user, logout, loading } = useAuth();
  if (loading) return <div>{t("common.loading")}</div>;

  useEffect(() => {
    if (user?.status === "disabled") {
      console.log("🚫 USER DISABLED → LOGOUT");
      logout();
    }
  }, [user?.status]);

  const ROLE_PERMISSIONS = {
  admin: ["*"],

  branch_manager: [
    "view_dashboard",
    "view_sales",
    "view_reports",
    "view_inventory",
    "view_customers",
    "view_operations"
  ],

  employee: [
    "view_dashboard",
    "view_sales"
  ]
};
  const hasPermission = (perm) => {
    return (
      user?.permissions?.includes("*") ||
      user?.permissions?.includes(perm)
    );
  };

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
 const menu = [
  {
    section: t("navigation.main"),
    items: [
      {
        name: t("dashboard"),
        path: "/dashboard",
        icon: <LayoutDashboard size={collapsed ? 24 : 18} />,
        permission: "view_dashboard"
      },
      {
        name: t("navigation.sales"),
        path: "/sales",
        icon: <ShoppingCart size={collapsed ? 24 : 18} />,
        permission: "view_sales",
      }
    ]
  },
  {
    section: t("navigation.operations"),
    items: [
      {
        name: t("navigation.expenses"),
        path: "/expenses",
        icon: <Receipt size={collapsed ? 24 : 18} />,
        permission: "view_expenses"
      },
      {
        name: t("navigation.waste"),
        path: "/waste",
        icon: <Trash2 size={collapsed ? 24 : 18} />,
        permission: "view_waste"
      },
      {
      name: t("navigation.returns"),
      path: "/returns",
      icon: <RefreshCw size={collapsed ? 24 : 18} />,
      permission: "view_returns"
    },
      {
        name: t("inventory.title"),
        path: "/inventory",
        icon: <Boxes size={collapsed ? 24 : 18} />,
        permission: "view_inventory"
      },
      
      {
        name: t("purchases"),
        path: "/purchases",
        icon: <PackagePlus size={collapsed ? 24 : 18} />,
        permission: "view_purchases"
      },
      {
        name: t("operations.title"),
        path: "/operations",
        icon: <Repeat size={collapsed ? 24 : 18} />,
        permission: "view_operations"
      },
      
    ]
  },
  {
    section: t("navigation.management"),
    items: [
      {
        name: "Pricing",
        path: "/pricing",
        icon: <DollarSign size={collapsed ? 24 : 18} />,
        permission: "view_inventory"
      },
      {
        name: t("navigation.reports"),
        path: "/reports",
        icon: <BarChart3 size={collapsed ? 24 : 18} />,
        permission: "view_reports"
      },
      {
        name: t("navigation.customers"),
        path: "/customers",
        icon: <Users2 size={collapsed ? 24 : 18} />,
        permission: "view_customers"
      },
      {
        name: t("navigation.branches"),
        path: "/branches",
        icon: <Building2 size={collapsed ? 24 : 18} />,
        permission: "view_branches"
      },
      {
        name: t("navigation.users"),
        path: "/users",
        icon: <Users size={collapsed ? 24 : 18} />,
        permission: "view_users"
      },
      {
        name: t("navigation.logs"),
        path: "/logs",
        icon: <FileText size={collapsed ? 24 : 18} />,
        permission: "view_logs"
      },
      {
        name: t("navigation.settings"),
        path: "/settings",
        icon: <Settings size={collapsed ? 24 : 18} />,
        permission: "view_settings"
      }
    ]
  }
];
  return (
    <div
      style={{
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
          left: mobileOpen ? 0 : "-100%",
          top: 0,
          zIndex: 1000,
          width: "260px",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "#ffffff",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid #eee",
          padding: "16px",
          transition:
           "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          height: "100vh",
          overflowY: "auto",
          overflowX: "visible",   // 🔥 دي أهم سطر هنا
          boxShadow:
  "2px 0 30px rgba(0,0,0,0.18)"
        }}
        
      >
        <div style={{ marginBottom: "10px" }} />

        {menu.map((section, sIndex) => (
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
      .filter(item => hasPermission(item.permission))
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
    padding: "12px 10px",
    borderRadius: "10px",
    marginBottom: "8px",
    textDecoration: "none",
    transition: "0.2s",
    background: isActive ? theme.colors.primary : "transparent",
    color: isActive ? "#fff" : theme.colors.text
  }}
>
            {item.icon}
            
            {isActive && (
  <span style={{
    position: "absolute",
    left: 0,
    top: "20%",
    height: "60%",
    width: "3px",
    background: "#000",
    borderRadius: "0 4px 4px 0"
  }} />
)}
            
            {item.name}
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
  padding: isMobile ? "10px" : "20px", // 👈 الحل
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
