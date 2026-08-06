import AppCard from "../../../components/ui/AppCard";

export default function InvoiceStatsSection({
  title,
  children,
}) {
  return (
    <AppCard
      padding="lg"
      style={{
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: 20,
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {title}
      </h3>

      {children}
    </AppCard>
  );
}