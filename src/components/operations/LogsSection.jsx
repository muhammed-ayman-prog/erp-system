import AppCard from "../ui/AppCard";
import AppInput from "../ui/AppInput";
import AppSelect from "../ui/AppSelect";
import AppButton from "../ui/AppButton";

export default function LogsSection({
  t,
  COLORS,

  productsAccordionOpen,

  search,
  setSearch,

  filterBranch,
  setFilterBranch,

  sortedBranches,
  getBranchName,

  activeLogTab,
  setActiveLogTab,

  filteredActivities,

  setSelectedActivity,

  productMap,
  productLogs,

  logSearch,
  setLogSearch,

  logFilter,
  setLogFilter,
}) {
  return (
    <>
      {!productsAccordionOpen && (
        <>
          {/* Filters */}
          <AppCard
            padding="lg"
            radius="lg"
            shadow="sm"
            bordered
            style={{
              marginTop: "25px",
            }}
          >
            <AppInput
              type="text"
              placeholder={t("common.search")}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <AppSelect
              value={filterBranch}
              onChange={(e) =>
                setFilterBranch(e.target.value)
              }
            >
              <option value="">
                {t("branches.all")}
              </option>

              {sortedBranches.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                >
                  {getBranchName(b.id)}
                </option>
              ))}
            </AppSelect>
          </AppCard>

          {/* Activity Logs */}
          <div
            style={{
              marginTop: "30px",
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: "20px",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              {t("operations.activityLog")} 📊
            </h3>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <AppButton
                size="lg"
                variant={
                  activeLogTab === "activity"
                    ? "primary"
                    : "secondary"
                }
                onClick={() =>
                  setActiveLogTab("activity")
                }
                style={{
                  flex: 1,
                  minWidth: "140px",
                }}
              >
                📊 {t("logs.activity")}
              </AppButton>

              <AppButton
                size="lg"
                variant={
                  activeLogTab === "products"
                    ? "primary"
                    : "secondary"
                }
                onClick={() =>
                  setActiveLogTab("products")
                }
                style={{
                  flex: 1,
                  minWidth: "140px",
                }}
              >
                📦 {t("logs.products")}
              </AppButton>
            </div>

            {/* =========================
                ACTIVITY TAB
            ========================= */}
            {activeLogTab === "activity" && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {filteredActivities.map(
                    (item) => (
                      <AppCard
                        key={item.id}
                        bordered
                        padding="md"
                        radius="md"
                        shadow="sm"
                        onClick={() =>
                          setSelectedActivity(
                            item
                          )
                        }
                        style={{
                          cursor: "pointer",
                          transition:
                            "transform .2s ease, box-shadow .2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(-2px)";

                          e.currentTarget.style.boxShadow =
                            "0 10px 24px rgba(15,23,42,.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(0)";

                          e.currentTarget.style.boxShadow =
                            undefined;
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            marginBottom: "8px",
                            fontWeight: 700,
                          }}
                        >
                          {item.actionType ===
                          "transfer"
                            ? "🔄 " +
                              t(
                                "operations.transfer"
                              )
                            : "⚖️ " +
                              t(
                                "operations.adjust"
                              )}

                          {/* Reversed */}
                          {item.reversed && (
                            <span
                              style={{
                                color:
                                  COLORS.danger,
                                fontWeight: 700,
                                fontSize: "12px",
                                background:
                                  "#fee2e2",
                                padding:
                                  "3px 8px",
                                borderRadius:
                                  "8px",
                                marginLeft:
                                  "8px",
                              }}
                            >
                              {t(
                                "logs.reversed"
                              )}
                            </span>
                          )}
                        </p>

                        <p>
                          <strong>
                            {t(
                              "operations.product"
                            )}
                            :
                          </strong>{" "}
                          {productMap[
                            item.productId
                          ] ||
                            item.productId}
                        </p>

                        {item.actionType ===
                          "transfer" && (
                          <>
                            <p>
                              {
                                t(
                                  "operations.fromBranch"
                                )
                              }
                              :{" "}
                              {getBranchName(
                                item.fromBranch
                              )}
                            </p>

                            <p>
                              {
                                t(
                                  "operations.toBranch"
                                )
                              }
                              :{" "}
                              {getBranchName(
                                item.toBranch
                              )}
                            </p>
                          </>
                        )}

                        {item.actionType ===
                          "adjust" && (
                          <>
                            <p>
                              {
                                t(
                                  "branches.single"
                                )
                              }
                              :{" "}
                              {getBranchName(
                                item.branchId
                              )}
                            </p>

                            <p>
                              <strong>
                                {t(
                                  "operations.type"
                                )}
                                :
                              </strong>{" "}
                              {(
                                item.adjustType ||
                                item.type
                              ) ===
                              "increase"
                                ? `${t(
                                    "operations.increase"
                                  )} ➕`
                                : `${t(
                                    "operations.decrease"
                                  )} ➖`}
                            </p>

                            {item.reason && (
                              <p>
                                <strong>
                                  {t(
                                    "operations.reason"
                                  )}
                                  :
                                </strong>{" "}
                                {item.reason}
                              </p>
                            )}
                          </>
                        )}

                        <p
                          style={{
                            fontWeight: 700,
                          }}
                        >
                          {t("common.qty")}:{" "}
                          {item.qty}
                        </p>

                        <p>
                          <strong>
                            {t("users.title")}:
                          </strong>{" "}
                          {item.user}
                        </p>

                        <p
                          style={{
                            marginBottom: 0,
                            fontSize: "13px",
                            color:
                              "#6b7280",
                          }}
                        >
                          {item.createdAt
                            ?.toDate
                            ? new Date(
                                item.createdAt.toDate()
                              ).toLocaleString()
                            : new Date(
                                item.createdAt
                              ).toLocaleString()}
                        </p>
                      </AppCard>
                    )
                  )}
                </div>

                {filteredActivities.length ===
                  0 && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "20px",
                    }}
                  >
                    {t(
                      "operations.noResults"
                    )}{" "}
                    ❌
                  </div>
                )}
              </>
            )}

            {/* =========================
                PRODUCT LOGS TAB
            ========================= */}
            {activeLogTab === "products" && (
              <>
                <AppInput
                  type="text"
                  placeholder={t(
                    "logs.search"
                  )}
                  value={logSearch}
                  onChange={(e) =>
                    setLogSearch(
                      e.target.value
                    )
                  }
                />

                <AppSelect
                  value={logFilter}
                  onChange={(e) =>
                    setLogFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    {t("common.all")}
                  </option>

                  <option value="create">
                    ➕{" "}
                    {t(
                      "logs.productCreated"
                    )}
                  </option>

                  <option value="edit">
                    ✏️{" "}
                    {t(
                      "logs.productEdited"
                    )}
                  </option>

                  <option value="archive">
                    📦{" "}
                    {t(
                      "logs.productArchived"
                    )}
                  </option>

                  <option value="restore">
                    ♻️{" "}
                    {t(
                      "logs.productRestored"
                    )}
                  </option>
                </AppSelect>

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "10px",
                  }}
                >
                  {productLogs
                    .filter((log) => {
                      const matchesSearch =
                        (
                          log.productName ||
                          ""
                        )
                          .toLowerCase()
                          .includes(
                            logSearch.toLowerCase()
                          );

                      const matchesFilter =
                        !logFilter ||
                        log.action ===
                          logFilter;

                      return (
                        matchesSearch &&
                        matchesFilter
                      );
                    })
                    .map((log, index) => (
                      <AppCard
                        key={
                          log.id ||
                          `${log.action}-${log.productName}-${index}`
                        }
                        bordered
                        padding="md"
                        radius="md"
                        shadow="sm"
                      >
                        <p
                          style={{
                            margin: 0,
                            marginBottom:
                              "8px",
                            fontWeight: 700,
                          }}
                        >
                          {log.action ===
                          "create"
                            ? `➕ ${t(
                                "logs.productCreated"
                              )}`
                            : log.action ===
                              "archive"
                            ? `📦 ${t(
                                "logs.productArchived"
                              )}`
                            : log.action ===
                              "restore"
                            ? `♻️ ${t(
                                "logs.productRestored"
                              )}`
                            : `✏️ ${t(
                                "logs.productEdited"
                              )}`}
                        </p>

                        <p>
                          <strong>
                            {t(
                              "operations.product"
                            )}
                            :
                          </strong>{" "}
                          {log.productName}
                        </p>

                        <p>
                          <strong>
                            {t(
                              "operations.type"
                            )}
                            :
                          </strong>{" "}
                          {log.type}
                        </p>

                        <p>
                          <strong>
                            {t("users.single")}:
                          </strong>{" "}
                          {log.user}
                        </p>

                        <p
                          style={{
                            marginBottom: 0,
                            fontSize: "13px",
                            color:
                              "#6b7280",
                          }}
                        >
                          {log.createdAt
                            ?.toDate
                            ? new Date(
                                log.createdAt.toDate()
                              ).toLocaleString()
                            : t(
                                "common.noData"
                              )}
                        </p>
                      </AppCard>
                    ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}