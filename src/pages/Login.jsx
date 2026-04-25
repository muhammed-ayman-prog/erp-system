import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";

export default function Login() {
  const savedEmail = localStorage.getItem("rememberEmail") || "";

  const [email, setEmail] = useState(savedEmail);
  const [remember, setRemember] = useState(!!savedEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      return showToast("اكتب الإيميل والباسورد");
    }

    try {
      setLoading(true);

      


      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      if (remember) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }
      navigate("/home");

    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        showToast("Email أو Password غلط");
      } else {
        showToast("حصل خطأ، حاول تاني");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return showToast("اكتب الإيميل الأول");

    try {
      await sendPasswordResetEmail(auth, email);
      showToast("تم إرسال رابط الاسترجاع 📩");
    } catch {
      showToast("حصل خطأ");
    }
  };

  return (
    <div
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #fdf6ee, #f5e9da)",
    position: "relative",   // مهم
    overflow: "hidden"      // مهم
  }}
  
>
  
  
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#111",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            zIndex: 999
          }}
        >
          {toast}
        </div>
      )}

      {/* Card */}
      <div
        style={{
          background: "rgba(255,255,255,0.15)",  // 👈 شفافية أعلى
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          position: "relative",
          padding: "35px 30px",
          borderRadius: "20px",
          width: "360px",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)" 
        }}
      >
        {/* Logo (background style) */}
      <img
      src="/logo.png"
      alt="logo"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "220px",
        opacity: 0.04,
        pointerEvents: "none" // 🔥 الحل هنا
      }}
    />
      
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <img src="/logo.png" alt="logo" style={{ width: "55px" }} />
      </div>
        <h2 style={{ marginBottom: "5px", fontWeight: "600" }}>
          Welcome back
        </h2>

        <p style={{
          marginBottom: "25px",
          color: "#64748b",
          fontSize: "14px"
        }}>
          Login to your account
        </p>

        {/* Email */}
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <span style={{ position: "absolute", top: "12px", left: "12px" }}>
            <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2">
              <rect x="2" y="4" width="12" height="8" rx="2" />
              <path d="M2 4l6 4 6-4" />
            </svg>
          </span>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => {
            const value = e.target.value;
            setEmail(value);

            if (remember) {
              localStorage.setItem("rememberEmail", value);
            }
          }}
            style={{
              width: "100%",
              padding: "12px 12px 12px 36px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.1)",
              outline: "none",
              transition: "0.25s",
              fontSize: "14px"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#d4a373";
e.target.style.boxShadow = "0 0 0 3px rgba(212,163,115,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Password */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <span style={{ position: "absolute", top: "12px", left: "12px" }}>
            <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2">
              <rect x="3" y="7" width="10" height="6" rx="2" />
              <path d="M5 7V5a3 3 0 016 0v2" />
            </svg>
          </span>

          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 36px",
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.1)",
              outline: "none",
              transition: "0.25s",
              fontSize: "14px"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#d4a373";
e.target.style.boxShadow = "0 0 0 3px rgba(212,163,115,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />

            <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              cursor: "pointer",
              fontSize: "14px",
              opacity: 0.7
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* Remember + Forgot */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            fontSize: "13px"
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={remember}
              style={{ accentColor: "#b08968" }}
              onChange={(e) => {
              const checked = e.target.checked;
              setRemember(checked);

              if (checked) {
                localStorage.setItem("rememberEmail", email);
              } else {
                localStorage.removeItem("rememberEmail");
              }
            }}
            />{" "}
            Remember me
          </label>

          <span
            onClick={handleResetPassword}
            style={{ cursor: "pointer", color: "#b08968" }}
          >
            Forgot?
          </span>
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #d4a373, #b08968)",
            color: "#fff",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          {loading && (
            <span
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #fff",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}
            />
          )}
          {loading ? "Signing in..." : "Login"}
        </button>
        
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
            @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}