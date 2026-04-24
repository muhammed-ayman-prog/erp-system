import Notifications from "./Notifications";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";
import { Menu } from "lucide-react"; // 🔥 icon
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { Globe } from "lucide-react";


export default function Topbar({
  setCollapsed,
  collapsed,
  branches,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const { selectedBranch, setSelectedBranch } = useApp();
  
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
  const { lang, setLang } = useApp();
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
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: theme.colors.card,
        color: theme.colors.text,
        padding: "12px 20px",
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
          onClick={() => setCollapsed(!collapsed)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <Menu size={22} />
        </div>

        {/* 🔥 Logo + Name */}
        <div
  onClick={() => navigate("/dashboard")}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer"
  }}
>
         
        </div>
      </div>

      {/* 🔹 Branch */}
      <select
        value={selectedBranch || "all"}
        onChange={(e) => setSelectedBranch(e.target.value)}
        disabled={user?.role !== "admin"}
        style={{
  padding: "8px 14px",
  borderRadius: "999px",
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.secondary,
  color: theme.colors.text,
  cursor: "pointer",
  fontWeight: "500"
}}
      >
        {user?.role === "admin" && (
          <option value="all">All Branches</option>
        )}

        {(branches || []).map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* 🔹 Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        
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
    transition: "0.2s"
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
          right: 0,
          background: theme.colors.card,
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          width: "140px",
          padding: "6px",
          border: `1px solid ${theme.colors.border}`
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
          English {lang === "en" && "✓"}
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
          العربية {lang === "ar" && "✓"}
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
          <span style={{ fontSize: "13px", fontWeight: "500" }}>
  {user?.name?.split(" ")[0] || "User"}
</span>

          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`}
            alt="avatar"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%"
            }}
          />

          {/* Dropdown */}
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                right: 0,
                background: theme.colors.card,
                color: theme.colors.text,
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                width: "160px",
                padding: "10px",
                zIndex: 999
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
                ⚙️ Settings
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
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}