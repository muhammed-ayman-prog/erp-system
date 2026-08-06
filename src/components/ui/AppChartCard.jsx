import AppCard from "./AppCard";
import AppSkeleton from "./AppSkeleton";
import { theme } from "../../theme";

export default function AppChartCard({
  title,
  subtitle,
  actions,
  loading = false,
  children,
  height = 320,
}) {
  return (
    <AppCard padding="lg">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {title}
          </h3>

          {subtitle && (
            <div
              style={{
                marginTop: 4,
                color:
                  theme.colors.textSecondary,
                fontSize: 13,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {actions}
      </div>

      <div
        style={{
          minHeight: height,
        }}
      >
        {loading ? (
          <AppSkeleton
            variant="rect"
            height={height}
          />
        ) : (
          children
        )}
      </div>
    </AppCard>
  );
}