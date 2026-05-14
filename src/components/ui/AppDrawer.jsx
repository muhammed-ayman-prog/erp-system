import { theme } from "../../theme";

export default function AppDrawer({
  open,
  onClose,
  children,
  side = "right",
  width = "360px"
}) {

  if (!open) {
    return null;
  }

  return (
    <div
      onClick={onClose}

      style={{
        position: "fixed",

        inset: 0,

        background:
          theme.colors.overlay,

        zIndex: 5000
      }}
    >

      <div
        onClick={(e) =>
          e.stopPropagation()
        }

        style={{
          position: "absolute",

          top: 0,

          [side]: 0,

          width,

          height: "100%",

          background:
            theme.colors.card,

          overflowY: "auto",

          boxShadow:
            theme.colors.shadow
        }}
      >

        {children}

      </div>

    </div>
  );
}