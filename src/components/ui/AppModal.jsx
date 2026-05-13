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
          "rgba(0,0,0,0.4)",

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

          background: "#fff",

          borderRadius: "20px",

          padding: "20px",

          maxHeight: "90vh",

          overflowY: "auto"
        }}
      >

        {children}

      </div>

    </div>
  );
}