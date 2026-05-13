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
          "rgba(0,0,0,0.3)",

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

          background: "#fff",

          overflowY: "auto",

          boxShadow:
            "0 0 30px rgba(0,0,0,0.2)"
        }}
      >

        {children}

      </div>

    </div>
  );
}