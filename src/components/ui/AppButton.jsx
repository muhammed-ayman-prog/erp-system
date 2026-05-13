export default function AppButton({
  children,
  onClick,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  style = {},
  type = "button"
}) {

  const variants = {

    primary: {
      background: "#111827",
      color: "#fff",
      border: "none"
    },

    secondary: {
      background: "#fff",
      color: "#111827",
      border: "1px solid #d1d5db"
    },

    danger: {
      background: "#dc2626",
      color: "#fff",
      border: "none"
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}

      style={{
        padding: "12px 16px",

        borderRadius: "12px",

        cursor:
          disabled
            ? "not-allowed"
            : "pointer",

        opacity:
          disabled
            ? 0.6
            : 1,

        fontWeight: "600",

        width:
          fullWidth
            ? "100%"
            : "auto",

        transition: "0.2s",

        ...variants[variant],

        ...style
      }}
    >

      {children}

    </button>
  );
}