import { theme } from "../../theme";

export default function AppModal({
  open,
  onClose,
  children,
  width = "500px"
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

        zIndex: 9999,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        padding: "16px"
      }}
    >

      <div
        onClick={(e) =>
          e.stopPropagation()
        }

        style={{
          width: "100%",

          maxWidth: width,

          background:
            theme.colors.card,

          borderRadius: "20px",

          padding: "20px",

          maxHeight: "90vh",

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