import { theme } from "../../theme";
import AppCard from "./AppCard";

export default function AppTable({
  columns = [],
  rows = [],

  loading = false,

  hover = true,
  striped = false,
  compact = false,

  stickyHeader = false,

  emptyText = "No Data",

  emptyComponent = null,

  keyField = "id",

  renderCell,

  onRowClick,
}) {
  const padding = compact ? "10px 14px" : "16px 18px";

  if (loading) {
    return (
      <AppCard>
        Loading...
      </AppCard>
    );
  }

  return (
    <AppCard
      padding={0}
      style={{
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: "700px",
        }}
      >
        <thead>
          <tr
            style={{
              background: theme.colors.cardSoft,
            }}
          >
            {columns.map((col) => (
            <th
  key={col.key}
  onClick={col.onClick ?? undefined}
  onMouseEnter={(e) => {
    if (col.onClick) {
      e.currentTarget.style.background =
        theme.colors.primarySoft;
    }
  }}
  onMouseLeave={(e) => {
    if (col.onClick) {
      e.currentTarget.style.background =
        theme.colors.cardSoft;
    }
  }}
  style={{
    padding,
    width: col.width,
    textAlign: col.align || "start",

    position: stickyHeader
      ? "sticky"
      : "static",

    top: 0,
    zIndex: 1,

    background: theme.colors.cardSoft,

    fontSize: "13px",
    fontWeight: "700",

    color: theme.colors.textSecondary,

    borderBottom: `1px solid ${theme.colors.border}`,

    cursor: col.onClick
      ? "pointer"
      : "default",

    userSelect: "none",

    transition: theme.transition.normal,
  }}
>
  {col.title}
</th>
            ))}
          </tr>
        </thead>

        <tbody>

          {rows.length === 0 ? (

            <tr>

              <td
                colSpan={columns.length}
                style={{
                  padding: "40px",
                }}
              >
                {emptyComponent || (
                  <div
                    style={{
                      textAlign: "center",
                      color:
                        theme.colors.textSecondary,
                    }}
                  >
                    {emptyText}
                  </div>
                )}
              </td>

            </tr>

          ) : (

            rows.map((row, index) => (

              <tr
                key={
                  row[keyField] ??
                  index
                }

                onClick={() =>
                  onRowClick?.(row)
                }

                style={{
                  cursor:
                    onRowClick
                      ? "pointer"
                      : "default",

                  background:
                    striped &&
                    index % 2
                      ? theme.colors.cardSoft
                      : "transparent",

                  transition:
                    theme.transition.normal,
                }}

                onMouseEnter={(e) => {

                  if (!hover) return;

                  e.currentTarget.style.background =
                    theme.colors.primarySoft;

                }}

                onMouseLeave={(e) => {

                  if (!hover) return;

                  e.currentTarget.style.background =
                    striped &&
                    index % 2
                      ? theme.colors.cardSoft
                      : "transparent";

                }}
              >

                {columns.map((col) => (

                  <td
                    key={col.key}

                    style={{
                      padding,

                      verticalAlign: "top",

                      textAlign:
                        col.align || "start",

                      borderBottom:
                        `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {renderCell
                      ? renderCell(
                          row,
                          col
                        )
                      : row[col.key]}
                  </td>

                ))}

              </tr>

            ))

          )}

        </tbody>

      </table>

    </AppCard>
  );
}