import {
  CalendarDays,
  Search,
  Tag,
  User,
  X,
} from "lucide-react";

import AppButton from "./AppButton";
import { theme } from "../../theme";
import { useTranslate } from "../../useTranslate";

export default function AppFilterChips({
  filters = [],
  onRemove,
  onClear,
}) {
  const { t } = useTranslate();

  if (!filters.length) return null;

  const getIcon = (key) => {
    switch (key) {
      case "fromDate":
      case "toDate":
        return <CalendarDays size={14} />;

      case "search":
        return <Search size={14} />;

      case "category":
        return <Tag size={14} />;

      case "employee":
        return <User size={14} />;

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: theme.spacing.md,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xl,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
          flex: 1,
        }}
      >
        {filters.map((filter) => (
          <div
            key={filter.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,

              padding: "8px 12px",

              maxWidth: 260,

              background: theme.colors.card,

              border: `1px solid ${theme.colors.border}`,

              borderRadius: theme.radius.full,

              transition: theme.transition.normal,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor =
                theme.colors.primary;

              e.currentTarget.style.boxShadow =
                theme.shadow.sm;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor =
                theme.colors.border;

              e.currentTarget.style.boxShadow =
                "none";
            }}
          >
            <span
              style={{
                color: theme.colors.primary,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {getIcon(filter.key)}
            </span>

            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",

                color: theme.colors.text,

                fontSize: 13,

                fontWeight: 600,
              }}
            >
              {filter.label}
            </span>

            <span
              onClick={() =>
                onRemove?.(filter.key)
              }
              style={{
                width: 18,
                height: 18,

                borderRadius: "50%",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                cursor: "pointer",

                color:
                  theme.colors.textSecondary,

                flexShrink: 0,

                transition:
                  theme.transition.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  theme.colors.dangerSoft;

                e.currentTarget.style.color =
                  theme.colors.danger;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "transparent";

                e.currentTarget.style.color =
                  theme.colors.textSecondary;
              }}
            >
              <X size={12} />
            </span>
          </div>
        ))}
      </div>

      <AppButton
        size="sm"
        variant="outline"
        onClick={onClear}
      >
        {t("common.clearFilters")}
      </AppButton>
    </div>
  );
}