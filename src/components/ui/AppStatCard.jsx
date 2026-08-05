import { theme } from "../../theme";
import AppSkeleton from "./AppSkeleton";
import AppBadge from "./AppBadge";
export default function AppStatCard({
  title,
  value,

  subtitle,

  icon,

  color = "primary",

  trend,

  onClick,

  loading = false,
}) {
  const colors = {
    primary: {
      bg: theme.colors.primarySoft,
      text: theme.colors.primary,
      border: theme.colors.primary,
    },

    success: {
      bg: theme.colors.successSoft,
      text: theme.colors.success,
      border: theme.colors.success,
    },

    warning: {
      bg: theme.colors.warningSoft,
      text: theme.colors.warning,
      border: theme.colors.warning,
    },

    danger: {
      bg: theme.colors.dangerSoft,
      text: theme.colors.danger,
      border: theme.colors.danger,
    },

    info: {
      bg: theme.colors.infoSoft,
      text: theme.colors.info,
      border: theme.colors.info,
    },

    purple: {
      bg: theme.colors.purpleSoft,
      text: theme.colors.purple,
      border: theme.colors.purple,
    },
  };

  const current =
    colors[color] || colors.primary;

  if (loading) {
    return <AppSkeleton variant="stat" />;
  }

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",

        overflow: "hidden",

        background: theme.colors.card,

        border: `1px solid ${theme.colors.border}`,

        borderRadius: theme.radius.xl,

        boxShadow: theme.shadow.sm,

        cursor: onClick ? "pointer" : "default",

        transition: theme.transition.normal,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-5px)";

        e.currentTarget.style.boxShadow =
          theme.shadow.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";

        e.currentTarget.style.boxShadow =
          theme.shadow.sm;
      }}
    >
      {/* Top Accent */}

      <div
        style={{
          height: 5,
          background: current.border,
        }}
      />

      <div
        style={{
          padding: theme.spacing.xxl,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: theme.spacing.lg,
          }}
        >
          {icon && (
            <div
              style={{
                width: 56,
                height: 56,

                borderRadius: theme.radius.full,

                background: current.bg,

                color: current.text,

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}

          {trend && (
  <AppBadge color={color}>
    {trend}
  </AppBadge>
)}
        </div>

        <div
          style={{
            ...theme.typography.caption,

            color:
              theme.colors.textSecondary,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: theme.spacing.sm,

            fontSize: 30,

            fontWeight: 800,

            color: theme.colors.text,
          }}
        >
          {value}
        </div>

        {subtitle && (
          <div
            style={{
              marginTop: theme.spacing.md,

              ...theme.typography.caption,

              color:
                theme.colors.textSecondary,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}