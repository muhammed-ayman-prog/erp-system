import { Inbox } from "lucide-react";
import { theme } from "../../theme";
import AppCard from "./AppCard";

export default function AppEmptyState({
  title,
  description,
  icon,
  action,
  style = {},
}) {
  return (
    <AppCard
      style={{
        textAlign: "center",
        ...style,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          margin: "0 auto 16px",
          borderRadius: theme.radius.full,
          background: theme.colors.cardSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon || (
          <Inbox
            size={30}
            color={theme.colors.muted}
          />
        )}
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      {description && (
        <div
          style={{
            color: theme.colors.textSecondary,
            marginBottom: action ? "18px" : 0,
            fontSize: "14px",
          }}
        >
          {description}
        </div>
      )}

      {action}
    </AppCard>
  );
}