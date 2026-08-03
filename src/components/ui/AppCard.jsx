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

  const handleMouseEnter = (e) => {
    if (hover) {
      e.currentTarget.style.transform =
        "translateY(-4px)";

      e.currentTarget.style.boxShadow =
        theme.shadow.lg;
    }

    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e) => {
    if (hover) {
      e.currentTarget.style.transform =
        "translateY(0)";

      e.currentTarget.style.boxShadow =
        shadowValue;
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
        background: theme.colors.card,
        padding: paddingValue,
        borderRadius: radiusValue,
        border: bordered
          ? `1px solid ${theme.colors.cardBorder}`
          : "none",
        boxShadow: shadowValue,
        transition:
          "transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s ease, border-color .28s ease",
        cursor:
          clickable || onClick
            ? "pointer"
            : "default",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}