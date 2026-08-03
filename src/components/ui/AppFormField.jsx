import { theme } from "../../theme";

export default function AppFormField({
  label,
  required = false,
  error,
  children,
  style = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.xs,
        ...style,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          {label}

          {required && (
            <span
              style={{
                color: theme.colors.danger,
                marginInlineStart: 4,
              }}
            >
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error && (
        <span
          style={{
            fontSize: "12px",
            color: theme.colors.danger,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}