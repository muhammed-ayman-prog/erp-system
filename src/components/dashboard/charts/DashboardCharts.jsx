import {

  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import AnimatedCard from
"../cards/AnimatedCard";

import ActivityFeed from
"./ActivityFeed";
import { memo } from "react";
function DashboardCharts({

  data,

  activity,

  isMobile,

  t

}) {

  return (

    <>

        

      {/* Bottom Section */}

      <div style={{

        display: "grid",

        gridTemplateColumns:
          isMobile
            ? "1fr"
            : "2fr 1fr 1fr",

        gap: 15,

        marginTop: 15
      }}>

        {/* Branch Ranking */}

<AnimatedCard
  title={
    <div style={{

      position: "sticky",

      top: 0,

      background:
        "rgba(255,255,255,0.9)",

      backdropFilter:
        "blur(6px)",

      zIndex: 10,

      paddingBottom: 10,

      borderBottom:
        "1px solid #f3f4f6"

    }}>

      {t("dashboard.branchPerformance")}

    </div>
  }
>

  {data.salesByBranch.length === 0 ? (

    <div style={{
      textAlign: "center",
      color: "#6b7280",
      padding: 20
    }}>

      📊 {t("dashboard.noBranchData")}

    </div>

  ) : (

    <div style={{

      maxHeight:
        isMobile ? 260 : 320,

      overflowY: "auto",

      paddingRight: 4

    }}>

      {[...data.salesByBranch]

        .sort((a, b) =>
          b.total - a.total
        )

        .map((branch, index, arr) => {

          const max =
            arr[0]?.total || 1;

          const percent =
            (
              branch.total / max
            ) * 100;

          return (

            <div
              key={index}

              style={{

                marginBottom: 14,

                borderRadius: 10,

                padding: 6,

                cursor: "pointer",

                transition: "0.2s"
              }}

              onMouseEnter={e =>
                e.currentTarget.style.background =
                  "#f9fafb"
              }

              onMouseLeave={e =>
                e.currentTarget.style.background =
                  "transparent"
              }
            >

              <div style={{

                display: "flex",

                justifyContent:
                  "space-between",

                marginBottom: 6,

                fontSize: 14,

                gap: 10
              }}>

                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>

                  {

                    index === 0
                      ? "🥇"

                      : index === 1
                      ? "🥈"

                      : index === 2
                      ? "🥉"

                      : "🏪"

                  }

                  {branch.name}

                </span>

                <strong style={{

                  fontSize: 13,

                  whiteSpace: "nowrap",

                  color:

                    index === 0
                      ? "#16a34a"
                      : "#374151"

                }}>

                  {branch.total
                    .toLocaleString()}

                  {" "}{t("common.currency")}

                </strong>

              </div>

              <div style={{

                height: 8,

                background:
                  "#e5e7eb",

                borderRadius: 999,

                overflow: "hidden"
              }}>

                <div style={{

                  width:
                    `${Math.max(percent, 8)}%`,

                  height: "100%",

                  background:

                    index === 0
                      ? "#22c55e"
                      : "#3b82f6"

                }} />

              </div>

            </div>

          );

        })}

    </div>

  )}

</AnimatedCard>

        {/* Profitable Branches */}

        <AnimatedCard
          title={t("dashboard.profitableBranches")}
        >

          {data.profitByBranch.length === 0 ? (

            <div style={{
              textAlign: "center",
              color: "#6b7280",
              padding: 20
            }}>

              📊 {t("common.noData")}

            </div>

          ) : (

  <div style={{

    maxHeight:
      isMobile ? 260 : 320,

    overflowY: "auto",

    paddingRight: 4

  }}>

    {data.profitByBranch.map(
      (branch, i) => (

      <div
        key={i}

        style={{

          display: "flex",

          justifyContent:
            "space-between",

          padding: "10px 0",

          borderBottom:
            "1px solid #eee",

          borderRadius: 8,

          cursor: "pointer",

          transition: "0.2s"
        }}

        onMouseEnter={e =>
          e.currentTarget.style.background =
            "#f9fafb"
        }

        onMouseLeave={e =>
          e.currentTarget.style.background =
            "transparent"
        }
      >

                <span>
                  {branch.name}
                </span>

                <strong style={{

                  fontSize: 13,

                  whiteSpace: "nowrap",

                  color: "#16a34a"

                }}>

                  {branch.total
                    .toLocaleString()}

                  {" "}{t("common.currency")}

                </strong>

              </div>

            ))}
            </div>

          )}

        </AnimatedCard>

        {/* Activity */}

        <ActivityFeed
          data={activity}
        />

      </div>

    </>

  );
}

export default memo(
  DashboardCharts
);