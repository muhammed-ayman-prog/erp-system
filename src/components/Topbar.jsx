import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/useAuth";
import { Menu } from "lucide-react"; // 🔥 icon
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { Globe } from "lucide-react";
import { useTranslate } from "../useTranslate";
import { useNavigate }
from "react-router-dom";
import Notifications from "../components/Notifications";

export default function Topbar({
  openMobile,
  branches,
  selectedBranch,
  setSelectedBranch
}) {
 const { t, tt, lang } = useTranslate();
 const branchTranslations = {
  "Abbas Akkad 1": t("branchNames.abbasAkkad1"),
  "Abbas Akkad 2": t("branchNames.abbasAkkad2"),
  "Abbas Akkad 3": t("branchNames.abbasAkkad3"),
  "City Stars": t("branchNames.cityStars"),
  "City Stars 2": t("branchNames.cityStars2"),
  "El Obour": t("branchNames.elObour"),
  "El Rehab": t("branchNames.elRehab"),
};
  const branchOrder = [
  "Abbas Akkad 1",
  "Abbas Akkad 2",
  "Abbas Akkad 3",
  "City Stars",
  "El Obour",
  "El Rehab"
];
  const [isMobile, setIsMobile] = useState(
  window.innerWidth < 768
);
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );
}, []);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const { setLang } = useApp();
  const [openLang, setOpenLang] = useState(false);
  const langRef = useRef();
  useEffect(() => {
  const handleClick = (e) => {
    if (langRef.current && !langRef.current.contains(e.target)) {
      setOpenLang(false);
    }
  };
  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, []);
const accessibleBranches =
  user?.role === "owner"
    ? branches
    : branches.filter((b) =>
        user?.branchIds?.includes(b.id)
      );
  return (

    <div
      style={{
        direction:
        lang === "ar"
          ? "rtl"
          : "ltr",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", // 🔥 مهم
        gap: "10px",
        background: theme.colors.card,
        color: theme.colors.text,
        padding: isMobile ? "10px" : "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
        borderBottom: `1px solid ${theme.colors.border}`,
        marginBottom: "20px"
      }}
    >
      {/* 🔹 Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        
        {/* 🔥 Menu Icon */}
        <div
        onClick={() => {
          openMobile();
        }}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition:
  "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.05)";
        }}
      >
        <Menu size={24} />
      </div>

        {/* 🔥 Logo + Name */}
<div
  onClick={() => navigate("/home")}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "14px",
    transition: "0.25s",
    background: "transparent"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background =
      "rgba(212,163,115,0.12)";

    e.currentTarget.style.transform =
      "translateY(-1px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background =
      "transparent";

    e.currentTarget.style.transform =
      "translateY(0)";
  }}
>

  {/* Logo */}
  <img
    src="/logo.png"
    alt="logo"

    style={{
      width: "38px",
      height: "38px",
      objectFit: "contain",
      filter:
        "drop-shadow(0 4px 10px rgba(0,0,0,0.15))"
    }}
  />

  {/* Text */}
  {!isMobile && (

    <div>

      <div
        style={{
          fontWeight: "700",
          fontSize: "15px",
          color: theme.colors.text,
          lineHeight: 1.1
        }}
      >
        {t("topbar.appName")}
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#94a3b8",
          marginTop: "2px"
        }}
      >
        {t("topbar.erp")}
      </div>

    </div>

  )}

</div>
      </div>

      {/* 🔹 Branch */}
      <select
        value={selectedBranch || "all"}
        onChange={(e) => setSelectedBranch(e.target.value)}
        disabled={accessibleBranches.length <= 1}
        style={{
          padding: "8px 14px",
          borderRadius: "999px",
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.secondary,
          color: theme.colors.text,
          cursor: "pointer",
          fontWeight: "500",
          width: isMobile ? "100%" : "auto" // 🔥 ده الجديد
        }}
      >
        {user?.role === "owner" && (
          <option value="all">🌍 {t("topbar.allBranches")}</option>
        )}

        {[...(accessibleBranches || [])]
  .sort((a, b) => {
    const indexA = branchOrder.indexOf(a.name);
    const indexB = branchOrder.indexOf(b.name);

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  })
  .map((b) => (
    <option key={b.id} value={b.id}>
  {branchTranslations[b.name] || b.name}
</option>
  ))}
      </select>

      
      {/* 🔹 Right */}
      <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "nowrap", // 🔥 مهم
        width: isMobile ? "100%" : "auto",
        position: "relative",
      }}
    >
        
  {/* 🌐 Language */}
  <div ref={langRef} style={{ position: "relative" }}>
        
    {/* زرار */}
    <div
  onClick={() => setOpenLang(!openLang)}
  style={{
    height: "34px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 10px",
    cursor: "pointer",
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    transition:
  "all 0.2s ease"
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = theme.colors.secondary)
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = theme.colors.card)
  }
>
  <Globe size={16} />
  <span style={{ fontSize: "12px", fontWeight: "600" }}>
    {lang.toUpperCase()}
  </span>
</div>

    {/* Dropdown */}
    {openLang && (
      <div
        style={{
  position: "absolute",

  top: "45px",

  ...(lang === "ar"
    ? { right: 0 }
    : { left: 0 }),

  width:
    isMobile
      ? "100px"
      : "140px",

  background:
    theme.colors.card,

  borderRadius: "12px",

  boxShadow:
    "0 10px 25px rgba(0,0,0,0.1)",

  padding: "6px",

  border:
    `1px solid ${theme.colors.border}`,

  zIndex: 9999
}}
      >

        <div
          onClick={() => {
            setLang("en");
            setOpenLang(false);
          }}
         style={{
  padding: "8px",
  cursor: "pointer",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "space-between",
  background: lang === "en" ? theme.colors.secondary : "transparent"
}}
onMouseEnter={(e) =>
  (e.currentTarget.style.background = theme.colors.secondary)
}
onMouseLeave={(e) =>
  (e.currentTarget.style.background =
    lang === "en" ? theme.colors.secondary : "transparent")
}
        >
          {t("topbar.english")} {lang === "en" && "✓"}
        </div>

        <div
          onClick={() => {
            setLang("ar");
            setOpenLang(false);
          }}
          style={{
  padding: "8px",
  cursor: "pointer",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "space-between",
  background: lang === "ar" ? theme.colors.secondary : "transparent"
}}
onMouseEnter={(e) =>
  (e.currentTarget.style.background = theme.colors.secondary)
}
onMouseLeave={(e) =>
  (e.currentTarget.style.background =
    lang === "en" ? theme.colors.secondary : "transparent")
}
        >
          {t("topbar.arabic")} {lang === "ar" && "✓"}
        </div>

      </div>
    )}

  </div>    
  <Notifications /> 

        {/* 👤 User */}
        <div
          ref={menuRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            position: "relative"
          }}
          onClick={() => setShowMenu(!showMenu)}
        >
          {!isMobile && (
        <span style={{ fontSize: "13px", fontWeight: "500" }}>
          {user?.name?.split(" ")[0] || t("common.user")}
        </span>
      )}

          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`}
            alt="avatar"
            style={{
              width: isMobile ? "28px" : "32px",
              height: isMobile ? "28px" : "32px",
              borderRadius: "50%"
            }}
          />

          {/* Dropdown */}
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                [lang === "ar" ? "left" : "right"]: 0,
                background: theme.colors.card,
                color: theme.colors.text,
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                width: "160px",
                padding: "10px",
                zIndex: 99999
              }}
            >
              <div
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderRadius: "6px"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = theme.colors.secondary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => navigate("/settings")}
              >
                ⚙️ {t("topbar.settings")}
              </div>

              <div
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  color: theme.colors.danger,
                  borderRadius: "6px"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(239,68,68,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                🚪 {t("topbar.logout")}
              </div>
            </div>
          )}
        </div>
      </div>
    
    </div>
  );
}
