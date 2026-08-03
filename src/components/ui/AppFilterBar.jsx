import AppCard from "./AppCard";
import { theme } from "../../theme";

export default function AppFilterBar({
  children,
  actions,
  style = {},
}) {
  return (
    <AppCard
      style={{
        marginBottom: theme.spacing.lg,
        ...style,
      }}
    >
      {children}

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