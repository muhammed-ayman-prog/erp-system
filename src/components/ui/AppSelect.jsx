import { theme } from "../../theme";

const sizes = {
  sm: {
    padding: "8px 10px",
    fontSize: "13px",
  },

  md: {
    padding: "10px 12px",
    fontSize: "14px",
  },

  lg: {
    padding: "12px 14px",
    fontSize: "15px",
  },
};

export default function AppSelect({
  children,

  error = false,

  disabled = false,

  fullWidth = true,

  size = "md",

  style = {},

  onFocus,

  onBlur,

  ...props
}) {
  const inputSize = sizes[size] || sizes.md;

  return (
    <select
      {...props}
      disabled={disabled}
      onFocus={(e) => {
        e.target.style.borderColor = error
          ? theme.colors.danger
          : theme.colors.primary;

        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error
          ? theme.colors.danger
          : theme.colors.border;

        onBlur?.(e);
      }}
      style={{
        width: fullWidth ? "100%" : "auto",

        boxSizing: "border-box",

        outline: "none",

        cursor: disabled ? "not-allowed" : "pointer",

        transition: theme.transition.normal,

        borderRadius: theme.radius.md,

        background: disabled
          ? theme.colors.cardSoft
          : theme.colors.card,

        color: theme.colors.text,

        border: `1px solid ${
          error
            ? theme.colors.danger
            : theme.colors.border
        }`,

        opacity: disabled ? 0.7 : 1,

        paddingTop: inputSize.padding.split(" ")[0],
        paddingBottom: inputSize.padding.split(" ")[0],
        paddingInlineStart: inputSize.padding.split(" ")[1],
        paddingInlineEnd: "36px",

        fontSize: inputSize.fontSize,

        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",

        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",

        ...style,
      }}
    >
      {children}
    </select>
  );
}