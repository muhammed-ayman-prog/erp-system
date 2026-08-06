import AppCard from "./AppCard";
import { theme } from "../../theme";

export default function AppSection({
  title,
  subtitle,
  actions,
  children,
  padding = "lg",
  style = {},
}) {
  return (
    <AppCard
      padding={padding}
      style={style}
    >
      {(title || subtitle || actions) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
          }}
        >
          <div>
            {title && (
              <h2
                style={{
                  margin: 0,
                  color: theme.colors.text,
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p
                style={{
                  margin: "6px 0 0",
                  color:
                    theme.colors.textSecondary,
                  fontSize: 14,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.sm,
                flexWrap: "wrap",
              }}
            >
              {actions}
            </div>
          )}
        </div>
      )}

      {children}
    </AppCard>
  );
}