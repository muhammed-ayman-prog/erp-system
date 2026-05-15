import AppCard
from "../../../components/ui/AppCard";

import AppButton
from "../../../components/ui/AppButton";

export default function UsersTable({
  users,
  branches,
  roleLabels,
  t,
  isRTL,
  isMobile,
  canEditUsers,
  canDeleteUsers,
  setEditingUser,
  handleDelete,
}) {
  return (
    <AppCard>
      <div
        style={{
          overflowX: "auto",
          width: "100%",
        }}
      >
        <table
          style={{
            minWidth:
              isMobile
                ? "600px"
                : "700px",

            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: "#f9f9fb",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "12px",
                  textAlign:
                    isRTL
                      ? "right"
                      : "left",
                }}
              >
                {t("users.user")}
              </th>

              <th>
                {t("users.role")}
              </th>

              <th>
                {t("users.branch")}
              </th>

              <th>
                {t("common.status")}
              </th>

              <th
                style={{
                  textAlign:
                    isRTL
                      ? "left"
                      : "right",

                  paddingRight: "20px",
                }}
              >
                {t("common.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => {

              const isOwnerUser =
                u.role === "owner";

              return (
                <tr
                  key={u.id}
                  style={{
                    borderTop:
                      "1px solid #eee",
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                      }}
                    >
                      {u.name}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#777",
                      }}
                    >
                      {u.email}
                    </div>
                  </td>

                  <td>
                    {roleLabels[u.role]}
                  </td>

                  <td>
                    {u.branchIds?.length
                      ? u.branchIds
                          .map(
                            (id) =>
                              branches.find(
                                (b) =>
                                  b.id === id
                              )?.name
                          )
                          .filter(Boolean)
                          .join(", ")

                      : "-"}
                  </td>

                  <td
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    <span
                      style={{
                        padding:
                          "6px 10px",

                        borderRadius:
                          "999px",

                        fontSize:
                          "12px",

                        textAlign:
                          "center",

                        background:
                          u.status ===
                          "active"
                            ? "#ecfdf3"
                            : "#fef2f2",
                      }}
                    >
                      {(u.status ||
                        "active") ===
                      "active"
                        ? t(
                            "common.active"
                          )
                        : t(
                            "common.disabled"
                          )}
                    </span>
                  </td>

                  <td
                    style={{
                      textAlign:
                        isRTL
                          ? "left"
                          : "right",

                      paddingRight:
                        "20px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          isMobile
                            ? "column"
                            : "row",

                        justifyContent:
                          isMobile
                            ? "stretch"
                            : "flex-end",

                        flexWrap:
                          "wrap",

                        gap: "8px",
                      }}
                    >
                      {canEditUsers &&
                        !isOwnerUser && (
                          <AppButton
                            style={{
                              width:
                                isMobile
                                  ? "100%"
                                  : "auto",
                            }}
                            onClick={() =>
                              setEditingUser(
                                u
                              )
                            }
                          >
                            {t(
                              "common.edit"
                            )}
                          </AppButton>
                        )}

                      {canDeleteUsers &&
                        !isOwnerUser && (
                          <AppButton
                            variant="danger"
                            style={{
                              width:
                                isMobile
                                  ? "100%"
                                  : "auto",
                            }}
                            onClick={() =>
                              handleDelete(
                                u.id
                              )
                            }
                          >
                            {t(
                              "common.delete"
                            )}
                          </AppButton>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}