import { Wallet } from "lucide-react";

import AppCard from "../../../components/ui/AppCard";
import { theme } from "../../../theme";

export default function InvoiceTotalCard({
  netTotal,
}) {
  return (
    <AppCard
      hover
      style={{
        margin: `${theme.spacing.lg} 0`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,

          margin: "0 auto",

          borderRadius: theme.radius.full,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          background:
            theme.colors.successSoft,

          color: theme.colors.success,

          marginBottom: theme.spacing.lg,
        }}
      >
        <Wallet size={34} />
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,

          textTransform: "uppercase",

          color:
            theme.colors.textSecondary,
        }}
      >
        Total Amount
      </div>

      <div
        style={{
          marginTop: theme.spacing.sm,

          fontSize: 36,

          fontWeight: 800,

          color: theme.colors.success,

          lineHeight: 1.2,
        }}
      >
        {Number(netTotal).toLocaleString()} EGP
      </div>
    </AppCard>
  );
}