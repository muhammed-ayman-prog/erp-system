import AppBadge from "./AppBadge";
import AppCard from "./AppCard";
import AppInput from "./AppInput";
import AppSkeleton from "./AppSkeleton";

import { theme } from "../../theme";
import { useTranslate } from "../../useTranslate";

export default function AppPageToolbar({
  title,
  subtitle,

  search = "",
  onSearch,

  searchPlaceholder,

  records,

  loading = false,

  actions,

  children,
}) {
  const { t } = useTranslate();

  if (loading) {
    return <AppSkeleton variant="card" />;
  }

  return (
    <AppCard
      style={{
        marginBottom: theme.spacing.xl,
      }}
    >
      {(title || subtitle || records !== undefined) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: theme.spacing.lg,
            flexWrap: "wrap",
            marginBottom: theme.spacing.xl,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 220,
            }}
          >
            {title && (
              <h2
                style={{
                  margin: 0,
                  ...theme.typography.h2,
                  color: theme.colors.text,
                }}
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p
                style={{
                  margin: "6px 0 0",

                  ...theme.typography.body,

                  color:
                    theme.colors.textSecondary,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {records !== undefined && (
            <AppBadge
              color="success"
              icon="📊"
            >
              {records} {t("common.records")}
            </AppBadge>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",

          gap: theme.spacing.md,

          alignItems: "center",

          flexWrap: "wrap",
        }}
      >
        {onSearch && (
          <div
            style={{
              flex: 1,
              minWidth: 280,
            }}
          >
            <AppInput
              value={search}
              onChange={(e) =>
                onSearch(e.target.value)
              }
              placeholder={
                searchPlaceholder ??
                t("common.search")
              }
            />
          </div>
        )}

        {actions && (
          <div
            style={{
              display: "flex",

              gap: theme.spacing.sm,

              flexWrap: "wrap",

              marginInlineStart: "auto",
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div
          style={{
            marginTop: theme.spacing.lg,
          }}
        >
          {children}
        </div>
      )}
    </AppCard>
  );
}