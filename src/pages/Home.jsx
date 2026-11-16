import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpLeft,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  ClipboardList,
  FileClock,
  FileText,
  LayoutDashboard,
  PackagePlus,
  Receipt,
  RefreshCw,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  Store,
  Tags,
  Trash2,
  Users,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { getBranchNames } from "../constants/branches";
import { useTranslate } from "../useTranslate";
import { hasPermission } from "../utils/permissions";
import { PERMISSIONS } from "../constants/permissions";

const BRAND = {
  ink: "#20283A",
  muted: "#738096",
  ivory: "#F8F5F0",
  ivoryDeep: "#F1E8DC",
  champagne: "#B98B65",
  champagneSoft: "#F5EADF",
  blue: "#356FE5",
  blueSoft: "#EAF1FF",
  border: "#E9E5DF",
  white: "#FFFFFF",
};

const formatMoney = (value, lang) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function Home() {
  const { t, tt, lang } = useTranslate();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedBranch } = useApp();
  const reduceMotion = useReducedMotion();

  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const [branchNames, setBranchNames] = useState({});
  const [todaySales, setTodaySales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [salesLoading, setSalesLoading] = useState(true);
  const [search, setSearch] = useState("");

  const isMobile = viewportWidth < 680;
  const isTablet = viewportWidth < 980;
  const isOwner = user?.role === "owner";

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let active = true;

    const loadBranches = async () => {
      try {
        const result = await getBranchNames();
        if (active) setBranchNames(result || {});
      } catch (error) {
        console.error("Home: failed to load branches", error);
      }
    };

    loadBranches();
    return () => {
      active = false;
    };
  }, []);

  const effectiveBranch = isOwner
    ? selectedBranch
    : selectedBranch && selectedBranch !== "all"
      ? selectedBranch
      : user?.branchIds?.[0];

  useEffect(() => {
    if (!user || !hasPermission(user, PERMISSIONS.SALES_VIEW) || !effectiveBranch) {
      setTodaySales(0);
      setTodayOrders(0);
      setSalesLoading(false);
      return undefined;
    }

    setSalesLoading(true);

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const salesQuery =
      isOwner && effectiveBranch === "all"
        ? query(
            collection(db, "sales"),
            where("createdAt", ">=", todayStart),
            where("createdAt", "<=", todayEnd)
          )
        : query(
            collection(db, "sales"),
            where("branchId", "==", effectiveBranch),
            where("createdAt", ">=", todayStart),
            where("createdAt", "<=", todayEnd)
          );

    const unsubscribe = onSnapshot(
      salesQuery,
      (snapshot) => {
        let salesTotal = 0;
        let orderCount = 0;

        snapshot.docs.forEach((saleDoc) => {
          const sale = saleDoc.data();
          const status = String(sale.status || "").toLowerCase();
          if (status === "cancelled" || status === "canceled") return;

          salesTotal += Number(sale.total || 0);
          orderCount += 1;
        });

        setTodaySales(salesTotal);
        setTodayOrders(orderCount);
        setSalesLoading(false);
      },
      (error) => {
        console.error("Home: today's sales listener failed", error);
        setTodaySales(0);
        setTodayOrders(0);
        setSalesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, effectiveBranch, isOwner]);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? t("greetings.morning")
      : currentHour < 18
        ? t("greetings.afternoon")
        : t("greetings.evening");

  const currentDate = new Date().toLocaleDateString(
    lang === "ar" ? "ar-EG" : "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const branchLabel =
    isOwner && effectiveBranch === "all"
      ? tt("كل الفروع", "All branches")
      : branchNames[effectiveBranch]?.name ||
        user?.branchName ||
        tt("الفرع الحالي", "Current branch");

  const shortcutSections = useMemo(() => {
    const definitions = [
      {
        id: "daily",
        title: tt("العمليات اليومية", "Daily operations"),
        description: tt(
          "الوصول السريع لأهم عمليات الفرع.",
          "Jump straight into the work that keeps the branch moving."
        ),
        items: [
          {
            id: "sales",
            title: tt("نقطة البيع", "Point of sale"),
            subtitle: tt("إنشاء المبيعات وإتمام الطلبات", "Create sales and complete orders"),
            path: "/sales",
            icon: ShoppingCart,
            color: "#21866B",
            permission: PERMISSIONS.SALES_VIEW,
            featured: true,
          },
          {
            id: "invoices",
            title: tt("الفواتير", "Invoices"),
            subtitle: tt("مراجعة الفواتير وطباعتها", "Review and print invoices"),
            path: "/invoices",
            icon: FileText,
            color: "#5277C8",
            permission: PERMISSIONS.SALES_VIEW,
          },
          {
            id: "returns",
            title: tt("المرتجعات", "Returns"),
            subtitle: tt("إدارة الاسترجاع والاستبدال", "Manage refunds and exchanges"),
            path: "/returns",
            icon: RefreshCw,
            color: "#B77A42",
            permission: PERMISSIONS.RETURNS_VIEW,
          },
          {
            id: "expenses",
            title: tt("المصروفات", "Expenses"),
            subtitle: tt("تسجيل ومراجعة مصروفات الفرع", "Record and review branch expenses"),
            path: "/expenses",
            icon: Receipt,
            color: "#C36A61",
            permission: PERMISSIONS.EXPENSES_VIEW,
          },
          {
            id: "daily-closing",
            title: tt("التقفيل اليومي", "Daily closing"),
            subtitle: tt("مطابقة النقدية ووسائل الدفع", "Reconcile cash and payment methods"),
            path: "/daily-closing",
            icon: BadgeDollarSign,
            color: "#248A83",
            permission: PERMISSIONS.REPORTS_VIEW,
          },
          {
            id: "daily-closing-history",
            title: tt("سجل التقفيل", "Closing history"),
            subtitle: tt("مراجعة التقفيلات السابقة", "Review previous daily closings"),
            path: "/daily-closing-history",
            icon: CalendarDays,
            color: "#6D79B7",
            permission: PERMISSIONS.REPORTS_VIEW,
          },
        ],
      },
      {
        id: "inventory",
        title: tt("المخزون والمنتجات", "Inventory & products"),
        description: tt(
          "تابع حركة المخزون والمشتريات والتسعير.",
          "Keep stock, purchasing and pricing under control."
        ),
        items: [
          {
            id: "inventory-view",
            title: tt("المخزون", "Inventory"),
            subtitle: tt("الأرصدة وحركة الأصناف", "Stock levels and item movements"),
            path: "/inventory",
            icon: Boxes,
            color: "#477FC5",
            permission: PERMISSIONS.INVENTORY_VIEW,
            featured: true,
          },
          {
            id: "purchases",
            title: tt("المشتريات", "Purchases"),
            subtitle: tt("إضافة ومتابعة التوريدات", "Add and track stock purchases"),
            path: "/purchases",
            icon: PackagePlus,
            color: "#548E9B",
            permission: PERMISSIONS.INVENTORY_VIEW,
          },
          {
            id: "waste",
            title: tt("الهالك والتسويات", "Waste & adjustments"),
            subtitle: tt("تسجيل الهالك وتسويات المخزون", "Record waste and stock adjustments"),
            path: "/waste",
            icon: Trash2,
            color: "#B87354",
            permission: PERMISSIONS.INVENTORY_ADJUST,
          },
          {
            id: "pricing",
            title: tt("التسعير", "Pricing"),
            subtitle: tt("إدارة أسعار المنتجات", "Manage product pricing"),
            path: "/pricing",
            icon: Tags,
            color: "#9A79B8",
            permission: PERMISSIONS.PRICING_VIEW,
          },
        ],
      },
      {
        id: "insights",
        title: tt("العملاء والتقارير", "Customers & insights"),
        description: tt(
          "حوّل بيانات التشغيل إلى رؤية أوضح.",
          "Turn daily activity into a clearer business picture."
        ),
        items: [
          {
            id: "customers",
            title: tt("العملاء", "Customers"),
            subtitle: tt("ملفات العملاء وسجل التعاملات", "Customer profiles and activity"),
            path: "/customers",
            icon: UsersRound,
            color: "#9172B5",
            permission: PERMISSIONS.CUSTOMERS_VIEW,
            ownerOnly: true,
          },
          {
            id: "dashboard",
            title: tt("لوحة المعلومات", "Dashboard"),
            subtitle: tt("نظرة عامة على أداء النشاط", "An overview of business performance"),
            path: "/dashboard",
            icon: LayoutDashboard,
            color: "#3D73B9",
            permission: PERMISSIONS.REPORTS_VIEW,
          },
          {
            id: "reports",
            title: tt("التقارير", "Reports"),
            subtitle: tt("تحليلات ومؤشرات الأداء", "Analytics and performance reports"),
            path: "/reports",
            icon: BarChart3,
            color: "#328A96",
            permission: PERMISSIONS.REPORTS_VIEW,
          },
        ],
      },
      {
        id: "administration",
        title: tt("الإدارة والتحكم", "Administration"),
        description: tt(
          "إدارة الفروع والمستخدمين وإعدادات النظام.",
          "Manage branches, people and system controls."
        ),
        items: [
          {
            id: "branches",
            title: tt("الفروع", "Branches"),
            subtitle: tt("بيانات الفروع وإدارتها", "Branch details and management"),
            path: "/branches",
            icon: Building2,
            color: "#B1845F",
            permission: PERMISSIONS.SETTINGS_VIEW,
          },
          {
            id: "users",
            title: tt("المستخدمون والصلاحيات", "Users & permissions"),
            subtitle: tt("إدارة الحسابات وإمكانية الوصول", "Manage accounts and access"),
            path: "/users",
            icon: Users,
            color: "#6378B5",
            permission: PERMISSIONS.USERS_VIEW,
          },
          {
            id: "operations",
            title: tt("العمليات والتحويلات", "Operations"),
            subtitle: tt("متابعة العمليات بين الفروع", "Track operational workflows"),
            path: "/operations",
            icon: ClipboardList,
            color: "#4F8A79",
            permission: PERMISSIONS.OPERATIONS_VIEW,
          },
          {
            id: "logs",
            title: tt("سجل النشاط", "Audit logs"),
            subtitle: tt("متابعة التغييرات والإجراءات", "Review changes and user actions"),
            path: "/logs",
            icon: FileClock,
            color: "#727E94",
            permission: PERMISSIONS.LOGS_VIEW,
          },
          {
            id: "settings",
            title: tt("الإعدادات", "Settings"),
            subtitle: tt("إعدادات الحساب والنظام", "Account and system preferences"),
            path: "/settings",
            icon: Settings2,
            color: "#8A7C6D",
            permission: PERMISSIONS.SETTINGS_VIEW,
          },
        ],
      },
    ];

    return definitions
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (item.ownerOnly && user?.role !== "owner") return false;
          return hasPermission(user, item.permission);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [user, tt]);

  const visibleSections = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return shortcutSections;

    return shortcutSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          `${item.title} ${item.subtitle}`.toLocaleLowerCase().includes(normalizedSearch)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [shortcutSections, search]);

  const availableShortcuts = shortcutSections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  const salesShortcut = shortcutSections
    .flatMap((section) => section.items)
    .find((item) => item.id === "sales");

  const dashboardShortcut = shortcutSections
    .flatMap((section) => section.items)
    .find((item) => item.id === "dashboard");

  const animationProps = reduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { duration: 0.45, ease: "easeOut" },
      };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        width: "100%",
        minWidth: 0,
        padding: isMobile ? "14px 12px 30px" : "24px clamp(16px, 2vw, 30px) 38px",
        boxSizing: "border-box",
        color: BRAND.ink,
      }}
    >
      <style>{`
        @keyframes apsHomeGlow {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: .55; }
          50% { transform: translate3d(12px, -8px, 0) scale(1.08); opacity: .85; }
        }
        @keyframes apsHomeShine {
          0% { transform: translateX(-130%); }
          55%, 100% { transform: translateX(130%); }
        }
        .aps-home-shortcut { transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
        .aps-home-shortcut:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(32,40,58,.09); border-color: rgba(185,139,101,.38) !important; }
        .aps-home-shortcut:focus-visible { outline: 3px solid rgba(53,111,229,.28); outline-offset: 3px; }
        .aps-home-cta { transition: transform .2s ease, box-shadow .2s ease; }
        .aps-home-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(32,40,58,.13); }
        @media (prefers-reduced-motion: reduce) {
          .aps-home-shortcut, .aps-home-cta { transition: none !important; }
        }
      `}</style>

      {/* Welcome hero */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.55, ease: "easeOut" }}
        style={{
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "minmax(0, 1.4fr) minmax(230px, .6fr)",
          alignItems: "center",
          gap: 18,
          padding: isMobile ? "24px 20px" : "30px clamp(24px, 3vw, 42px)",
          marginBottom: 22,
          borderRadius: 26,
          border: `1px solid ${BRAND.border}`,
          background: "linear-gradient(115deg, #FFFEFC 0%, #F8F1E8 58%, #F1E5D7 100%)",
          boxShadow: "0 14px 38px rgba(72,55,38,.055)",
          isolation: "isolate",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 310,
            height: 310,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(185,139,101,.2), rgba(185,139,101,0) 70%)",
            insetInlineEnd: isTablet ? -110 : "28%",
            top: -170,
            zIndex: -1,
            animation: reduceMotion ? "none" : "apsHomeGlow 9s ease-in-out infinite",
          }}
        />
        <div style={{ minWidth: 0, position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 11px",
              marginBottom: 16,
              border: "1px solid rgba(185,139,101,.22)",
              borderRadius: 999,
              background: "rgba(255,255,255,.62)",
              color: BRAND.champagne,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles size={13} />
            A PERFUME STORY · WORKSPACE
          </div>

          <div style={{ color: BRAND.muted, fontSize: 13, fontWeight: 600, marginBottom: 7 }}>
            {greeting}
          </div>
          <h1
            style={{
              margin: 0,
              color: BRAND.ink,
              fontSize: "clamp(27px, 3.1vw, 43px)",
              lineHeight: 1.12,
              fontWeight: 850,
              letterSpacing: "-.045em",
              overflowWrap: "anywhere",
            }}
          >
            {user?.name || tt("مرحبًا بك", "Welcome back")}
            <span style={{ color: BRAND.champagne }}>.</span>
          </h1>
          <p
            style={{
              maxWidth: 610,
              margin: "12px 0 0",
              color: "#707B8E",
              fontSize: 14,
              lineHeight: 1.85,
            }}
          >
            {tt(
              "كل أدوات إدارة نشاطك في مكان واحد. اختار المهمة وابدأ مباشرة.",
              "Your business, connected in one place. Choose a task and get straight to work."
            )}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 20,
            }}
          >
            {salesShortcut && (
              <button
                type="button"
                className="aps-home-cta"
                onClick={() => navigate(salesShortcut.path)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  minHeight: 44,
                  padding: "0 17px",
                  border: "1px solid #A87955",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #BD916D, #A87955)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 8px 18px rgba(168,121,85,.18)",
                }}
              >
                <ShoppingCart size={16} />
                {tt("ابدأ البيع", "Start selling")}
                {lang === "ar" ? <ArrowUpLeft size={15} /> : <ArrowUpRight size={15} />}
              </button>
            )}
            {dashboardShortcut && (
              <button
                type="button"
                className="aps-home-cta"
                onClick={() => navigate(dashboardShortcut.path)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 44,
                  padding: "0 15px",
                  border: "1px solid rgba(53,111,229,.18)",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.72)",
                  color: BRAND.ink,
                  fontWeight: 750,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <BarChart3 size={16} color={BRAND.blue} />
                {tt("عرض الأداء", "View performance")}
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isTablet ? "flex-start" : "center",
            gap: 14,
            minWidth: 0,
            padding: isMobile ? "12px 0 0" : 10,
          }}
        >
          <div
            style={{
              width: isMobile ? 76 : 108,
              height: isMobile ? 76 : 108,
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(185,139,101,.23)",
              borderRadius: 30,
              background: "rgba(255,255,255,.76)",
              boxShadow: "0 18px 38px rgba(95,71,48,.09), inset 0 1px 0 rgba(255,255,255,.9)",
            }}
          >
            <img
              src="/logo.png"
              alt="A Perfume Story"
              style={{
                display: "block",
                width: isMobile ? 56 : 78,
                height: isMobile ? 56 : 78,
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: BRAND.ink, fontSize: 13, fontWeight: 850, letterSpacing: ".13em" }}>
              A PERFUME STORY
            </div>
            <div style={{ marginTop: 6, color: BRAND.muted, fontSize: 11, lineHeight: 1.6 }}>
              {tt("منظومة إدارة الأعمال", "Business management platform")}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                marginTop: 12,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,.72)",
                border: "1px solid rgba(185,139,101,.18)",
                color: "#7E735F",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Store size={13} color={BRAND.champagne} />
              <span>{branchLabel}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Overview stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
          gap: 13,
          marginBottom: 28,
        }}
      >
        <OverviewCard
          icon={Wallet}
          label={tt("مبيعات اليوم", "Today's sales")}
          value={
            salesLoading
              ? "—"
              : `${formatMoney(todaySales, lang)} ${tt("جنيه", "EGP")}`
          }
          note={tt("إجمالي الفواتير غير الملغاة", "Excluding cancelled invoices")}
          tone="champagne"
          reduceMotion={reduceMotion}
        />
        <OverviewCard
          icon={Receipt}
          label={tt("فواتير اليوم", "Today's invoices")}
          value={salesLoading ? "—" : todayOrders.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
          note={tt("عدد عمليات البيع المسجلة", "Recorded sales transactions")}
          tone="blue"
          reduceMotion={reduceMotion}
        />
        <OverviewCard
          icon={Activity}
          label={tt("الاختصارات المتاحة", "Available shortcuts")}
          value={availableShortcuts.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
          note={tt("حسب صلاحيات حسابك", "Based on your account permissions")}
          tone="green"
          reduceMotion={reduceMotion}
        />
      </div>

      {/* Shortcuts header + search */}
      <div
        style={{
          display: "flex",
          alignItems: isMobile ? "stretch" : "flex-end",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
            <span style={{ width: 4, height: 22, borderRadius: 9, background: BRAND.champagne }} />
            <h2 style={{ margin: 0, color: BRAND.ink, fontSize: 21, fontWeight: 850, letterSpacing: "-.025em" }}>
              {tt("اختصارات النظام", "Workspace shortcuts")}
            </h2>
          </div>
          <p style={{ margin: 0, paddingInlineStart: 13, color: BRAND.muted, fontSize: 12 }}>
            {tt("كل الصفحات المهمة في مكان واحد.", "All your essential workspaces, one click away.")}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            width: isMobile ? "100%" : 310,
            minHeight: 44,
            padding: "0 13px",
            boxSizing: "border-box",
            border: `1px solid ${BRAND.border}`,
            borderRadius: 13,
            background: BRAND.white,
            boxShadow: "0 3px 10px rgba(32,40,58,.025)",
          }}
        >
          <Search size={17} color="#8993A3" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tt("ابحث عن صفحة...", "Find a workspace...")}
            aria-label={tt("البحث في الاختصارات", "Search shortcuts")}
            style={{
              flex: 1,
              minWidth: 0,
              height: 42,
              border: 0,
              outline: 0,
              background: "transparent",
              color: BRAND.ink,
              fontFamily: "inherit",
              fontSize: 13,
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label={tt("مسح البحث", "Clear search")}
              style={{ border: 0, background: "transparent", padding: 4, cursor: "pointer", color: BRAND.muted }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Shortcut groups */}
      <div style={{ display: "grid", gap: 23 }}>
        {visibleSections.map((section, sectionIndex) => (
          <motion.section
            key={section.id}
            {...animationProps}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.42, delay: sectionIndex * 0.055, ease: "easeOut" }}
            style={{ minWidth: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "baseline",
                justifyContent: "space-between",
                flexDirection: isMobile ? "column" : "row",
                gap: 5,
                marginBottom: 11,
              }}
            >
              <h3 style={{ margin: 0, color: BRAND.ink, fontSize: 15, fontWeight: 850 }}>
                {section.title}
              </h3>
              <span style={{ color: "#8A94A4", fontSize: 11 }}>{section.description}</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(auto-fit, minmax(205px, 1fr))",
                gap: 11,
              }}
            >
              {section.items.map((item, itemIndex) => (
                <ShortcutCard
                  key={item.id}
                  item={item}
                  isMobile={isMobile}
                  lang={lang}
                  reduceMotion={reduceMotion}
                  onClick={() => navigate(item.path)}
                  index={itemIndex}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {visibleSections.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            minHeight: 190,
            padding: 24,
            border: `1px dashed ${BRAND.border}`,
            borderRadius: 18,
            background: "rgba(255,255,255,.72)",
            color: BRAND.muted,
            textAlign: "center",
          }}
        >
          <Search size={28} strokeWidth={1.5} />
          <strong style={{ color: BRAND.ink, fontSize: 14 }}>{tt("مفيش نتائج", "No results found")}</strong>
          <span style={{ fontSize: 12 }}>{tt("جرب كلمة بحث مختلفة.", "Try a different search term.")}</span>
        </div>
      )}

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 30,
          paddingTop: 15,
          borderTop: `1px solid ${BRAND.border}`,
          color: "#929AAA",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".08em",
        }}
      >
        <span>A PERFUME STORY</span>
        <span>{currentDate}</span>
        <span>BUSINESS MANAGEMENT PLATFORM</span>
      </footer>
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, note, tone, reduceMotion }) {
  const toneStyles = {
    champagne: { background: "#F8F0E7", color: "#A97B55" },
    blue: { background: "#EDF2FF", color: "#5274C4" },
    green: { background: "#EAF4EF", color: "#4F8B70" },
  };
  const palette = toneStyles[tone] || toneStyles.blue;

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        minWidth: 0,
        padding: "16px 17px",
        border: `1px solid ${BRAND.border}`,
        borderRadius: 17,
        background: "#FFFFFF",
        boxShadow: "0 5px 18px rgba(32,40,58,.035)",
      }}
    >
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: 44,
          height: 44,
          flex: "0 0 auto",
          borderRadius: 13,
          background: palette.background,
          color: palette.color,
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, marginBottom: 5 }}>{label}</div>
        <div
          style={{
            color: BRAND.ink,
            fontSize: "clamp(17px, 2vw, 22px)",
            fontWeight: 850,
            lineHeight: 1.2,
            fontVariantNumeric: "tabular-nums",
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </div>
        <div style={{ color: "#9AA3B1", fontSize: 10, marginTop: 5 }}>{note}</div>
      </div>
    </motion.div>
  );
}

function ShortcutCard({ item, isMobile, lang, reduceMotion, onClick, index }) {
  const Icon = item.icon;
  return (
    <motion.button
      type="button"
      className="aps-home-shortcut"
      onClick={onClick}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.32, delay: index * 0.025 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
        minHeight: isMobile ? 88 : 94,
        padding: isMobile ? "12px 11px" : "15px 15px",
        border: `1px solid ${BRAND.border}`,
        borderRadius: 16,
        background: "#FFFFFF",
        textAlign: "start",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 4px 14px rgba(32,40,58,.025)",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          insetBlock: 13,
          insetInlineStart: 0,
          width: 3,
          borderRadius: 8,
          background: item.color,
          opacity: 0.78,
        }}
      />
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 46,
          height: 46,
          flex: "0 0 auto",
          borderRadius: 14,
          background: `${item.color}13`,
          color: item.color,
        }}
      >
        <Icon size={21} strokeWidth={1.9} />
      </span>
      <span style={{ display: "block", minWidth: 0, flex: 1 }}>
        <span
          style={{
            display: "block",
            color: BRAND.ink,
            fontSize: 13,
            fontWeight: 850,
            lineHeight: 1.4,
            overflowWrap: "anywhere",
          }}
        >
          {item.title}
        </span>
        <span
          style={{
            display: "block",
            marginTop: 4,
            color: BRAND.muted,
            fontSize: 10,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {item.subtitle}
        </span>
      </span>
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
          width: 27,
          height: 27,
          borderRadius: 9,
          background: "#F8F7F4",
          color: "#99A1AE",
        }}
      >
        {lang === "ar" ? <ArrowUpLeft size={14} /> : <ArrowUpRight size={14} />}
      </span>
    </motion.button>
  );
}
