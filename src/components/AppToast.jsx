import { createPortal } from "react-dom";

export default function AppToast({
  mounted,
  showToast,
  toastText,
  lang,
  theme
}) {

  if (!mounted || !showToast) {
    return null;
  }

  return createPortal(

    <div
      style={{
        position: "fixed",

        bottom: "30px",

        left: "50%",

        direction:
          lang === "ar"
            ? "rtl"
            : "ltr",

        transform:
          "translateX(-50%)",

        background:
          theme.colors.primary,

        padding: "12px 20px",

        borderRadius: "12px",

        color: "#fff",

        fontSize: "14px",

        boxShadow:
          "0 10px 30px rgba(0,0,0,0.4)",

        border:
          "1px solid rgba(255,255,255,0.2)",

        zIndex: 9999,

        animation:
          "fadeSlide 0.3s ease"
      }}
    >

      {toastText}

    </div>,

    document.body
  );
}