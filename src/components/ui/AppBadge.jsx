import { theme } from "../../theme";

const variants = {
  primary: {
    background: theme.colors.primarySoft,
    color: theme.colors.primary,
  },

  success: {
    background: theme.colors.successSoft,
    color: theme.colors.success,
  },

  warning: {
    background: theme.colors.warningSoft,
    color: theme.colors.warning,
  },

  danger: {
    background: theme.colors.dangerSoft,
    color: theme.colors.danger,
  },

  info: {
    background: theme.colors.infoSoft,
    color: theme.colors.info,
  },

  purple: {
    background: theme.colors.purpleSoft,
    color: theme.colors.purple,
  },

  gray: {
    background: theme.colors.graySoft,
    color: theme.colors.gray,
  },

  outline: {
    background: "transparent",
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
  },
};

const sizes = {
  sm: {
    padding: "4px 10px",
    fontSize: "11px",
  },

  md: {
    padding: "6px 12px",
    fontSize: "12px",
  },

  lg: {
    padding: "8px 16px",
    fontSize: "13px",
  },
};

export default function AppBadge({
  children,

  variant = "primary",

  size = "md",

  rounded = true,

  fullWidth = false,

  clickable = false,

  disabled = false,

  dot = false,

  icon,

  className,

  onClick,

  style = {},
}) {
  const badge = variants[variant] || variants.primary;

  return (
    <span
      className={className}
      onClick={disabled ? undefined : onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",

        width: fullWidth ? "100%" : "fit-content",

        cursor:
          clickable && !disabled
            ? "pointer"
            : "default",

        opacity: disabled ? 0.55 : 1,

        userSelect: "none",

        transition:
"transform .25s ease, background-color .25s ease, color .25s ease",

        fontWeight: "600",

        whiteSpace: "nowrap",

        borderRadius: rounded
          ? theme.radius.full
          : theme.radius.md,

        border: badge.border || "none",

        ...sizes[size],

        background: badge.background,

        color: badge.color,

        ...style,
      }}
      onMouseEnter={(e) => {
        if (!clickable || disabled) return;

        e.currentTarget.style.transform =
          "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        if (!clickable || disabled) return;

        e.currentTarget.style.transform =
          "translateY(0px)";
      }}
    >
      {dot && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: badge.color,
          }}
        />
      )}

      {icon}

      {children}
    </span>
  );
}