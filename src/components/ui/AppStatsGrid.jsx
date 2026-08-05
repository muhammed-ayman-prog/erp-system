export default function AppStatsGrid({
  children,
}) {
  return (
    <div
      style={{
        display: "grid",

        gridTemplateColumns:
          "repeat(auto-fit,minmax(260px,1fr))",

        gap: 20,

        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}