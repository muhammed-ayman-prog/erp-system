import { theme } from "../../theme";

export default function AppDrawer({
  open,
  onClose,
  children,
  side = "right",
  width = "360px",
}) {
  if (!open) {
    return null;
  }

  const isMobile =
    window.innerWidth < 768;


  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",

        inset: 0,

        background:
          "rgba(15,23,42,.32)",

        backdropFilter:
          "blur(4px)",

        zIndex: 5000,
      }}
    >

      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          position: "absolute",

          top: isMobile ? 0 : 12,

          bottom: isMobile ? 0 : 12,

          [side]: isMobile ? 0 : 12,

          width,

          maxWidth:
            "calc(100vw - 24px)",

          background:
            theme.colors.card,

          overflow:
            "hidden",

          boxSizing:
            "border-box",

          border:
            `1px solid ${theme.colors.border}`,

          borderRadius:
            isMobile
              ? 0
              : side === "left"
              ? "0 24px 24px 0"
              : "24px 0 0 24px",


          boxShadow:
            "0 30px 70px rgba(15,23,42,.25)",


          animation:
            side === "left"
              ? "drawerInLeft .28s cubic-bezier(.2,.8,.2,1)"
              : "drawerInRight .28s cubic-bezier(.2,.8,.2,1)",
        }}
      >

        {children}

      </div>


      <style>
        {`

          @keyframes drawerInLeft {

            from {
              transform: translateX(-100%);
              opacity: .8;
            }

            to {
              transform: translateX(0);
              opacity: 1;
            }

          }


          @keyframes drawerInRight {

            from {
              transform: translateX(100%);
              opacity: .8;
            }

            to {
              transform: translateX(0);
              opacity: 1;
            }

          }

        `}
      </style>

    </div>
  );
}