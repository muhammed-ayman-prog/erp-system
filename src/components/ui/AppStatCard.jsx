import { theme } from "../../theme";

import AppBadge from "./AppBadge";
import AppCard from "./AppCard";
import AppNumber from "./AppNumber";
import AppProgress from "./AppProgress";
import AppSkeleton from "./AppSkeleton";

export default function AppStatCard({
  title,

  value = 0,

  currency,

  subtitle,

  icon,

  color = "primary",

  trend,

  progress,

  loading = false,

  onClick,

  valueStyle = {},

  children,
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
    <AppCard
      onClick={onClick}
      padding="none"
      style={{
        overflow: "hidden",
        cursor: onClick
          ? "pointer"
          : "default",
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
        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            marginBottom:
              theme.spacing.lg,
          }}
        >
          {icon && (
            <div
              style={{
                width: 56,
                height: 56,

                borderRadius:
                  theme.radius.full,

                background:
                  current.bg,

                color:
                  current.text,

                display: "flex",

                justifyContent:
                  "center",

                alignItems:
                  "center",

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

        {/* Title */}

        <div
          style={{
            ...theme.typography.caption,

            color:
              theme.colors
                .textSecondary,
          }}
        >
          {title}
        </div>

        {/* Value */}

        <div
          style={{
            marginTop:
              theme.spacing.sm,
            ...valueStyle,
          }}
        >
          {typeof value ===
          "number" ? (
            <AppNumber
              value={value}
              currency={currency}
              size={30}
              weight={800}
            />
          ) : (
            value
          )}
        </div>

        {/* Subtitle */}

        {subtitle && (
          <div
            style={{
              marginTop:
                theme.spacing.md,

              ...theme.typography
                .caption,

              color:
                theme.colors
                  .textSecondary,
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Progress */}

        {typeof progress ===
          "number" && (
          <div
            style={{
              marginTop:
                theme.spacing.lg,
            }}
          >
            <AppProgress
              value={progress}
              color={
                current.border
              }
              showLabel
            />
          </div>
        )}

        {children}
      </div>
    </AppCard>
  );
}