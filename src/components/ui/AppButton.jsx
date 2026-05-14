import { theme } from "../../theme";

export default function AppButton({
  children,

  onClick,

  variant = "primary",

  size = "md",

  fullWidth = false,

  disabled = false,

  loading = false,

  style = {},

  type = "button",
}) {

  const variants = {

    primary: {
      background:
        theme.colors.primary,

      color:
        theme.colors.white,

      border: "none",
    },

    secondary: {
      background:
        theme.colors.secondary,

      color:
        theme.colors.text,

      border:
        `1px solid ${theme.colors.border}`,
    },

    danger: {
      background:
        theme.colors.danger,

      color:
        theme.colors.white,

      border: "none",
    },

    success: {
      background: "#16a34a",

      color: "#fff",

      border: "none",
    },

    ghost: {
      background: "transparent",

      color:
        theme.colors.text,

      border:
        `1px solid transparent`,
    },
  };

  const sizes = {

    sm: {
      padding: "8px 12px",
      fontSize: "13px",
      borderRadius: "10px",
    },

    md: {
      padding: "12px 16px",
      fontSize: "14px",
      borderRadius: "12px",
    },

    lg: {
      padding: "14px 18px",
      fontSize: "15px",
      borderRadius: "14px",
    },
  };

  return (

    <button
      type={type}

      disabled={
        disabled || loading
      }

      onClick={onClick}

      onMouseEnter={(e) => {

        if (
          disabled ||
          loading
        ) {
          return;
        }

        e.currentTarget.style.transform =
          "translateY(-1px)";

        e.currentTarget.style.filter =
          "brightness(0.98)";
      }}

      onMouseLeave={(e) => {

        e.currentTarget.style.transform =
          "translateY(0px)";

        e.currentTarget.style.filter =
          "brightness(1)";
      }}

      style={{

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "8px",

        fontWeight: "600",

        width:
          fullWidth
            ? "100%"
            : "auto",

        transition:
          "0.2s ease",

        opacity:
          disabled
            ? 0.5
            : 1,

        cursor:
          disabled
            ? "not-allowed"
            : "pointer",

        boxShadow:
          variant === "primary"
            ? "0 4px 14px rgba(0,0,0,0.08)"
            : "none",

        ...variants[variant],

        ...sizes[size],

        ...style,
      }}
    >

      {loading
        ? "Loading..."
        : children}

    </button>

  );

}