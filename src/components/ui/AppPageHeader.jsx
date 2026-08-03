import { theme } from "../../theme";

export default function AppPageHeader({
  title,
  subtitle,

  icon,

  actions,

  children,

  style = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: theme.spacing.lg,
        flexWrap: "wrap",
        marginBottom: theme.spacing.xl,
        ...style,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 220,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
          }}
        >
          {icon}

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 800,
              color: theme.colors.text,
            }}
          >
            {title}
          </h1>
        </div>

        {subtitle && (
          <div
            style={{
              color: theme.colors.textSecondary,
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </div>
        )}

        {children}
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
  );
}