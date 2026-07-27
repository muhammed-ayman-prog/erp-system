import { useState } from "react";

import { useTranslate }
  from "../../useTranslate";

import useIsMobile
  from "../../hooks/useIsMobile";

import {
  logIcons,
  statusColors,
  moduleColors
} from "../../utils/logs/logConfig";

import LogsDetailsDrawer
  from "./LogsDetailsDrawer";

const moduleLabels = {
  ar: {
    Users: "المستخدمين",
    Sales: "المبيعات",
    Inventory: "المخزون",
    Customers: "العملاء",
    Branches: "الفروع",
    Pricing: "التسعير",
    Expenses: "المصروفات",
    Reports: "التقارير",
    Waste: "الهالك",
    Operations: "العمليات",
    Finance: "المالية"
  },
  en: {
    Users: "Users",
    Sales: "Sales",
    Inventory: "Inventory",
    Customers: "Customers",
    Branches: "Branches",
    Pricing: "Pricing",
    Expenses: "Expenses",
    Reports: "Reports",
    Waste: "Waste",
    Operations: "Operations",
    Finance: "Finance"
  }
};

export default function LogsTable({
  logs = []
}) {

  const { t, lang } =
    useTranslate();

  const isMobile =
    useIsMobile();

  const [selectedLog, setSelectedLog] =
    useState(null);

  const [hoveredRow, setHoveredRow] =
    useState(null);

  return (
    <>
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.04)"
        }}
      >
        <div
          style={{
            padding: "18px",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "700",
            borderBottom:
              "1px solid #e5e7eb"
          }}
        >
          {t("logs.auditRecords")}
        </div>

        {isMobile ? (

          <div
            style={{
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            {logs.length === 0 && (
              <EmptyState
  text={t("logs.noLogs")}
/>
            )}

            {logs.map(log => (

              <div
                key={log.id}
                onClick={() =>
                  setSelectedLog(log)
                }
                style={{
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "16px",
                  padding: "16px",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    gap: "10px",
                    alignItems:
                      "center",
                    marginBottom:
                      "12px"
                  }}
                >
                  <span>
                    {logIcons[
                      log.action
                    ] || "📌"}
                  </span>

                  <strong>
                    {t(`logs.logActions.${log.action}`) || log.action}
                  </strong>
                </div>

                <MobileRow
                  label={t(
                    "logs.user"
                  )}
                  value={
                    log.performedByName
                  }
                />
                <MobileRow
                  label={t("logs.branch")}
                  value={log.branchName}
                />

                <MobileRow
                  label={t(
                    "logs.target"
                  )}
                  value={
                    log.targetName
                  }
                />

                <MobileRow
  label={t("logs.module")}
  value={
    lang === "ar"
      ? moduleLabels[lang]?.[log.module] || log.module
      : log.module
  }
/>

                <MobileRow
                  label={t(
                    "logs.time"
                  )}
                  value={timeAgo(
                    log.createdAt,
                    lang
                  )}
                />
              </div>

            ))}
          </div>

        ) : (

          <div
            style={{
              overflowX: "auto"
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse"
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc"
                  }}
                >
                <Th>{t("logs.action")}</Th>
                <Th>{t("logs.user")}</Th>
                <Th>{t("logs.branch")}</Th>
                <Th>{t("logs.target")}</Th>
                <Th>{t("logs.module")}</Th>
                <Th>{t("logs.status")}</Th>
                <Th>{t("logs.time")}</Th>
                </tr>
              </thead>

              <tbody>

                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "60px"
                      }}
                    >
                      {t("logs.noLogs")}
                    </td>
                  </tr>
                )}

                {logs.map(log => (

                  <tr
                    key={log.id}
                    onClick={() =>
                      setSelectedLog(log)
                    }
                    onMouseEnter={() =>
                      setHoveredRow(
                        log.id
                      )
                    }
                    onMouseLeave={() =>
                      setHoveredRow(
                        null
                      )
                    }
                    style={{
                      cursor:
                        "pointer",

                      background:
                        hoveredRow ===
                        log.id
                          ? "#f8fafc"
                          : "#fff",

                      transition:
                        "0.15s",

                      borderTop:
                        "1px solid #f1f5f9"
                    }}
                  >
                    <Td>

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "center",
                          alignItems:
                            "center",
                          gap: "10px"
                        }}
                      >
                        <span>
                          {logIcons[
                            log.action
                          ] || "📌"}
                        </span>

                        <span>
                          {t(`logs.logActions.${log.action}`) || log.action}
                        </span>
                      </div>

                    </Td>

                    <Td>
                      {
                        log.performedByName
                      }
                    </Td>
                    <Td>
                      <Badge color="#64748b">
                        {log.branchName || "-"}
                      </Badge>
                    </Td>

                    <Td>
                      {log.targetName ||
                        "-"}
                    </Td>

                    <Td>

                      <Badge
                        color={
                          moduleColors[
                            log.module
                          ]
                        }
                      >
                        {moduleLabels[lang]?.[log.module] || log.module}
                      </Badge>

                    </Td>

                    <Td>

                      <Badge
                        color={
                          statusColors[
                            log.status
                          ]
                        }
                      >
                        {t(`logs.${log.status}`)}
                      </Badge>

                    </Td>

                    <Td>

                      <div>
                        {timeAgo(
                          log.createdAt,
                          lang
                        )}
                      </div>

                    </Td>

                  </tr>

                ))}

              </tbody>
            </table>
          </div>

        )}
      </div>

      <LogsDetailsDrawer
        log={selectedLog}
        onClose={() =>
          setSelectedLog(null)
        }
      />
    </>
  );
}

function MobileRow({
  label,
  value
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        marginBottom: "8px"
      }}
    >
      <strong>{label}</strong>

      <span>
        {value || "-"}
      </span>
    </div>
  );
}

function Th({
  children
}) {
  return (
    <th
      style={{
        padding: "16px",
        textAlign: "center",
        fontWeight: "700"
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children
}) {
  return (
    <td
      style={{
        padding: "16px",
        textAlign: "center"
      }}
    >
      {children}
    </td>
  );
}

function Badge({
  color,
  children
}) {
  return (
    <span
      style={{
        background:
          color || "#64748b",

        color: "#fff",

        padding:
          "6px 12px",

        borderRadius:
          "999px",

        fontSize:
          "12px",

        fontWeight:
          "600"
      }}
    >
      {children}
    </span>
  );
}

function EmptyState({
  text
}) {
  return (
    <div
      style={{
        padding: "50px",
        textAlign: "center",
        color: "#64748b"
      }}
    >
      {text}
    </div>
  );
}

function timeAgo(
  timestamp,
  lang
) {

  if (
    !timestamp?.seconds
  )
    return "-";

  const diff =
    Math.floor(
      (Date.now() -
        timestamp.seconds *
          1000) /
        1000
    );

  if (lang === "ar") {

    if (diff < 60)
      return "الآن";

    if (diff < 3600)
      return `${Math.floor(
        diff / 60
      )} دقيقة`;

    if (diff < 86400)
      return `${Math.floor(
        diff / 3600
      )} ساعة`;

    return `${Math.floor(
      diff / 86400
    )} يوم`;
  }

  if (diff < 60)
    return "Just now";

  if (diff < 3600)
    return `${Math.floor(
      diff / 60
    )} min ago`;

  if (diff < 86400)
    return `${Math.floor(
      diff / 3600
    )} hr ago`;

  return `${Math.floor(
    diff / 86400
  )} day ago`;
}