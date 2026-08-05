import AppCard from "./AppCard";
import { theme } from "../../theme";

export default function AppFilterBar({
  children,
  actions,
  style = {},
}) {
  const items = Array.isArray(children)
    ? children.filter(Boolean)
    : [children];

  return (
    <AppCard
      style={{
        marginBottom: theme.spacing.lg,
        ...style,
      }}
    >
      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",

          rowGap: theme.spacing.sm,
columnGap: theme.spacing.md,

          alignItems: "end",
        }}
      >
        {items}
      </div>

      {actions && (
        <div
          style={{
            marginTop: theme.spacing.lg,

            display: "flex",

            justifyContent: "flex-end",

            gap: theme.spacing.sm,

            flexWrap: "wrap",
          }}
        >
          {actions}
        </div>
      )}
    </AppCard>
  );
}