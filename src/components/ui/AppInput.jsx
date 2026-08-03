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

export default function AppInput({
  startIcon,
  endIcon,

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
    <div
      style={{
        width: fullWidth ? "100%" : "auto",
        position: "relative",
      }}
    >
      {startIcon && (
        <div
          style={{
            position: "absolute",
            insetInlineStart: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            color: theme.colors.textSecondary,
            pointerEvents: "none",
          }}
        >
          {startIcon}
        </div>
      )}

      <input
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
          width: "100%",

          boxSizing: "border-box",

          outline: "none",

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

          paddingInlineStart: startIcon
            ? "40px"
            : inputSize.padding.split(" ")[1],

          paddingInlineEnd: endIcon
            ? "40px"
            : inputSize.padding.split(" ")[1],

          paddingTop: inputSize.padding.split(" ")[0],

          paddingBottom: inputSize.padding.split(" ")[0],

          fontSize: inputSize.fontSize,

          ...style,
        }}
      />

      {endIcon && (
        <div
          style={{
            position: "absolute",
            insetInlineEnd: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            color: theme.colors.textSecondary,
          }}
        >
          {endIcon}
        </div>
      )}
    </div>
  );
}