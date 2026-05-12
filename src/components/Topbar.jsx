import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";
import { Menu } from "lucide-react"; // 🔥 icon
import { useApp } from "../store/useApp";
import { theme } from "../theme";
import { Globe } from "lucide-react";
import { useTranslate } from "../useTranslate";
import { Search } from "lucide-react";
const branchMap = {
  "Abbas Akkad 1": "abbasAkkad1",
  "Abbas Akkad 2": "abbasAkkad2",
  "Abbas Akkad 3": "abbasAkkad3",
  "City Stars": "cityStars",
  "El Obour": "elObour",
  "El Rehab": "elRehab"
};
import Notifications from "../components/Notifications";
export default function Topbar({
  openMobile,
  branches,
  selectedBranch,
  setSelectedBranch
}) {
  const t = useTranslate();
  const branchOrder = [
  "Abbas Akkad 1",
  "Abbas Akkad 2",
  "Abbas Akkad 3",
  "City Stars",
  "El Obour",
  "El Rehab"
];
  const isMobile = window.innerWidth < 768;
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
  const { lang, setLang } = useApp();
  const [openLang, setOpenLang] = useState(false);
  const [searchOpen, setSearchOpen] =
  useState(false);

const [search, setSearch] =
  useState("");
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
useEffect(() => {

  const handleKeyDown = (e) => {
    
    if (e.key === "Escape") {

      e.preventDefault();

      setSearchOpen(false);

      setSearch("");

    }
    if (
      (e.ctrlKey || e.metaKey) &&
e.shiftKey &&
e.key.toLowerCase() === "f"
    ) {

      e.preventDefault();

      setSearchOpen(true);

    }

  };

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  return () =>
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );

}, []);
const pages = [

  {
    name: "Sales",
    path: "/sales"
  },

  {
    name: "Inventory",
    path: "/inventory"
  },

  {
    name: "Expenses",
    path: "/expenses"
  },

  {
    name: "Reports",
    path: "/reports"
  },

  {
    name: "Customers",
    path: "/customers"
  },

  {
    name: "Branches",
    path: "/branches"
  },

  {
    name: "Users",
    path: "/users"
  }

];

const filteredPages =
  pages.filter((p) =>
    p.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  return (
    <div
      style={{
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
        A Perfume Story
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#94a3b8",
          marginTop: "2px"
        }}
      >
        ERP System
      </div>

    </div>

  )}

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
          fontWeight: "500",
          width: isMobile ? "100%" : "auto" // 🔥 ده الجديد
        }}
      >
        {user?.role === "admin" && (
          <option value="all">🌍 All Branches</option>
        )}

        {[...(branches || [])]
  .sort((a, b) => {
    const indexA = branchOrder.indexOf(a.name);
    const indexB = branchOrder.indexOf(b.name);

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  })
  .map((b) => (
    <option key={b.id} value={b.id}>
      {t(`branches.${branchMap[b.name]}`) || b.name}
    </option>
  ))}
      </select>

      {/* 🔍 Search */}

<div

  onClick={() => setSearchOpen(true)}

  style={{

    flex: 1,

    maxWidth: "320px",

    height: "40px",

    borderRadius: "999px",

    border:
      `1px solid ${theme.colors.border}`,

    background:
      theme.colors.card,

    display: "flex",

    alignItems: "center",

    gap: "10px",

    padding: "0 14px",

    cursor: "pointer",

    color: "#64748b"
  }}
>

  <Search size={16} />

  <span
    style={{
      fontSize: "14px"
    }}
  >
    Search...
  </span>

  <div
    style={{
      marginLeft: "auto",
      fontSize: "11px",
      opacity: 0.6
    }}
  >
    Ctrl + Shift + F
  </div>

</div>
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
          position: window.innerWidth < 768 ? "fixed" : "absolute",
          top: window.innerWidth < 768 ? "auto" : "45px",
          bottom: window.innerWidth < 768 ? "20px" : "auto",
          left: window.innerWidth < 768 ? "50%" : "auto",
          right: window.innerWidth < 768 ? "auto" : 0,
          transform: window.innerWidth < 768 ? "translateX(-50%)" : "none",
          width: window.innerWidth < 768 ? "90%" : "140px",
          background: theme.colors.card,
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          padding: "6px",
          border: `1px solid ${theme.colors.border}`,
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
          {!isMobile && (
        <span style={{ fontSize: "13px", fontWeight: "500" }}>
          {user?.name?.split(" ")[0] || "User"}
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
                right: 0,
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
      {/* 🔍 Search Modal */}

{searchOpen && (

  <div

    onClick={() => {

      setSearchOpen(false);

      setSearch("");

    }}

    style={{

      position: "fixed",

      inset: 0,

      background:
        "rgba(0,0,0,0.35)",

      backdropFilter: "blur(8px)",

      zIndex: 999999,

      display: "flex",

      justifyContent: "center",

      alignItems: "flex-start",

      paddingTop: "120px"
    }}
  >

    <div

      onClick={(e) =>
        e.stopPropagation()
      }

      style={{

        width: "95%",

        maxWidth: "620px",

        background:
          theme.colors.card,

        borderRadius: "24px",

        overflow: "hidden",

        boxShadow:
          "0 25px 80px rgba(0,0,0,0.2)"
      }}
    >

      <input
      onKeyDown={(e) => {

  if (e.key === "Escape") {

    e.preventDefault();

    setSearchOpen(false);

    setSearch("");

  }

}}

        autoFocus

        value={search}

        onChange={(e) =>
          setSearch(e.target.value)
        }

        placeholder="Search pages..."

        style={{

          width: "100%",

          border: "none",

          outline: "none",

          background: "transparent",

          padding: "22px",

          fontSize: "18px",

          color: theme.colors.text,

          borderBottom:
            `1px solid ${theme.colors.border}`
        }}
      />

      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto"
        }}
      >
        {filteredPages.length === 0 && (

          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#94a3b8"
            }}
          >

            No results found

          </div>

        )}
        {filteredPages.map((page) => (

          <div

            key={page.path}

            onClick={() => {

              navigate(page.path);

              setSearchOpen(false);

              setSearch("");

            }}

            style={{

              padding: "18px 22px",

              cursor: "pointer",

              borderBottom:
                `1px solid ${theme.colors.border}`,

              transition:
  "all 0.2s ease"
            }}

            onMouseEnter={(e) =>
              e.currentTarget.style.background =
                theme.colors.secondary
            }

            onMouseLeave={(e) =>
              e.currentTarget.style.background =
                "transparent"
            }
          >

            {page.name}

          </div>

        ))}

      </div>

    </div>

  </div>

)}
    </div>
  );
}