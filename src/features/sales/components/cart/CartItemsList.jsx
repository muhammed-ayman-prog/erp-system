import CartItemCard from "./CartItemCard";

export default function CartItemsList({
  cart,
  theme,
  increaseQty,
  decreaseQty,
  removeItem,
  productsWithStock,
  popupActions
}) {

  return (
    <>
      {cart.map((item, index) => (

  <CartItemCard
    key={
      item.isReturned
        ? `${item.returnedItemId}_${index}`
        : `${item.id}_${item.size}_${item.containerType}_${item.oilQty}_${index}`
    }

    item={item}
    theme={theme}
    increaseQty={increaseQty}
    decreaseQty={decreaseQty}
    removeItem={removeItem}
    productsWithStock={productsWithStock}
    popupActions={popupActions}
  />

))}
    </>
  );
}