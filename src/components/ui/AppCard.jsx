import { theme } from "../../theme";

export default function AppCard({
  children,
  style = {},
  ...props
}) {

  return (
    <div
      {...props}

      style={{
        background:
          theme.colors.card,

        borderRadius: "18px",

        padding: "16px",

        border:
          `1px solid ${theme.colors.cardBorder}`,

        boxShadow:
          theme.colors.shadow,

        ...style
      }}
    >

      {children}

    </div>
  );
}