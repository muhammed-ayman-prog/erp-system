import {
  motion
} from "framer-motion";

import {
  useEffect,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";
import { useApp } from "../store/useApp";
import { branchNames } from "../constants/branches";
import {
collection,
onSnapshot,
query,
where
} from "firebase/firestore";

import { db } from "../firebase";
import {

  ShoppingCart,

  Boxes,

  RefreshCw,

  Receipt,

  Users2,

  BarChart3

} from "lucide-react";
export default function Home() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const { selectedBranch } = useApp();
  const [todaySales, setTodaySales] =
  useState(0);

const [todayOrders, setTodayOrders] =
  useState(0);

  const currentHour =
    new Date().getHours();

  const currentDate =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );

  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
      ? "Good Afternoon"
      : "Good Evening";
useEffect(() => {

  const todayStart = new Date();

todayStart.setHours(0, 0, 0, 0);

const todayEnd = new Date();

todayEnd.setHours(23, 59, 59, 999);

let salesQuery = query(

  collection(db, "sales"),

  where(
    "createdAt",
    ">=",
    todayStart
  ),

  where(
    "createdAt",
    "<=",
    todayEnd
  )

);

const unsubscribe = onSnapshot(

  salesQuery,

  (snap) => {

    let total = 0;

    let orders = 0;

    snap.docs.forEach((doc) => {

      const data = doc.data();

      if (

        selectedBranch === "all" ||

        data.branchId ===
          selectedBranch

      ) {

        total +=
          Number(data.total || 0);

        orders += 1;

      }

    });

    setTodaySales(total);

    setTodayOrders(orders);

  }

);

  return () => unsubscribe();

}, [selectedBranch]);
  const quickActions = [

  {
    title: "New Sale",
    icon: ShoppingCart,
    path: "/sales",
    color: "#10b981"
  },

  {
    title: "Inventory",
    icon: Boxes,
    path: "/inventory",
    color: "#3b82f6"
  },

  {
    title: "Returns",
    icon: RefreshCw,
    path: "/returns",
    color: "#f59e0b"
  },

  {
    title: "Expenses",
    icon: Receipt,
    path: "/expenses",
    color: "#ef4444"
  },

  {
    title: "Customers",
    icon: Users2,
    path: "/customers",
    color: "#8b5cf6"
  },

  {
    title: "Reports",
    icon: BarChart3,
    path: "/reports",
    color: "#06b6d4"
  }

];

  return (

    <div style={container}>

      {/* Animated Background */}
      <motion.div

        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.12, 0.18, 0.12]
        }}

        transition={{
          duration: 8,
          repeat: Infinity
        }}

        style={glowOne}
      />

      <motion.div

        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.16, 0.1]
        }}

        transition={{
          duration: 10,
          repeat: Infinity
        }}

        style={glowTwo}
      />

      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (

        <motion.div

          key={i}

          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.35, 0.15]
          }}

          transition={{
            duration: 4 + i,
            repeat: Infinity
          }}

          style={{
            ...particle,

            left: `${Math.random() * 100}%`,

            top: `${Math.random() * 100}%`
          }}
        />

      ))}

      {/* Main Card */}
      <motion.div

        initial={{
          opacity: 0,
          y: 40
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          duration: 0.9,
ease: "easeOut"
        }}

        style={card}
      >

        {/* Top Info */}
        <div style={topInfo}>

          <div>

            <p style={dateText}>
              {currentDate}
            </p>

            <h2 style={branchText}>

            {selectedBranch === "all"

                ? "All Branches"

                : branchNames[selectedBranch] ||
                "Unknown Branch"}

            </h2>

          </div>

        </div>

        {/* Logo */}
        <motion.img

          src="/logo.png"

          alt="logo"

          animate={{
            y: [0, -10, 0],
            rotate: [0, 1, -1, 0]
          }}

          transition={{
            repeat: Infinity,
            duration: 5
          }}

          style={logo}
        />

        {/* Greeting */}
        <motion.p

          initial={{
            opacity: 0
          }}

          animate={{
            opacity: 1
          }}

          transition={{
            delay: 0.2
          }}

          style={greetingStyle}
        >
          {greeting}
        </motion.p>

        {/* User */}
        <motion.h1

          initial={{
            opacity: 0,
            y: 15
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            delay: 0.4
          }}

          style={title}
        >
          Welcome back,
          <br />
          {user?.name || "User"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p

          initial={{
            opacity: 0
          }}

          animate={{
            opacity: 1
          }}

          transition={{
            delay: 0.6
          }}

          style={subtitle}
        >
          Ready to manage today’s operations?
        </motion.p>

        {/* Stats */}
        <motion.div

          initial={{
            opacity: 0,
            y: 20
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            delay: 0.8
          }}

          style={statsGrid}
        >

          <StatCard
            value={`${todaySales.toLocaleString()} EGP`}
            label="Today Sales"
          />

          <StatCard
            value={todayOrders}
            label="Orders"
          />

          <StatCard
            value="3"
            label="Alerts"
          />

        </motion.div>

        {/* Quick Actions */}
        <motion.div

          initial={{
            opacity: 0
          }}

          animate={{
            opacity: 1
          }}

          transition={{
            delay: 1
          }}

          style={actionsGrid}
        >

          {quickActions.map((item) => (

            <ActionCard

  key={item.title}

  title={item.title}

  icon={item.icon}

  color={item.color}

  onClick={() =>
    navigate(item.path)
  }
/>

          ))}

        </motion.div>

      </motion.div>

    </div>

  );

}

function StatCard({
  value,
  label
}) {

  return (

    <motion.div

      whileHover={{
        y: -4,
        scale: 1.02
      }}

      style={statCard}
    >

      <h3 style={statValue}>
        {value}
      </h3>

      <p style={statLabel}>
        {label}
      </p>

    </motion.div>

  );

}

function ActionCard({

  title,

  icon: Icon,

  color,

  onClick

}) {

  return (

    <motion.div

      whileHover={{
        y: -8,
        scale: 1.04
      }}

      whileTap={{
        scale: 0.98
      }}

      onClick={onClick}

      style={actionCard}
    >

      <motion.div

        whileHover={{
          rotate: 8,
          scale: 1.1
        }}

        style={actionIcon}
      >
        <Icon

  size={34}

  color={color}

/>
      </motion.div>

      <p style={actionText}>
        {title}
      </p>

    </motion.div>

  );

}

const container = {

  minHeight: "85vh",

  position: "relative",

  overflow: "hidden",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  padding: 24,

  background:
    "linear-gradient(135deg,#f8f5f0 0%,#f3ece2 50%,#efe7dc 100%)"
};

const glowOne = {

  position: "absolute",

  width: 450,

  height: 450,

  borderRadius: "50%",

  background:
    "rgba(212,163,115,0.18)",

  filter: "blur(120px)",

  top: -120,

  left: -120
};

const glowTwo = {

  position: "absolute",

  width: 380,

  height: 380,

  borderRadius: "50%",

  background:
    "rgba(180,140,100,0.14)",

  filter: "blur(120px)",

  bottom: -120,

  right: -120
};

const particle = {

  position: "absolute",

  width: 8,

  height: 8,

  borderRadius: "50%",

  background:
    "rgba(176,137,104,0.25)",

  filter: "blur(1px)"
};

const card = {

  width: "100%",

  maxWidth: 1000,

  background:
    "rgba(255,255,255,0.58)",

  backdropFilter: "blur(22px)",

  WebkitBackdropFilter:
    "blur(22px)",

  border:
    "1px solid rgba(255,255,255,0.5)",

  borderRadius: 42,

  padding:
  window.innerWidth < 768
    ? 24
    : 50,

  position: "relative",

  zIndex: 2,

  boxShadow:
    "0 25px 80px rgba(0,0,0,0.08)"
};

const topInfo = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  marginBottom: 20
};

const dateText = {

  margin: 0,

  color: "#64748b",

  fontSize: 14
};

const branchText = {

  marginTop: 8,

  color: "#111827",

  fontSize: 20
};

const logo = {

  width:
  window.innerWidth < 768
    ? 100
    : 130,

  display: "block",

  margin:
    "0 auto 22px",

  filter:
    "drop-shadow(0 10px 25px rgba(0,0,0,0.18))"
};

const greetingStyle = {

  textAlign: "center",

  color: "#b08968",

  marginBottom: 10,

  fontWeight: 700,

  fontSize: 15,

  letterSpacing: 1
};

const title = {

  textAlign: "center",

  fontSize:
  window.innerWidth < 768
    ? 34
    : 48,

  lineHeight: 1.2,

  margin: 0,

  color: "#111827",

  fontWeight: 800
};

const subtitle = {

  textAlign: "center",

  color: "#64748b",

  marginTop: 18,

  marginBottom: 40,

  fontSize: 17
};

const statsGrid = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",

  gap: 18,

  marginBottom: 35
};

const statCard = {

  background:
    "rgba(255,255,255,0.72)",

  borderRadius: 26,

  padding: 24,

  textAlign: "center",

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.05)"
};

const statValue = {

  margin: 0,

  fontSize: 26,

  color: "#111827"
};

const statLabel = {

  marginTop: 10,

  color: "#64748b",

  fontSize: 14
};

const actionsGrid = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit,minmax(170px,1fr))",

  gap: 22
};

const actionCard = {

  background:
    "linear-gradient(135deg,#ffffff,#f8fafc)",

  borderRadius: 30,

  padding: 30,

  textAlign: "center",

  cursor: "pointer",
  userSelect: "none",

  boxShadow:
    "0 18px 40px rgba(0,0,0,0.06)",

  border:
    "1px solid rgba(255,255,255,0.8)",

  transition: "0.3s"
};

const actionIcon = {

  width: 74,

  height: 74,

  borderRadius: "22px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  margin:
    "0 auto 18px",

  background:
    "rgba(255,255,255,0.75)",

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.08)",

  backdropFilter: "blur(10px)"
};

const actionText = {

  margin: 0,

  fontWeight: 700,

  fontSize: 16,

  color: "#1e293b"
};