import AppModal from "../../../components/ui/AppModal";
export default function ReturnedModal({
  showReturned,
  setShowReturned,
  lang,
  returnedSearch,
  setReturnedSearch,
  returnedItems,
  normalizedReturnedSearch,
  selectedBranch,
  cart,
  addToCart,
  setShowCart,
  theme,
  t
}) {

  if (!showReturned) {
    return null;
  }

  return (
    <AppModal
  open={showReturned}
  onClose={() =>
    setShowReturned(false)
  }
  width="900px"
>

  <div style={{
    background:
      theme.colors.background
  }}>

        {/* Header */}
        <div style={{
          display: "flex",

          justifyContent:
            "space-between",

          alignItems: "center",

          marginBottom: "15px"
        }}>

          <h2>
            📦 {t("returns.title")}
          </h2>

          <button
            type="button"

            onClick={() =>
              setShowReturned(false)
            }
          >
            ✖
          </button>

        </div>

        {/* Search */}
        <input
          autoComplete="off"

          dir={
            lang === "ar"
              ? "rtl"
              : "ltr"
          }

          placeholder={
            t("common.search")
          }

          value={returnedSearch}

          onChange={(e) =>
            setReturnedSearch(
              e.target.value
            )
          }

          style={{
            width: "100%",

            padding: "12px",

            borderRadius: "12px",

            marginBottom: "15px",

            border:
              `1px solid ${theme.colors.border}`
          }}
        />

        {/* Items */}
        <div style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",

          gap: "12px"
        }}>

          {returnedItems
            .filter(i =>
              (i.name || "")
                .toLowerCase()
                .includes(
                  normalizedReturnedSearch
                )
            )
            .map(item => (

            <div
              key={item.id}

              style={{
                border:
                  `1px solid ${theme.colors.border}`,

                borderRadius: "16px",

                padding: "14px",

                background:
                  theme.colors.card
              }}
            >

              <div style={{
                fontWeight: "700",
                marginBottom: "6px"
              }}>
                {item.name}
              </div>

              <div style={{
                fontSize: "13px",

                opacity: 0.7,

                marginBottom: "10px"
              }}>
                {item.containerName}
              </div>

              <div style={{
                fontWeight: "700",

                color:
                  theme.colors.primary,

                marginBottom: "10px"
              }}>
                {item.price} EGP
              </div>

              <button
                type="button"

                onClick={() => {

                  if (
                    selectedBranch !== "all" &&
                    item.branchId !== selectedBranch
                  ) {
                    return;
                  }

                  const alreadyExists =
                    cart.find(
                      c =>
                        c.returnedItemId === item.id
                    );

                  if (alreadyExists) {
                    return;
                  }

                  addToCart({
                    id: item.productId,

                    name: item.name,

                    price: item.price,

                    qty: 1,

                    containerType:
                      item.containerType || "",

                    containerName:
                      item.containerName || "",

                    isReturned: true,

                    returnedItemId: item.id,

                    returnId: item.returnId,

                    branchId: item.branchId
                  });

                  setShowReturned(false);

                  setShowCart(true);
                }}

                style={{
                  width: "100%",

                  padding: "10px",

                  borderRadius: "10px",

                  border: "none",

                  background:
                    theme.colors.primary,

                  color: "#fff",

                  cursor: "pointer"
                }}
              >
                {t("cart.add")} 🛒
              </button>

            </div>
          ))}

        </div>

      </div>

    </AppModal>
  );
}