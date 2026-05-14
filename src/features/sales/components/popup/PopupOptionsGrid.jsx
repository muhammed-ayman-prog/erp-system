export default function PopupOptionsGrid({
  productsWithStock,
  containerType,
  inventoryMap,

  selectedSize,
  setSelectedSize,

  isMusk,
  isMobile,

  formatContainerName,

  theme,
  t
}) {

  return (

    <div className="popup-options-grid">

      {productsWithStock

        .filter(
          p => p.type === "container"
        )

        .filter(p => {

          const sub =

            (
              p.subCategory || ""
            )
              .toLowerCase()
              .trim();

          if (
            containerType === "bottle"
          ) {
            return sub === "bottle";
          }

          if (
            containerType === "box"
          ) {
            return sub === "box";
          }

          if (
            containerType === "sample"
          ) {

            if (isMusk) {

              return (

                sub === "samples" &&

                !p.name
                  ?.toLowerCase()
                  .includes("tester") &&

                !p.name
                  ?.includes("تستر")
              );
            }

            return sub === "samples";
          }

          return false;
        })

        .sort((a, b) => {

          const getSize = (
            name
          ) => {

            const match =
             (name || "").match(/\d+/);

            return match
              ? parseInt(match[0])
              : 0;
          };

          return (
            getSize(a.name) -
            getSize(b.name)
          );
        })

        .map(p => {

          const stock =
            inventoryMap[p.id] || 0;

          const isOut =
            stock === 0;

          const isLow =

            stock > 0 &&
            stock < 5;

          const stockText =

            isOut

              ? t(
                  "products.outOfStock"
                )

              : isLow

              ? `${t(
                  "products.low"
                )} (${stock})`

              : `${stock} ${t(
                  "products.available"
                )}`;

          return (

            <div
              key={p.id}

              className={`popup-option ${
                selectedSize?.id === p.id
                  ? "active"
                  : ""
              } ${
                isOut
                  ? "disabled"
                  : ""
              }`}

              onClick={() => {

                if (isOut) return;

                setSelectedSize(p);
              }}

              style={{

                padding:
                  isMobile
                    ? "12px"
                    : "18px",

                background:

                  selectedSize?.id ===
                  p.id

                    ? theme.colors.primary

                    : theme.colors.secondary,

                cursor:

                  isOut

                    ? "not-allowed"

                    : "pointer",

                border:

                  isOut

                    ? `1px solid ${theme.colors.danger}`

                    : `1px solid ${theme.colors.border}`
              }}
            >

              <div>

                {formatContainerName(
                  p.name
                )}

              </div>

              <div
                className="popup-option-stock"

                style={{
                  color:

                    stock > 0

                      ? theme.colors.success

                      : theme.colors.danger
                }}
              >

                {stockText}

              </div>

            </div>
          );
        })}
    </div>
  );
}