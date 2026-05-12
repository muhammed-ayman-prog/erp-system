import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";

export default function Splash() {

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

    }, 2000);

    return () => clearTimeout(timer);

  }, [user, loading]);

  return (

    <div style={container}>

      <img
        src="/pwa-512.png"
        alt="logo"
        style={logo}
      />

      <h1 style={title}>
        A Perfume Story
      </h1>

      <p style={subtitle}>
        ERP SYSTEM
      </p>

      <div style={loader}></div>

    </div>

  );

}

const container = {

  minHeight: "100vh",

  background:
    "linear-gradient(135deg,#111827,#1f2937)",

  display: "flex",

  flexDirection: "column",

  justifyContent: "center",

  alignItems: "center",

  gap: 20
};

const logo = {

  width: 140,

  height: 140,

  objectFit: "contain"
};

const title = {

  color: "#fff",

  fontSize: 34,

  fontWeight: "700",

  margin: 0
};

const subtitle = {

  color: "#9ca3af",

  letterSpacing: 4,

  margin: 0
};

const loader = {

  width: 45,

  height: 45,

  border:
    "4px solid rgba(255,255,255,0.2)",

  borderTop:
    "4px solid #fff",

  borderRadius: "50%",

  animation:
    "spin 1s linear infinite"
};