import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { auth } from "../firebase";

const getSavedEmail = () => {
  try {
    return localStorage.getItem("rememberEmail") || "";
  } catch {
    return "";
  }
};

const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password you entered is incorrect.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact your administrator.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Connection problem. Check your internet and try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return "We couldn't sign you in. Please try again.";
  }
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(getSavedEmail);
  const [remember, setRemember] = useState(Boolean(getSavedEmail()));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 3800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const showNotice = (message, type = "error") => {
    setNotice({ message, type });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      showNotice("Enter your email and password to continue.");
      return;
    }

    try {
      setLoading(true);
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, normalizedEmail, password);

      try {
        if (remember) {
          localStorage.setItem("rememberEmail", normalizedEmail);
        } else {
          localStorage.removeItem("rememberEmail");
        }
      } catch (storageError) {
        console.warn("Could not update remembered email:", storageError);
      }

      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      showNotice(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      showNotice("Enter your email address first.");
      return;
    }

    try {
      setResetting(true);
      await sendPasswordResetEmail(auth, normalizedEmail);
      showNotice("Password reset instructions have been sent to your email.", "success");
    } catch (error) {
      console.error("Password reset error:", error);
      const message = error?.code === "auth/invalid-email"
        ? "Please enter a valid email address."
        : error?.code === "auth/user-not-found"
        ? "No account was found with this email address."
        : "We couldn't send the reset email. Please try again.";
      showNotice(message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="aps-login-page">
      <style>{`
        @keyframes aps-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -13px, 0) rotate(1deg); }
        }
        @keyframes aps-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes aps-shimmer {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(130%); }
        }
        @keyframes aps-spin {
          to { transform: rotate(360deg); }
        }
        .aps-login-page {
          min-height: 100vh;
          min-height: 100svh;
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          color: #202838;
          background:
            radial-gradient(ellipse at 13% 18%, rgba(216, 179, 142, .19), transparent 32%),
            radial-gradient(ellipse at 82% 78%, rgba(194, 211, 231, .34), transparent 34%),
            linear-gradient(135deg, #fffdfa 0%, #f8f2e9 52%, #f2eee9 100%);
          font-family: inherit;
        }
        .aps-login-page * { box-sizing: border-box; }
        .aps-login-page button, .aps-login-page input { font: inherit; }
        .aps-login-noise {
          position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .2;
          background-image: radial-gradient(rgba(91, 75, 58, .17) .55px, transparent .55px);
          background-size: 6px 6px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }
        .aps-login-header {
          width: min(1240px, calc(100% - 64px));
          margin: 0 auto;
          padding: 27px 0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .aps-brand-lockup { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .aps-brand-logo {
          width: 42px; height: 42px; object-fit: contain; padding: 5px;
          border: 1px solid rgba(190, 151, 115, .28); border-radius: 13px;
          background: rgba(255,255,255,.72); box-shadow: 0 8px 22px rgba(80, 59, 39, .07);
        }
        .aps-brand-name { font-size: 11px; font-weight: 900; letter-spacing: .24em; white-space: nowrap; }
        .aps-header-meta { display: flex; align-items: center; gap: 9px; color: #897968; font-size: 9px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
        .aps-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #bd9168; box-shadow: 0 0 0 4px rgba(189,145,104,.13); }
        .aps-login-main {
          width: min(1240px, calc(100% - 64px));
          flex: 1; margin: 0 auto; padding: 24px 0 54px;
          display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(390px, .82fr);
          align-items: center; gap: clamp(48px, 8vw, 120px);
        }
        .aps-story-panel { position: relative; min-width: 0; padding: 26px 0 30px; }
        .aps-eyebrow { display: inline-flex; align-items: center; gap: 10px; color: #a77c58; font-size: 9px; font-weight: 900; letter-spacing: .28em; text-transform: uppercase; }
        .aps-eyebrow-line { width: 28px; height: 1px; background: #c89c75; }
        .aps-story-title {
          max-width: 640px; margin: 25px 0 22px; color: #222b3b;
          font-size: clamp(42px, 5.2vw, 72px); line-height: .99; letter-spacing: -.065em; font-weight: 800;
        }
        .aps-story-title em {
          display: block; color: #b98660; font-family: Georgia, 'Times New Roman', serif;
          font-weight: 400; font-style: italic; letter-spacing: -.055em;
        }
        .aps-story-copy { max-width: 480px; margin: 0; color: #778092; font-size: 14px; line-height: 2; }
        .aps-feature-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
        .aps-feature-pill {
          display: inline-flex; align-items: center; gap: 8px; padding: 10px 13px;
          border: 1px solid rgba(199, 181, 160, .34); border-radius: 999px;
          background: rgba(255,255,255,.48); color: #657084; font-size: 10px; font-weight: 800; letter-spacing: .07em;
        }
        .aps-feature-pill svg { color: #b88962; }
        .aps-visual-stage { position: absolute; width: 230px; height: 230px; right: 5%; bottom: -30px; pointer-events: none; opacity: .78; }
        .aps-visual-orbit { position: absolute; inset: 0; border: 1px solid rgba(195, 158, 122, .27); border-radius: 50%; animation: aps-orbit 36s linear infinite; }
        .aps-visual-orbit:before { content: ''; position: absolute; top: 18px; left: 27px; width: 7px; height: 7px; border-radius: 50%; background: #c69a73; box-shadow: 0 0 0 6px rgba(198,154,115,.12); }
        .aps-visual-orbit.second { inset: 21px; border-color: rgba(174, 193, 215, .42); animation-direction: reverse; animation-duration: 29s; }
        .aps-visual-mark { position: absolute; inset: 58px; display: grid; place-items: center; border-radius: 50%; background: rgba(255,255,255,.42); border: 1px solid rgba(255,255,255,.88); box-shadow: 0 24px 70px rgba(120, 96, 72, .08); animation: aps-float 7s ease-in-out infinite; }
        .aps-visual-mark img { width: 92px; height: 92px; object-fit: contain; mix-blend-mode: multiply; }
        .aps-form-wrap { width: 100%; max-width: 470px; justify-self: end; }
        .aps-form-card {
          position: relative; overflow: hidden; padding: clamp(28px, 4vw, 42px);
          border: 1px solid rgba(255,255,255,.86); border-radius: 27px;
          background: rgba(255,255,255,.72); backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
          box-shadow: 0 28px 85px rgba(76, 61, 46, .11), 0 3px 12px rgba(76, 61, 46, .035);
        }
        .aps-form-card:before { content: ''; position: absolute; top: 0; left: 12%; right: 12%; height: 1px; background: linear-gradient(90deg, transparent, rgba(194,151,111,.55), transparent); }
        .aps-form-logo-wrap { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 18px; margin-bottom: 27px; background: linear-gradient(145deg, #fff, #f4e9dc); border: 1px solid rgba(194,151,111,.25); box-shadow: 0 9px 24px rgba(110,83,59,.08); }
        .aps-form-logo-wrap img { width: 43px; height: 43px; object-fit: contain; }
        .aps-form-kicker { margin: 0 0 9px; color: #b1845f; font-size: 9px; font-weight: 900; letter-spacing: .25em; text-transform: uppercase; }
        .aps-form-title { margin: 0; color: #252e3e; font-size: clamp(27px, 3vw, 34px); line-height: 1.15; font-weight: 800; letter-spacing: -.045em; }
        .aps-form-subtitle { margin: 10px 0 28px; color: #838b99; font-size: 13px; line-height: 1.7; }
        .aps-field { margin-top: 17px; }
        .aps-field-label { display: block; margin: 0 0 9px; color: #515c6d; font-size: 11px; font-weight: 800; letter-spacing: .035em; }
        .aps-input-wrap { position: relative; }
        .aps-input-icon { position: absolute; top: 50%; left: 15px; transform: translateY(-50%); display: flex; color: #9a8c7d; pointer-events: none; }
        .aps-input {
          width: 100%; height: 53px; padding: 0 46px 0 45px; border-radius: 13px;
          border: 1px solid #e6dfd7; outline: none; background: rgba(255,255,255,.78);
          color: #283245; font-size: 13px; transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .aps-input::placeholder { color: #a9a9ad; }
        .aps-input:focus { border-color: #c49a74; background: #fff; box-shadow: 0 0 0 4px rgba(196,154,116,.13); }
        .aps-password-toggle { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: 9px; background: transparent; color: #88909d; cursor: pointer; }
        .aps-password-toggle:hover { background: #f6f1eb; color: #8f6949; }
        .aps-form-options { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 17px 0 22px; }
        .aps-remember { display: inline-flex; align-items: center; gap: 9px; color: #737d8c; font-size: 11px; cursor: pointer; user-select: none; }
        .aps-remember input { width: 15px; height: 15px; margin: 0; accent-color: #b88962; cursor: pointer; }
        .aps-text-button { padding: 0; border: 0; background: transparent; color: #a77c58; font-size: 11px; font-weight: 800; cursor: pointer; }
        .aps-text-button:hover { color: #805b3d; text-decoration: underline; }
        .aps-submit {
          position: relative; overflow: hidden; width: 100%; height: 54px; display: flex; align-items: center; justify-content: center; gap: 11px;
          border: 0; border-radius: 14px; background: linear-gradient(110deg, #b98a63 0%, #c99f7b 52%, #b1845f 100%);
          color: #fff; font-size: 13px; font-weight: 900; letter-spacing: .055em; cursor: pointer;
          box-shadow: 0 12px 24px rgba(167,124,88,.2); transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
        }
        .aps-submit:before { content: ''; position: absolute; inset: 0 auto 0 0; width: 45%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.23), transparent); transform: translateX(-130%); }
        .aps-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 28px rgba(167,124,88,.27); }
        .aps-submit:hover:not(:disabled):before { animation: aps-shimmer .9s ease; }
        .aps-submit:disabled { cursor: not-allowed; opacity: .72; }
        .aps-submit svg, .aps-submit span { position: relative; z-index: 1; }
        .aps-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.45); border-top-color: #fff; border-radius: 50%; animation: aps-spin .7s linear infinite; }
        .aps-security-note { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 21px; color: #96918a; font-size: 10px; }
        .aps-security-note svg { color: #a8896b; }
        .aps-login-footer { width: min(1240px, calc(100% - 64px)); margin: 0 auto; padding: 16px 0 22px; display: flex; align-items: center; justify-content: space-between; gap: 14px; border-top: 1px solid rgba(192,171,149,.28); color: #a39a90; font-size: 9px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
        .aps-notice { position: fixed; z-index: 20; top: 22px; right: 22px; width: min(390px, calc(100vw - 32px)); padding: 14px 16px; display: flex; align-items: flex-start; gap: 11px; border: 1px solid rgba(255,255,255,.85); border-radius: 14px; background: rgba(255,255,255,.94); box-shadow: 0 16px 45px rgba(52,43,34,.14); color: #4c5666; font-size: 12px; line-height: 1.6; }
        .aps-notice.success { border-color: #cfe6d7; }
        .aps-notice-icon { flex: 0 0 auto; width: 23px; height: 23px; display: grid; place-items: center; border-radius: 8px; background: #f8e9e4; color: #a65e48; }
        .aps-notice.success .aps-notice-icon { background: #e7f4eb; color: #39835a; }
        @media (max-width: 980px) {
          .aps-login-main { grid-template-columns: minmax(0, .95fr) minmax(360px, .9fr); gap: 38px; }
          .aps-story-title { font-size: clamp(40px, 5vw, 58px); }
          .aps-visual-stage { width: 180px; height: 180px; right: 0; bottom: -18px; }
        }
        @media (max-width: 760px) {
          .aps-login-header, .aps-login-main, .aps-login-footer { width: min(100% - 36px, 500px); }
          .aps-login-header { padding: 18px 0; }
          .aps-header-meta { font-size: 8px; letter-spacing: .12em; }
          .aps-login-main { display: block; padding: 28px 0 36px; }
          .aps-story-panel { display: none; }
          .aps-form-wrap { max-width: 480px; margin: 0 auto; }
          .aps-form-card { padding: 30px 25px; }
          .aps-login-footer { font-size: 8px; letter-spacing: .08em; }
        }
        @media (max-width: 420px) {
          .aps-brand-name { font-size: 9px; letter-spacing: .16em; }
          .aps-header-meta { max-width: 120px; text-align: right; line-height: 1.5; }
          .aps-form-card { padding: 26px 20px; border-radius: 22px; }
          .aps-form-options { align-items: flex-start; }
          .aps-login-footer span:last-child { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aps-login-page *, .aps-login-page *:before, .aps-login-page *:after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <div className="aps-login-noise" />

      <AnimateNotice notice={notice} />

      <header className="aps-login-header">
        <div className="aps-brand-lockup">
          <img className="aps-brand-logo" src="/logo.png" alt="A Perfume Story" />
          <span className="aps-brand-name">A PERFUME STORY</span>
        </div>
        <div className="aps-header-meta">
          <span className="aps-live-dot" />
          BUSINESS MANAGEMENT PLATFORM
        </div>
      </header>

      <main className="aps-login-main">
        <motion.section
          className="aps-story-panel"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="aps-eyebrow">
            <span className="aps-eyebrow-line" />
            THE A PERFUME STORY WORKSPACE
          </div>

          <h1 className="aps-story-title">
            Your business,
            <em>beautifully in sync.</em>
          </h1>

          <p className="aps-story-copy">
            A considered workspace for sales, inventory, branch operations and business insights — bringing every part of your brand together.
          </p>

          <div className="aps-feature-row">
            <span className="aps-feature-pill"><Check size={13} /> INVENTORY</span>
            <span className="aps-feature-pill"><ArrowUpRight size={13} /> SALES</span>
            <span className="aps-feature-pill"><Sparkles size={13} /> INSIGHTS</span>
          </div>

          <div className="aps-visual-stage" aria-hidden="true">
            <div className="aps-visual-orbit" />
            <div className="aps-visual-orbit second" />
            <div className="aps-visual-mark">
              <img src="/logo.png" alt="" />
            </div>
          </div>
        </motion.section>

        <motion.section
          className="aps-form-wrap"
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="aps-form-card">
            <div className="aps-form-logo-wrap">
              <img src="/logo.png" alt="A Perfume Story logo" />
            </div>

            <p className="aps-form-kicker">WELCOME TO YOUR WORKSPACE</p>
            <h2 className="aps-form-title">Welcome back.</h2>
            <p className="aps-form-subtitle">Sign in to continue to your business workspace.</p>

            <form onSubmit={handleLogin}>
              <div className="aps-field">
                <label className="aps-field-label" htmlFor="login-email">Email address</label>
                <div className="aps-input-wrap">
                  <span className="aps-input-icon"><Mail size={17} /></span>
                  <input
                    id="login-email"
                    className="aps-input"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="aps-field">
                <label className="aps-field-label" htmlFor="login-password">Password</label>
                <div className="aps-input-wrap">
                  <span className="aps-input-icon"><LockKeyhole size={17} /></span>
                  <input
                    id="login-password"
                    className="aps-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="aps-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="aps-form-options">
                <label className="aps-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Remember email
                </label>
                <button
                  className="aps-text-button"
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetting || loading}
                >
                  {resetting ? "Sending link..." : "Forgot password?"}
                </button>
              </div>

              <button className="aps-submit" type="submit" disabled={loading || resetting}>
                {loading ? (
                  <><span className="aps-spinner" /> <span>Signing you in...</span></>
                ) : (
                  <><span>Sign in to workspace</span> <ArrowRight size={17} /></>
                )}
              </button>
            </form>

            <div className="aps-security-note">
              <ShieldCheck size={15} />
              Secure access · Your account is protected
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="aps-login-footer">
        <span>© {new Date().getFullYear()} A PERFUME STORY</span>
        <span>ONE BRAND. ONE WORKSPACE.</span>
        <span>APS BUSINESS PLATFORM</span>
      </footer>
    </div>
  );
}

function AnimateNotice({ notice }) {
  if (!notice) return null;

  return (
    <motion.div
      className={`aps-notice ${notice.type === "success" ? "success" : ""}`}
      role="status"
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <span className="aps-notice-icon">
        {notice.type === "success" ? <Check size={14} /> : <KeyRound size={14} />}
      </span>
      <span>{notice.message}</span>
    </motion.div>
  );
}
