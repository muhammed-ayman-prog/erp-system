import getChangedFields
  from "../../utils/logs/getChangedFields";

import useIsMobile
  from "../../hooks/useIsMobile";

import { useTranslate }
  from "../../useTranslate";
const detailLabels = {
  invoiceNumber:
    "logs.invoiceNumber",

  customerName:
    "logs.customerName",

  customerPhone:
    "logs.customerPhone",

  seller:
    "logs.seller",

  paymentMethod:
    "logs.paymentMethod",

  paymentCategory:
    "logs.paymentCategory",

  overallMargin:
    "logs.overallMargin",

  totalItems:
    "logs.totalItems",

  totalQty:
    "logs.totalQty",

  totalProfit:
    "logs.totalProfit",

  totalCost:
    "logs.totalCost",

  branchName:
  "logs.branch",
  
  transferId: "logs.transferId",
  adjustmentId: "logs.adjustmentId",

  fromBranch: "logs.fromBranch",
  fromBranchName: "logs.fromBranchName",

  toBranch: "logs.toBranch",
  toBranchName: "logs.toBranchName",

  activityId: "logs.activityId",
  activityType: "logs.activityType",

  qty: "common.qty",
  reason: "logs.reason",
  adjustType: "logs.adjustType",
  name: "products.name",

costPrice: "products.costPrice",

minStock: "products.minStock",
type: "products.productType",

category: "products.category",

oilCategory: "products.oilCategory",

pricingTier: "products.pricingTier",

subCategory: "products.containerType",

sellingPrice: "products.sellingPrice",
};
export default function LogsDetailsDrawer({
  log,
  onClose
}) {

  const { t } =
    useTranslate();

  const isMobile =
    useIsMobile();

  if (!log)
    return null;

  const changes =
    getChangedFields(
      log.before,
      log.after
    );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,0.45)",
        zIndex: 9999,
        display: "flex",
        justifyContent:
          "flex-end"
      }}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          width:
            isMobile
              ? "100%"
              : "700px",

          maxWidth: "100%",

          height: "100%",

          overflowY: "auto",

          background: "#fff",

          padding:
            isMobile
              ? "16px"
              : "24px",

          boxShadow:
            "-10px 0 30px rgba(0,0,0,0.15)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px"
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize:
                isMobile
                  ? "20px"
                  : "24px"
            }}
          >
            {t("logs.auditDetails")}
          </h2>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background:
                "transparent",
              cursor: "pointer",
              fontSize: "22px"
            }}
          >
            ✕
          </button>
        </div>

        <Card
  title={t("logs.summary")}
>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        isMobile
          ? "1fr"
          : "1fr 1fr",
      gap: "12px"
    }}
  >

    <GridItem
      label={t("logs.action")}
      value={
        t(
          `logs.logActions.${log.action}`
        )
      }
    />

    <GridItem
      label={t("logs.module")}
      value={
        t(
          `logs.modules.${log.module}`
        ) !==
        `logs.modules.${log.module}`
          ? t(
              `logs.modules.${log.module}`
            )
          : log.module
      }
    />

    <GridItem
      label={t("logs.user")}
      value={log.performedByName}
    />

    <GridItem
      label={t("logs.branch")}
      value={log.branchName}
    />

    <GridItem
      label={t("logs.status")}
      value={
        t(
          `logs.${log.status}`
        )
      }
    />

    <GridItem
      label={t("logs.target")}
      value={log.targetName}
    />

    <GridItem
      label={t("logs.time")}
      value={formatDate(
        log.createdAt
      )}
    />

  </div>

</Card>

        {changes.length > 0 && (

          <Card
            title={t("logs.changes")}
          >

            {changes.map(change => (

              <div
                key={change.field}
                style={{
                  padding: "14px",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "12px",
                  marginBottom:
                    "12px",
                  background:
                    "#fafafa"
                }}
              >
                <div
                  style={{
                    fontWeight:
                      "700",
                    marginBottom:
                      "10px",
                    wordBreak:
                      "break-word"
                  }}
                >
                  {
  detailLabels[
    change.field
  ]
    ? t(
        detailLabels[
          change.field
        ]
      )
    : change.field
}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <ValueBox
                    title={t(
                      "logs.before"
                    )}
                    background="#fef2f2"
                    titleColor="#991b1b"
                    value={
                      change.before
                    }
                  />

                  <ValueBox
                    title={t(
                      "logs.after"
                    )}
                    background="#f0fdf4"
                    titleColor="#166534"
                    value={
                      change.after
                    }
                  />

                </div>

              </div>

            ))}

          </Card>

        )}

        {log.details &&
  Object.keys(
    log.details
  ).length > 0 && (

  <Card
    title={t("logs.details")}
  >

    {log.action ===
      "CREATE_INVOICE" &&
      log.details
        ?.topItems
        ?.length > 0 && (

      <InvoiceItemsTable
        items={
          log.details.topItems
        }
      />

    )}

    <DetailList
      data={
        Object.fromEntries(
          Object.entries(
            log.details
          ).filter(
            ([key]) =>
              key !==
              "topItems"
          )
        )
      }
      isMobile={isMobile}
    />

  </Card>

)}

      </div>
    </div>
  );
}

function Card({
  title,
  children
}) {

  return (
    <div
      style={{
        marginBottom:
          "20px",

        border:
          "1px solid #e5e7eb",

        borderRadius:
          "16px",

        padding:
          "18px"
      }}
    >
      <div
        style={{
          fontWeight:
            "700",

          marginBottom:
            "14px",

          fontSize:
            "16px"
        }}
      >
        {title}
      </div>

      {children}
    </div>
  );
}

function GridItem({
  label,
  value
}) {

  return (
    <div
      style={{
        padding: "10px",
        border:
          "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#fafafa"
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          marginBottom: "4px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: "600",
          wordBreak: "break-word"
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function ValueBox({
  title,
  value,
  background,
  titleColor
}) {
const { t } =
  useTranslate();
  return (
    <div
      style={{
        flex: 1,

        padding:
          "10px",

        borderRadius:
          "10px",

        background
      }}
    >
      <div
        style={{
          fontSize:
            "12px",

          color:
            titleColor,

          marginBottom:
            "6px"
        }}
      >
        {title}
      </div>

      <div
        style={{
          wordBreak:
            "break-word",

          whiteSpace:
            "pre-wrap"
        }}
      >
        {formatValue(
          value,
          t
        )}
      </div>
    </div>
  );
}
function InvoiceItemsTable({
  items = []
}) {

  const { t } =
    useTranslate();

  if (!items.length)
    return null;

  return (
    <div
      style={{
        marginBottom: "16px",
        overflowX: "auto"
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>
              {t("common.name")}
            </th>

            <th style={thStyle}>
              {t("common.qty")}
            </th>

            <th style={thStyle}>
              {t("logs.total")}
            </th>

            <th style={thStyle}>
              {t("logs.cost")}
            </th>

            <th style={thStyle}>
              {t("logs.profit")}
            </th>
          </tr>
        </thead>

        <tbody>

          {items.map(
            (item, index) => (

              <tr key={index}>
                <td style={tdStyle}>
                  {item.name}
                </td>

                <td style={tdStyle}>
                  {item.qty}
                </td>

                <td style={tdStyle}>
                  {item.total}
                </td>

                <td style={tdStyle}>
                  {item.totalCost}
                </td>

                <td style={tdStyle}>
                  {item.totalProfit}
                </td>
              </tr>

            )
          )}

        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "10px",
  borderBottom:
    "1px solid #e5e7eb",
  textAlign: "center",
  fontWeight: "700"
};

const tdStyle = {
  padding: "10px",
  borderBottom:
    "1px solid #f1f5f9",
  textAlign: "center"
};
function DetailList({
  data,
  isMobile
}) {

  const { t } =
    useTranslate();

  const entries = Object.entries(data).filter(
  ([key]) =>
    key !== "fromBranch" &&
    key !== "toBranch"
);

  if (!entries.length)
    return null;

  return (
    <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  }}
>
      {entries.map(
        ([key, value]) => (

          <div
            key={key}
            style={{
    display: "flex",
    flexDirection:
      isMobile
        ? "column"
        : "row",

    justifyContent:
      "space-between",

    alignItems:
      isMobile
        ? "flex-start"
        : "center",

    gap: "12px",

    padding: "12px",

    border:
      "1px solid #e5e7eb",

    borderRadius:
      "10px",

    background:
      "#fafafa"
  }}
>
            <strong
              style={{
                minWidth:
  isMobile
    ? "auto"
    : "140px"
              }}
            >
              {
  detailLabels[key]
    ? t(detailLabels[key])
    : key
}
            </strong>

            <span
  style={{
    flex: 1,
    textAlign:
      isMobile
        ? "left"
        : "right",
    wordBreak:
      "break-word"
  }}
>
              {formatValue(
                value,
                t
              )}
            </span>

          </div>

        )
      )}
    </div>
  );
}

function formatValue(
  value,
  t
) {

  const normalized =
  String(value ?? "")
    .toLowerCase();

if (
  t &&
  normalized === "cash"
) {
  return t("common.cash");
}

if (
  t &&
  normalized === "visa"
) {
  return t("common.visa");
}

if (
  t &&
  normalized === "instapay"
) {
  return t("common.instapay");
}
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  if (
    Array.isArray(value)
  ) {

    return value
      .map(item => {

        if (
          typeof item ===
          "object"
        ) {

          return Object.entries(item)
            .map(
              ([k, v]) =>
                `${k}: ${v}`
            )
            .join(" | ");

        }

        return String(item);

      })
      .join(" , ");

  }

  if (
    typeof value ===
    "object"
  ) {

    return Object.entries(value)
      .map(
        ([k, v]) =>
          `${k}: ${v}`
      )
      .join(" | ");

  }
  if (t && normalized === "transfer") {
  return t("logs.transfer");
}

if (t && normalized === "adjust") {
  return t("logs.adjust");
}
if (t && normalized === "oil") {
  return t("products.types.oil");
}

if (t && normalized === "product") {
  return t("products.types.product");
}

if (t && normalized === "oil") {
  return t("products.types.oil");
}

if (t && normalized === "product") {
  return t("products.types.product");
}

if (t && normalized === "original") {
  return t("products.types.original");
}

if (t && normalized === "container") {
  return t("products.types.container");
}
if (t && normalized === "bottle") {
  return t("products.subCategories.bottle");
}

if (t && normalized === "box") {
  return t("products.subCategories.box");
}

if (t && normalized === "sample") {
  return t("products.subCategories.sample");
}
if (t && normalized === "french") {
  return t("products.oilCategories.french");
}

if (t && normalized === "oriental") {
  return t("products.oilCategories.oriental");
}

if (t && normalized === "musk") {
  return t("products.oilCategories.musk");
}
  return String(value);

}

function formatDate(
  timestamp
) {

  if (
    !timestamp?.seconds
  ) {
    return "-";
  }

  return new Date(
    timestamp.seconds *
      1000
  ).toLocaleString();
}