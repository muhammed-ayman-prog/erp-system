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
  const [email, setEmail] = useState(localStorage.getItem("rememberEmail") || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(!!localStorage.getItem("rememberEmail"));
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

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await auth.signOut();
        return showToast("User data not found");
      }

      const userData = docSnap.data();

      if (userData.status === "disabled") {
        await auth.signOut();
        return showToast("Account Disabled ❌");
      }

      const finalUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData.name || "",
        role: userData.role || "user",
        branchId: userData.branchId || "all",
        permissions:
          userData.permissions && userData.permissions.length > 0
            ? userData.permissions
            : [
                "view_sales",
                "view_reports",
                "view_inventory",
                "view_customers",
                "view_branches",
                "view_users",
                "view_settings",
                "view_operations"
              ]
      };

      if (remember) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      setUser(finalUser);
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
        background: "#f8fafc"
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
          background: "#fff",
          padding: "40px",
          borderRadius: "20px",
          width: "360px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.12)",
          animation: "fadeIn 0.4s ease"
        }}
      >
        <h2 style={{ marginBottom: "5px" }}>Welcome back</h2>
        <p style={{ marginBottom: "20px", color: "#64748b", fontSize: "14px" }}>
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
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 36px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              outline: "none"
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
              padding: "12px 40px 12px 36px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              outline: "none"
            }}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              cursor: "pointer"
            }}
          >
            👁
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
              onChange={() => setRemember(!remember)}
            />{" "}
            Remember me
          </label>

          <span
            onClick={handleResetPassword}
            style={{ cursor: "pointer", color: "#3b82f6" }}
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
            background: loading
              ? "#94a3b8"
              : "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}