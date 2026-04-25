import { useState, useEffect } from "react";
import Topbar from "./Topbar";
import { Outlet, Link, useLocation } from "react-router-dom";
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
  FileText
} from "lucide-react";


export default function Layout() {
  const t = useTranslate();
  const [branches, setBranches] = useState([]);
  const { selectedBranch, setSelectedBranch } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user, logout, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

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
    section: "Main",
    items: [
      {
        name: t("dashboard"),
        path: "/dashboard",
        icon: <LayoutDashboard size={collapsed ? 24 : 18} />,
        permission: "view_dashboard"
      },
      {
        name: t("sales"),
        path: "/sales",
        icon: <ShoppingCart size={collapsed ? 24 : 18} />,
        permission: "view_sales",
      }
    ]
  },
  {
    section: "Operations",
    items: [
      {
        name: t("expenses"),
        path: "/expenses",
        icon: <Receipt size={collapsed ? 24 : 18} />,
        permission: "view_expenses"
      },
      {
        name: t("waste"),
        path: "/waste",
        icon: <Trash2 size={collapsed ? 24 : 18} />,
        permission: "view_waste"
      },
      {
      name: "Returns",
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
      }
    ]
  },
  {
    section: "Management",
    items: [
      {
        name: t("reports"),
        path: "/reports",
        icon: <BarChart3 size={collapsed ? 24 : 18} />,
        permission: "view_reports"
      },
      {
        name: t("customers"),
        path: "/customers",
        icon: <Users2 size={collapsed ? 24 : 18} />,
        permission: "view_customers"
      },
      {
        name: t("branches"),
        path: "/branches",
        icon: <Building2 size={collapsed ? 24 : 18} />,
        permission: "view_branches"
      },
      {
        name: t("users"),
        path: "/users",
        icon: <Users size={collapsed ? 24 : 18} />,
        permission: "view_users"
      },
      {
        name: "Logs",
        path: "/logs",
        icon: <FileText size={collapsed ? 24 : 18} />,
        permission: "view_logs"
      },
      {
        name: t("settings"),
        path: "/settings",
        icon: <Settings size={collapsed ? 24 : 18} />,
        permission: "view_settings"
      }
    ]
  }
];
  const isExpanded = !collapsed;
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
          position: isMobile ? "fixed" : "relative",
          left: isMobile ? (mobileOpen ? 0 : "-100%") : 0,
          top: 0,
          zIndex: 1000,
          width: collapsed ? "75px" : "240px",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "#ffffff",
          borderRight: "1px solid #eee",
          padding: "16px",
          transition: "all 0.3s ease",
          height: "100vh",
          overflowY: "auto",   // 🔥 دي أهم سطر هنا
          boxShadow: isMobile ? "2px 0 20px rgba(0,0,0,0.2)" : "none"
        }}
        
      >
        <div style={{ marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
  
  {/* Logo */}
  <img
  src="/logo.png"
  alt="logo"
  style={{
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    objectFit: "cover",
    transition: "0.3s"
  }}
/>

  <div style={{
  display: "flex",
  flexDirection: "column",
  opacity: isExpanded ? 1 : 0,
  transform: collapsed ? "translateX(-10px)" : "translateX(0)",
  transition: "all 0.3s"
}}>
  {isExpanded && (
    <>
      <span style={{ fontWeight: "600", fontSize: "14px" }}>
        A Perfume Story
      </span>
      <span style={{
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "0.5px",
        opacity: 0.5,
        textTransform: "uppercase"
      }}>
        ERP System
      </span>
    </>
  )}
</div>
</div>

        {menu.map((section, sIndex) => (
  <div key={sIndex}>
    
    {/* اسم السيكشن */}
    {isExpanded && (
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
  onClick={() => isMobile && setMobileOpen(false)}
  style={{
    position: "relative", // مهم
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    gap: collapsed ? "0px" : "10px",
    padding: collapsed ? "12px 0" : "12px 10px",
    borderRadius: "10px",
    marginBottom: "8px",
    textDecoration: "none",
    transition: "0.2s",
    background: isActive ? theme.colors.primary : "transparent",
    color: isActive ? "#fff" : theme.colors.text
  }}
>
            {item.icon}
            {collapsed && (
  <span
    className="tooltip"
    style={{
      position: "absolute",
      left: "85px",
      top: "50%",
      background: "#111",
      color: "#fff",
      padding: "6px 10px",
      borderRadius: "8px",
      fontSize: "12px",
      whiteSpace: "nowrap",
      zIndex: 9999
    }}
  >
    {item.name}
  </span>
)}
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
            
            {isExpanded && item.name}
          </Link>
          
        );
      })}
  </div>
))}
      </div>

      {/* 📱 Overlay */}
      {isMobile && mobileOpen && (
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
  overflowX: "hidden",
  position: "relative", 
  zIndex: 1 
}}>
        <Topbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          openMobile={() => setMobileOpen(true)} // 👈 مهم
          branches={branches}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
        />

        <div style={{ marginTop: "20px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}