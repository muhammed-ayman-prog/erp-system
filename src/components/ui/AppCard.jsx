import { theme } from "../../theme";

export default function AppCard({
  children,

  style = {},

  padding = "lg",

  radius = "lg",

  shadow = "sm",

  bordered = true,

  hover = false,

  clickable = false,

  active = false,

  accent = null,

  activeColor = "primary",

  className,

  onClick,

  onMouseEnter,

  onMouseLeave,

  ...props
}) {
  const paddingValue =
    theme.spacing[padding] ?? padding;

  const radiusValue =
    theme.radius[radius] ?? radius;

  const shadowValue =
    theme.shadow[shadow] ?? shadow;

  const activeBorderColor =
    theme.colors[activeColor] ??
    theme.colors.primary;

  const activeShadow =
    theme.shadow.lg;

  const handleMouseEnter = (e) => {
    if (hover) {
      e.currentTarget.style.transform = active
        ? "translateY(-2px)"
        : "translateY(-4px)";

      e.currentTarget.style.boxShadow =
        active
          ? activeShadow
          : theme.shadow.lg;
    }

    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e) => {
    if (hover) {
      e.currentTarget.style.transform =
        "translateY(0)";

      e.currentTarget.style.boxShadow =
        active
          ? activeShadow
          : shadowValue;
    }

    onMouseLeave?.(e);
  };

  return (
    <div
      {...props}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",

        overflow: "hidden",

        background: theme.colors.card,

        padding: paddingValue,

        borderRadius: radiusValue,

        border: bordered
          ? `1px solid ${
              active
                ? activeBorderColor
                : theme.colors.cardBorder
            }`
          : "none",

        boxShadow: active
          ? activeShadow
          : shadowValue,

        cursor:
          clickable || onClick
            ? "pointer"
            : "default",

        transition:
          "transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s ease, border-color .28s ease",

        willChange: "transform",

        ...style,
      }}
    >
      {accent && (
        <div
          style={{
            position: "absolute",

            top: 0,

            insetInline: 0,

            height: 4,

            background:
              theme.colors[accent] ??
              theme.colors.primary,
          }}
        />
      )}

      {children}
    </div>
  );
}