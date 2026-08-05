import {
  ReceiptText,
  HandCoins,
  Gift,
} from "lucide-react";

import AppCard from "../../../components/ui/AppCard";
import { spacing, theme } from "../../../theme";
import { useTranslate } from "../../../useTranslate";

const tabs = [
  {
    key: "expenses",
    title: "expenses.tabs.expenses",
    subtitle: "expenses.tabs.expensesSubtitle",
    icon: ReceiptText,
    color: "danger",
  },
  {
    key: "loans",
    title: "expenses.tabs.loans",
    subtitle: "expenses.tabs.loansSubtitle",
    icon: HandCoins,
    color: "info",
  },
  {
    key: "bonus",
    title: "expenses.tabs.bonus",
    subtitle: "expenses.tabs.bonusSubtitle",
    icon: Gift,
    color: "success",
  },
];

export default function ExpenseTabs({
  activeTab,
  onChange,
  resetFilters,
}) {
  const { t } = useTranslate();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(240px,1fr))",
        gap: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        const active =
          activeTab === tab.key;

        return (
          <AppCard
            key={tab.key}
            clickable
            hover
            active={active}
            activeColor={tab.color}
            accent={active ? tab.color : null}
            shadow="sm"
            onClick={() => {
              onChange(tab.key);
              resetFilters?.();
            }}
            onMouseEnter={(e) => {
              const icon =
                e.currentTarget.querySelector(
                  ".tab-icon"
                );

              const title =
                e.currentTarget.querySelector(
                  ".tab-title"
                );

              if (icon) {
                icon.style.transform =
                  "scale(1.08)";
              }

              if (title) {
                title.style.transform =
                  "translateX(3px)";
              }
            }}
            onMouseLeave={(e) => {
              const icon =
                e.currentTarget.querySelector(
                  ".tab-icon"
                );

              const title =
                e.currentTarget.querySelector(
                  ".tab-title"
                );

              if (icon) {
                icon.style.transform =
                  "scale(1)";
              }

              if (title) {
                title.style.transform =
                  "translateX(0)";
              }
            }}
            style={{
              background: active
                ? `${theme.colors[
                    `${tab.color}Soft`
                  ]}20`
                : theme.colors.card,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.xl,
              }}
            >
              <div
                className="tab-icon"
                style={{
                  width: 52,
                  height: 52,

                  borderRadius:
                    theme.radius.full,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  background: active
                    ? theme.colors[
                        `${tab.color}Soft`
                      ]
                    : theme.colors.cardSoft,

                  color: active
                    ? theme.colors[
                        tab.color
                      ]
                    : theme.colors
                        .textSecondary,

                  boxShadow: active
                    ? `0 0 0 6px ${
                        theme.colors[
                          `${tab.color}Soft`
                        ]
                      }40`
                    : "none",

                  transition:
                    "all .22s cubic-bezier(.2,.8,.2,1)",

                  flexShrink: 0,
                }}
              >
                <Icon size={24} />
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  className="tab-title"
                  style={{
                    fontWeight: 700,
                    fontSize: 15,

                    color:
                      theme.colors.text,

                    marginBottom: 6,

                    transition:
                      theme.transition.normal,
                  }}
                >
                  {t(tab.title)}
                </div>

                <div
                  style={{
                    fontSize: 13,

                    color:
                      theme.colors
                        .textSecondary,

                    lineHeight: 1.55,
                  }}
                >
                  {t(tab.subtitle)}
                </div>
              </div>
            </div>
          </AppCard>
        );
      })}
    </div>
  );
}