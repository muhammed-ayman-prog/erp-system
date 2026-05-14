export default function PopupOilInput({
  oilQty,
  setOilQty,
  theme,
  t
}) {

  return (

    <input
      className="popup-oil-input"

      type="number"

      placeholder={
        t("products.oilQty")
      }

      value={
        oilQty === 0
          ? ""
          : oilQty
      }

      onChange={(e) =>
        setOilQty(
          Number(e.target.value)
        )
      }

      style={{
        border:
          `1px solid ${theme.colors.border}`
      }}
    />
  );
}