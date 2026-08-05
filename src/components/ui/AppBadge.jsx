import { theme } from "../../theme";

export default function AppBadge({
  children,

  color = "primary",

  variant = "soft",

  size = "md",

  icon,

  rounded = true,

  dot = false,

  onClick,
}) {
  const colors = {
    primary: {
      bg: theme.colors.primarySoft,
      text: theme.colors.primary,
      border: theme.colors.primaryBorder,
    },

    success: {
      bg: theme.colors.successSoft,
      text: theme.colors.success,
      border: theme.colors.successBorder,
    },

    warning: {
      bg: theme.colors.warningSoft,
      text: theme.colors.warning,
      border: theme.colors.warningBorder,
    },

    danger: {
      bg: theme.colors.dangerSoft,
      text: theme.colors.danger,
      border: theme.colors.dangerBorder,
    },

    info: {
      bg: theme.colors.infoSoft,
      text: theme.colors.info,
      border: theme.colors.infoBorder,
    },

    purple: {
      bg: theme.colors.purpleSoft,
      text: theme.colors.purple,
      border: theme.colors.purpleBorder,
    },

    gray: {
      bg: theme.colors.graySoft,
      text: theme.colors.gray,
      border: theme.colors.border,
    },
  };

  const current =
    colors[color] || colors.primary;

  const sizes = {
    sm: {
      padding: "4px 8px",
      fontSize: 11,
    },

    md: {
      padding: "6px 10px",
      fontSize: 12,
    },

    lg: {
      padding: "8px 14px",
      fontSize: 13,
    },
  };

  const currentSize =
    sizes[size] || sizes.md;

  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",

        alignItems: "center",

        gap: 6,

        padding: currentSize.padding,

        fontSize: currentSize.fontSize,

        fontWeight: 700,

        borderRadius: rounded
          ? theme.radius.full
          : theme.radius.md,

        cursor: onClick
          ? "pointer"
          : "default",

        transition: theme.transition.normal,

        border: `1px solid ${current.border}`,

        background:
          variant === "solid"
            ? current.text
            : current.bg,

        color:
          variant === "solid"
            ? theme.colors.white
            : current.text,

        userSelect: "none",

        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;

        e.currentTarget.style.transform =
          "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        if (!onClick) return;

        e.currentTarget.style.transform =
          "translateY(0)";
      }}
    >
      {dot && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background:
              variant === "solid"
                ? theme.colors.white
                : current.text,
          }}
        />
      )}

      {icon}

      {children}
    </div>
  );
}