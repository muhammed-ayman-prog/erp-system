import { theme } from "../../../theme";

export default function FormField({
  label,
  error,
  children,
  required = false,
  style = {},
}) {

  return (

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
        ...style,
      }}
    >

      {label && (

        <label
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: theme.colors.text,
          }}
        >

          {label}

          {required && (
            <span
              style={{
                color: theme.colors.danger,
                marginInlineStart: "4px",
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
            marginTop: "-2px",
          }}
        >
          {error}
        </span>

      )}

    </div>

  );

}