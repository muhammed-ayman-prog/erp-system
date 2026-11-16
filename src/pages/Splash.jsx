import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Boxes, ChartNoAxesCombined, ShieldCheck } from "lucide-react";

import { useAuth } from "../store/useAuth";

const REDIRECT_DELAY = 3200;

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (loading) return undefined;

    const timer = window.setTimeout(() => {
      navigate(user ? "/dashboard" : "/login", { replace: true });
    }, REDIRECT_DELAY);

    return () => window.clearTimeout(timer);
  }, [user, loading, navigate]);

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
  });

  const loadingMessage = loading
    ? "RESTORING YOUR SESSION"
    : user
      ? "WELCOME BACK — OPENING YOUR WORKSPACE"
      : "PREPARING YOUR SECURE SIGN IN";

  return (
    <main className="aps-intro">
      <style>{`
        .aps-intro, .aps-intro * { box-sizing: border-box; }
        .aps-intro {
          --ink: #202B3D;
          --muted: #7B8190;
          --champagne: #C69A70;
          --champagne-deep: #AD805A;
          --blue: #8FAED8;
          position: relative;
          isolation: isolate;
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          flex-direction: column;
          overflow: hidden;
          padding: 30px clamp(22px, 5.2vw, 82px) 22px;
          color: var(--ink);
          background:
            radial-gradient(ellipse at 78% 46%, rgba(212, 226, 246, .43) 0%, transparent 34%),
            radial-gradient(ellipse at 18% 12%, rgba(255, 255, 255, .78) 0%, transparent 34%),
            linear-gradient(118deg, #FCF7F0 0%, #F7EEE3 53%, #F8F3ED 100%);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .aps-intro::before {
          position: absolute;
          z-index: -2;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(173, 128, 90, .027) 1px, transparent 1px),
            linear-gradient(90deg, rgba(173, 128, 90, .027) 1px, transparent 1px);
          background-size: 68px 68px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,.30), transparent 82%);
          content: "";
        }
        .aps-intro__grain {
          position: absolute;
          z-index: -1;
          inset: 0;
          pointer-events: none;
          opacity: .035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='.3'/%3E%3C/svg%3E");
        }
        .aps-intro__ambient {
          position: absolute;
          z-index: -1;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(2px);
          will-change: transform;
        }
        .aps-intro__ambient--top {
          top: -245px;
          right: 9%;
          width: 560px;
          height: 560px;
          background: radial-gradient(circle, rgba(224, 204, 180, .31), rgba(226, 235, 247, .18) 45%, transparent 72%);
          animation: aps-intro-ambient 12s ease-in-out infinite;
        }
        .aps-intro__ambient--bottom {
          bottom: -290px;
          left: -130px;
          width: 580px;
          height: 580px;
          background: radial-gradient(circle, rgba(211, 225, 244, .43), rgba(247, 234, 218, .12) 52%, transparent 72%);
          animation: aps-intro-ambient 15s ease-in-out infinite reverse;
        }
        .aps-intro__header, .aps-intro__footer {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }
        .aps-intro__header { min-height: 40px; }
        .aps-intro__brand { display: inline-flex; align-items: center; gap: 12px; }
        .aps-intro__brand-mark {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border: 1px solid rgba(191, 151, 111, .34);
          border-radius: 13px;
          color: #936B49;
          background: linear-gradient(145deg, #FFFDF9, #F4E9DB);
          box-shadow: 0 7px 20px rgba(127, 91, 58, .08), inset 0 1px 0 #FFFFFF;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: -1px;
        }
        .aps-intro__brand-name {
          color: #364052;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 2.7px;
          white-space: nowrap;
        }
        .aps-intro__edition {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #8C8176;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.7px;
          white-space: nowrap;
        }
        .aps-intro__edition::before {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--champagne);
          box-shadow: 0 0 0 4px rgba(198,154,112,.12);
          content: "";
        }
        .aps-intro__main {
          position: relative;
          z-index: 1;
          display: grid;
          flex: 1;
          width: min(100%, 1190px);
          margin: 0 auto;
          grid-template-columns: minmax(0, 1.04fr) minmax(360px, .96fr);
          align-items: center;
          gap: clamp(34px, 7vw, 104px);
          padding: 42px 0 48px;
        }
        .aps-intro__copy { max-width: 610px; }
        .aps-intro__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 26px;
          color: var(--champagne-deep);
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 2.65px;
        }
        .aps-intro__eyebrow-line {
          width: 34px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--champagne));
        }
        .aps-intro__headline {
          margin: 0;
          color: #202B3D;
          font-size: clamp(48px, 6vw, 78px);
          font-weight: 740;
          letter-spacing: -4.5px;
          line-height: .99;
        }
        .aps-intro__headline-accent {
          display: block;
          color: #B8875F;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 1.04em;
          font-weight: 500;
          font-style: italic;
          letter-spacing: -3.2px;
          line-height: 1.08;
        }
        .aps-intro__headline-accent::after {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 0 7px 12px;
          border-radius: 50%;
          background: #C69A70;
          box-shadow: 0 0 0 5px rgba(198,154,112,.11), 0 0 18px rgba(198,154,112,.28);
          content: "";
          animation: aps-intro-dot 2.8s ease-in-out infinite;
        }
        .aps-intro__description {
          max-width: 470px;
          margin: 25px 0 0;
          color: #747C89;
          font-size: clamp(13px, 1.25vw, 15px);
          line-height: 1.9;
          letter-spacing: .08px;
        }
        .aps-intro__capabilities {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 13px;
          margin-top: 31px;
          color: #687181;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 1.1px;
        }
        .aps-intro__capability { display: inline-flex; align-items: center; gap: 8px; }
        .aps-intro__capability svg { color: #A9825F; }
        .aps-intro__capability-separator { width: 3px; height: 3px; border-radius: 50%; background: #D0B49A; }
        .aps-intro__progress { width: min(100%, 370px); margin-top: 53px; }
        .aps-intro__progress-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          color: #91877D;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.25px;
        }
        .aps-intro__progress-state { display: inline-flex; align-items: center; gap: 7px; color: #A88A6F; }
        .aps-intro__progress-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--champagne); box-shadow: 0 0 0 4px rgba(198,154,112,.12); }
        .aps-intro__track { position: relative; width: 100%; height: 2px; overflow: hidden; border-radius: 99px; background: rgba(188, 163, 139, .24); }
        .aps-intro__track::after {
          position: absolute;
          inset-block: 0;
          inset-inline-start: 0;
          width: 35%;
          border-radius: inherit;
          background: linear-gradient(90deg, transparent, #C69A70, #E2C8AC, transparent);
          content: "";
          animation: aps-intro-progress 1.9s ease-in-out infinite;
        }
        .aps-intro__art {
          position: relative;
          display: grid;
          width: min(100%, 485px);
          aspect-ratio: 1 / 1.02;
          place-items: center;
          justify-self: center;
          isolation: isolate;
        }
        .aps-intro__art-glow {
          position: absolute;
          z-index: -2;
          width: 78%;
          height: 78%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(220, 195, 166, .42) 0%, rgba(231, 237, 247, .42) 38%, transparent 73%);
          filter: blur(20px);
          animation: aps-intro-glow 5.5s ease-in-out infinite;
        }
        .aps-intro__orbit {
          position: absolute;
          z-index: -1;
          width: 94%;
          height: 91%;
          border: 1px solid rgba(191, 157, 124, .20);
          border-radius: 50%;
          pointer-events: none;
          animation: aps-intro-orbit 7s ease-in-out infinite;
        }
        .aps-intro__orbit--inner {
          width: 83%;
          height: 82%;
          border-color: rgba(151, 178, 211, .23);
          transform: rotate(24deg);
          animation-delay: -3s;
          animation-duration: 8.5s;
        }
        .aps-intro__spark {
          position: absolute;
          z-index: 2;
          width: 6px;
          height: 6px;
          border: 1px solid rgba(255,255,255,.95);
          border-radius: 50%;
          background: #C69A70;
          box-shadow: 0 0 0 4px rgba(198,154,112,.10), 0 0 14px rgba(198,154,112,.35);
          pointer-events: none;
        }
        .aps-intro__spark--one { top: 17%; right: 16%; animation: aps-intro-spark 4.2s ease-in-out infinite; }
        .aps-intro__spark--two { bottom: 21%; left: 13%; width: 4px; height: 4px; background: #9FB8D8; box-shadow: 0 0 0 4px rgba(159,184,216,.13), 0 0 13px rgba(159,184,216,.4); animation: aps-intro-spark 5s ease-in-out -1.8s infinite; }
        .aps-intro__art-frame {
          position: relative;
          display: grid;
          width: 76%;
          height: 82%;
          place-items: center;
          overflow: hidden;
          border: 1px solid rgba(188, 151, 116, .23);
          border-radius: 46% 46% 34px 34px;
          background: linear-gradient(155deg, rgba(255, 253, 249, .88), rgba(245, 234, 220, .64));
          box-shadow: 0 34px 90px rgba(113, 85, 59, .11), inset 0 1px 0 rgba(255,255,255,.98);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          will-change: transform;
        }
        .aps-intro__art-frame::before {
          position: absolute;
          inset: 14px;
          border: 1px solid rgba(198, 154, 112, .19);
          border-radius: 46% 46% 25px 25px;
          pointer-events: none;
          content: "";
        }
        .aps-intro__art-frame::after {
          position: absolute;
          top: 18%;
          right: -18%;
          width: 68%;
          height: 58%;
          border: 1px solid rgba(153, 181, 215, .23);
          border-radius: 50%;
          transform: rotate(-28deg);
          content: "";
        }
        .aps-intro__logo-wrap {
          position: relative;
          display: grid;
          width: 66%;
          aspect-ratio: 1;
          place-items: center;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.95);
          border-radius: 28px;
          background: linear-gradient(145deg, rgba(255,255,255,.86), rgba(250,243,233,.9));
          box-shadow: 0 20px 45px rgba(130, 100, 70, .10), 0 3px 12px rgba(133, 161, 199, .08);
          transform: translateZ(0);
        }
        .aps-intro__logo-wrap::after {
          position: absolute;
          top: -45%;
          bottom: -45%;
          left: -75%;
          width: 38%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.68), transparent);
          content: "";
          pointer-events: none;
          transform: rotate(22deg);
          animation: aps-intro-sheen 5.8s ease-in-out 1.1s infinite;
        }
        .aps-intro__logo {
          width: 82%;
          height: 82%;
          object-fit: contain;
          filter: drop-shadow(0 8px 13px rgba(104, 72, 44, .10));
        }
        .aps-intro__art-caption {
          position: absolute;
          bottom: 8%;
          left: 0;
          right: 0;
          text-align: center;
          color: #938271;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 3.2px;
        }
        .aps-intro__art-index {
          position: absolute;
          top: 13%;
          left: 11%;
          color: rgba(164, 131, 101, .7);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          font-style: italic;
          letter-spacing: 1px;
        }
        .aps-intro__art-rule {
          position: absolute;
          top: 20%;
          right: 12%;
          width: 42px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(169, 132, 98, .65));
        }
        .aps-intro__footer {
          min-height: 38px;
          border-top: 1px solid rgba(190, 164, 140, .30);
          padding-top: 15px;
          color: #9A9188;
          font-size: 8px;
          font-weight: 750;
          letter-spacing: 1.35px;
        }
        .aps-intro__footer-brand { display: inline-flex; align-items: center; gap: 7px; }
        .aps-intro__footer-brand svg { color: #B98D68; }
        @keyframes aps-intro-progress { 0% { transform: translateX(-125%); } 100% { transform: translateX(410%); } }
        @keyframes aps-intro-ambient {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(24px, -18px, 0) scale(1.07); }
        }
        @keyframes aps-intro-glow {
          0%, 100% { opacity: .62; transform: scale(.94); }
          50% { opacity: .96; transform: scale(1.08); }
        }
        @keyframes aps-intro-orbit {
          0%, 100% { opacity: .38; }
          50% { opacity: .82; }
        }
        @keyframes aps-intro-sheen {
          0%, 12% { left: -75%; opacity: 0; }
          20% { opacity: .9; }
          48%, 100% { left: 145%; opacity: 0; }
        }
        @keyframes aps-intro-spark {
          0%, 100% { opacity: .48; transform: translate3d(0, 0, 0) scale(.8); }
          50% { opacity: 1; transform: translate3d(5px, -11px, 0) scale(1.2); }
        }
        @keyframes aps-intro-dot {
          0%, 100% { opacity: .65; transform: scale(.82); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @media (max-width: 850px) {
          .aps-intro { padding: 22px 24px 18px; }
          .aps-intro__main { grid-template-columns: 1fr; gap: 8px; padding: 24px 0 34px; text-align: center; }
          .aps-intro__art { order: 1; width: min(66vw, 330px); }
          .aps-intro__copy { order: 2; max-width: 620px; margin: 0 auto; }
          .aps-intro__eyebrow, .aps-intro__capabilities { justify-content: center; }
          .aps-intro__description, .aps-intro__progress { margin-inline: auto; }
          .aps-intro__progress { margin-top: 33px; text-align: left; }
          .aps-intro__headline { font-size: clamp(43px, 8.6vw, 65px); letter-spacing: -2.8px; }
          .aps-intro__headline-accent { letter-spacing: -2px; }
        }
        @media (max-width: 480px) {
          .aps-intro { padding-inline: 17px; }
          .aps-intro__header { min-height: 34px; }
          .aps-intro__brand-mark { width: 32px; height: 32px; border-radius: 11px; }
          .aps-intro__brand-name { font-size: 8px; letter-spacing: 1.8px; }
          .aps-intro__edition { font-size: 7px; letter-spacing: .9px; }
          .aps-intro__main { padding-top: 16px; }
          .aps-intro__art { width: min(72vw, 285px); }
          .aps-intro__art-frame { border-radius: 46% 46% 25px 25px; }
          .aps-intro__logo-wrap { border-radius: 22px; }
          .aps-intro__headline { font-size: clamp(39px, 10.5vw, 51px); }
          .aps-intro__description { font-size: 12px; }
          .aps-intro__capabilities { gap: 9px; font-size: 8px; }
          .aps-intro__progress { margin-top: 26px; }
          .aps-intro__footer { justify-content: center; flex-wrap: wrap; gap: 8px 16px; font-size: 7px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aps-intro *, .aps-intro *::before, .aps-intro *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="aps-intro__grain" aria-hidden="true" />
      <div className="aps-intro__ambient aps-intro__ambient--top" aria-hidden="true" />
      <div className="aps-intro__ambient aps-intro__ambient--bottom" aria-hidden="true" />

      <motion.header className="aps-intro__header" {...reveal(0.02)}>
        <div className="aps-intro__brand">
          <span className="aps-intro__brand-mark">APS</span>
          <span className="aps-intro__brand-name">A PERFUME STORY</span>
        </div>
        <div className="aps-intro__edition">BUSINESS MANAGEMENT PLATFORM</div>
      </motion.header>

      <section className="aps-intro__main">
        <motion.div className="aps-intro__copy" {...reveal(0.12)}>
          <div className="aps-intro__eyebrow">
            <span className="aps-intro__eyebrow-line" />
            THE A PERFUME STORY WORKSPACE
          </div>

          <h1 className="aps-intro__headline">
            One brand.
            <motion.span
              className="aps-intro__headline-accent"
              initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(7px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={reduceMotion ? { duration: 0 } : { delay: 0.48, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              Every detail in harmony.
            </motion.span>
          </h1>

          <p className="aps-intro__description">
            A considered space for sales, inventory, branch operations and business insights — bringing every part of your brand together.
          </p>

          <motion.div
            className="aps-intro__capabilities"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.82, duration: 0.7, ease: "easeOut" }}
          >
            <span className="aps-intro__capability"><Boxes size={14} /> INVENTORY</span>
            <span className="aps-intro__capability-separator" />
            <span className="aps-intro__capability"><ArrowUpRight size={14} /> SALES</span>
            <span className="aps-intro__capability-separator" />
            <span className="aps-intro__capability"><ChartNoAxesCombined size={14} /> INSIGHTS</span>
          </motion.div>

          <motion.div
            className="aps-intro__progress"
            initial={reduceMotion ? false : { opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 1.02, duration: 0.65, ease: "easeOut" }}
          >
            <div className="aps-intro__progress-label">
              <span>{loadingMessage}</span>
              <span className="aps-intro__progress-state"><i className="aps-intro__progress-dot" /> PLEASE WAIT</span>
            </div>
            <div className="aps-intro__track" role="progressbar" aria-label="Loading" />
          </motion.div>
        </motion.div>

        <motion.div className="aps-intro__art" {...reveal(0.28)} aria-label="A Perfume Story brand mark">
          <div className="aps-intro__art-glow" />
          <motion.div
            className="aps-intro__orbit"
            animate={reduceMotion ? undefined : { rotate: [0, 7, 0], scale: [0.98, 1.025, 0.98] }}
            transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="aps-intro__orbit aps-intro__orbit--inner"
            animate={reduceMotion ? undefined : { rotate: [24, 14, 24], scale: [1.02, 0.97, 1.02] }}
            transition={reduceMotion ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="aps-intro__spark aps-intro__spark--one" aria-hidden="true" />
          <span className="aps-intro__spark aps-intro__spark--two" aria-hidden="true" />
          <motion.div
            className="aps-intro__art-frame"
            animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [0, 0.35, 0] }}
            transition={reduceMotion ? undefined : { duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="aps-intro__art-index">No. 01</span>
            <span className="aps-intro__art-rule" />
            <motion.div
              className="aps-intro__logo-wrap"
              animate={reduceMotion ? undefined : { y: [0, -3, 0], scale: [1, 1.012, 1] }}
              transition={reduceMotion ? undefined : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.img
                className="aps-intro__logo"
                src="/logo.png"
                alt="A Perfume Story"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduceMotion ? { duration: 0 } : { delay: 0.72, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
            <div className="aps-intro__art-caption">A PERFUME STORY</div>
          </motion.div>
        </motion.div>
      </section>

      <motion.footer className="aps-intro__footer" {...reveal(0.45)}>
        <span className="aps-intro__footer-brand"><ShieldCheck size={12} /> YOUR BUSINESS, IN GOOD HANDS</span>
        <span>APS {import.meta.env.VITE_APP_VERSION || ""}</span>
        <span>© {new Date().getFullYear()} A PERFUME STORY</span>
      </motion.footer>
    </main>
  );
}
