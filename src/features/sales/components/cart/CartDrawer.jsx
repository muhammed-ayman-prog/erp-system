import AppDrawer from "../../../../components/ui/AppDrawer";
import AppButton from "../../../../components/ui/AppButton";
export default function CartDrawer({
  showCart,
  setShowCart,
  lang,
  isMobile,
  theme,
  t,
  children
}) {

  if (!showCart) {
    return null;
  }

  return (

<AppDrawer
  open={showCart}
  onClose={() =>
    setShowCart(false)
  }
  side={
    lang === "ar"
      ? "left"
      : "right"
  }
  width={
    isMobile
      ? "100%"
      : "360px"
  }
>

<div
  style={{
    background:
      theme.colors.background,

    padding: "10px",

    minHeight: "100%"
  }}
>

        {/* Header */}
        <div style={{
          display: "flex",

          justifyContent:
            "space-between",

          alignItems: "center",

          marginBottom: "10px"
        }}>

          <h3>
            {t("cart.title")} 🧾
          </h3>

          <AppButton
            variant="secondary"
            onClick={() =>
              setShowCart(false)
            }

            style={{
              padding: "8px 12px"
            }}
          >
            ✖
          </AppButton>

        </div>

        {children}

</div>

</AppDrawer>
  );
}