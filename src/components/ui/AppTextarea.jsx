import { theme } from "../../theme";

export default function AppTextarea({
  style = {},
  rows = 4,
  ...props
}) {
  return (
    <textarea
      {...props}
      rows={rows}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.card,
        color: theme.colors.text,
        fontSize: "14px",
        outline: "none",
        resize: "vertical",
        transition: theme.transition.fast,
        boxSizing: "border-box",
        fontFamily: "inherit",
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor =
          theme.colors.primary;
      }}
      onBlur={(e) => {
        e.target.style.borderColor =
          theme.colors.border;
      }}
    />
  );
}