import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../store/useAuth";
import { useTranslate } from "../useTranslate";
export default function Splash() {
  const { t, tt, lang } = useTranslate();
  const navigate = useNavigate();

  const { user, loading } = useAuth();

  useEffect(() => {

    if (loading) return;

    const timer = setTimeout(() => {

      if (user) {

        navigate("/dashboard");

      } else {

        navigate("/login");

      }

    }, 3200);

    return () => clearTimeout(timer);

  }, [user, loading]);

  return (

    <div style={container}>

      {/* Glow */}
      <motion.div

        initial={{
          scale: 0.8,
          opacity: 0
        }}

        animate={{
          scale: 1.3,
          opacity: 0.15
        }}

        transition={{
          duration: 2
        }}

        style={glow}
      />

      {/* Logo */}
      <motion.img

        src="/logo.png"

        alt="logo"

        initial={{
          opacity: 0,
          scale: 0.7,
          rotate: -8
        }}

        animate={{
          opacity: 1,
          scale: 1,
          rotate: 0
        }}

        transition={{
          duration: 1
        }}

        style={logo}
      />

      {/* Title */}
      <motion.h1

        initial={{
          opacity: 0,
          y: 20
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          delay: 0.5,
          duration: 0.8
        }}

        style={title}
      >
        A Perfume Story
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
          delay: 1,
          duration: 1
        }}

        style={subtitle}
      >
        ERP • Inventory • Analytics
      </motion.p>

      {/* Loading */}
      <motion.div

        initial={{
          width: 0
        }}

        animate={{
          width: 220
        }}

        transition={{
          delay: 1.4,
          duration: 1.3
        }}

        style={loadingBar}
      />

    </div>

  );

}

const container = {

  minHeight: "100vh",

  background:
    "linear-gradient(135deg,#0f172a,#111827,#1e293b)",

  display: "flex",

  flexDirection: "column",

  justifyContent: "center",

  alignItems: "center",

  overflow: "hidden",

  position: "relative"
};

const glow = {

  position: "absolute",

  width: 320,

  height: 320,

  borderRadius: "50%",

  background:
    "radial-gradient(circle, #d4a373, transparent)",

  filter: "blur(40px)"
};

const logo = {

  width: 150,

  marginBottom: 20,

  zIndex: 2,

  filter:
    "drop-shadow(0 10px 25px rgba(0,0,0,0.25))"
};

const title = {

  color: "#fff",

  fontSize: 38,

  fontWeight: 700,

  margin: 0,

  zIndex: 2,

  letterSpacing: 1
};

const subtitle = {

  color: "#cbd5e1",

  marginTop: 12,

  fontSize: 15,

  letterSpacing: 3,

  zIndex: 2
};

const loadingBar = {

  height: 4,

  marginTop: 35,

  borderRadius: 999,

  background:
    "linear-gradient(90deg,#d4a373,#fbbf24)",

  zIndex: 2,

  boxShadow:
    "0 4px 15px rgba(212,163,115,0.4)"
};