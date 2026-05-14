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
      {cart.map((item) => (

        <CartItemCard
          key={
            item.isReturned
              ? item.returnedItemId
              : `${item.id}_${item.size}_${item.containerType}_${item.oilQty}`
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