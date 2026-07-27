import { useTranslate } from "../../useTranslate";

export default function LogsStats({
  totalLogs = 0,
  todayLogs = 0,
  failedLogs = 0
}) {

  const { t } = useTranslate();

  const cards = [
    {
      title: t("logs.totalLogs"),
      value: totalLogs,
      icon: "📜"
    },
    {
      title: t("logs.todayLogs"),
      value: todayLogs,
      icon: "📅"
    },
    {
      title: t("logs.failedLogs"),
      value: failedLogs,
      icon: "❌"
    }
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "16px"
      }}
    >
      {cards.map(card => (
        <div
          key={card.title}
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "20px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.04)"
          }}
        >
          <div
            style={{
              fontSize: "28px",
              marginBottom: "10px"
            }}
          >
            {card.icon}
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: "700"
            }}
          >
            {card.value}
          </div>

          <div
            style={{
              color: "#64748b",
              marginTop: "4px"
            }}
          >
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
}