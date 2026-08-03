  import CustomerSection from "./CustomerSection";
  import CartSummary from "./CartSummary";
  import CartItemsList from "./CartItemsList";
  import PaymentMethods from "./PaymentMethods";
  import CartActions from "./CartActions";
  import useCartActions from "../../hooks/useCartActions";
  import {
  useCartContext
} from "../../context/CartContext";
import {
  useSalesContext
} from "../../context/SalesContext";

 export default function Cart() {
 const {
  theme,
  t,
  selectedSeller,
  setSelectedSeller,
  selectedBranch,
  productsWithStock,
  popupActions,
  customerState,
  checkoutState,
  handleCheckoutAction,
  saleDate,
  setSaleDate,
  user,
} = useSalesContext();
  const {
  cart,
  setCart,
  increaseQty,
  decreaseQty,
  removeItem
} = useCartContext();
  
const {
  showErrors,
  setShowErrors,

  clearCart,
  handleCheckoutClick
} = useCartActions({

  setCart,

  handleCheckout:
    handleCheckoutAction,

  selectedSeller,
  setSelectedSeller
});
const {
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerData,
  getCustomerTier
} = customerState;

    return (
      <div className="card cart" style={{
    flex: 0.8,
    height: "100%",
    display: "flex",
    flexDirection: "column"
  }}>
          <h2>{t("cart.title")} 🧾</h2>
          <div className="cart-content">
          {cart.length === 0 && (
            <p style={{ color: theme.colors.textSecondary, textAlign: "center" }}>
              {t("cart.empty")}
            </p>
          )}
          <CartItemsList
            cart={cart}
            theme={theme}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
            productsWithStock={productsWithStock}
            popupActions={popupActions}
          />

          <hr />
          
          <CustomerSection
            theme={theme}
            t={t}
            employees={
              selectedBranch?.employees?.filter(
                employee => employee?.name?.trim()
              ) || []
            }

            customerName={customerName}
            setCustomerName={setCustomerName}

            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}

            customerData={customerData}
            getCustomerTier={getCustomerTier}

            seller={selectedSeller}
            setSelectedSeller={setSelectedSeller}

            showErrors={showErrors}
            setShowErrors={setShowErrors}
          />
      {
  user?.role === "owner" && (
    <div
      style={{
        marginTop: 15,
        padding: 12,
        borderRadius: 12,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.card,
      }}
    >

      <label
        style={{
          display:"block",
          marginBottom:8,
          fontWeight:700,
          color:theme.colors.text
        }}
      >
        📅 تاريخ البيع
      </label>


      <input
        type="date"

        value={
          saleDate || ""
        }

        onChange={(e)=>
          setSaleDate(
            e.target.value
          )
        }

        style={{
          width:"100%",
          height:42,
          borderRadius:10,
          border:`1px solid ${theme.colors.border}`,
          padding:"0 10px",
          background:theme.colors.card,
          color:theme.colors.text
        }}
      />


    </div>
  )
}

          
    <CartSummary />
          
          <PaymentMethods />
          
          <CartActions
            clearCart={clearCart}
            handleCheckoutClick={handleCheckoutClick}
          />
          </div>
          </div>
        
    );
  }