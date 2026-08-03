import { useState } from "react";
import toast from "react-hot-toast";

import AppDrawer from "../../../components/ui/AppDrawer";

import { theme } from "../../../theme";

import { useApp } from "../../../store/useApp";
import { useTranslate } from "../../../useTranslate";

import { usePurchaseContext } from "../context/PurchaseContext";
import { createPurchaseService } from "../services/purchasesService";

import CartHeader from "./cart/CartHeader";
import CartItem from "./cart/CartItem";
import CartSummary from "./cart/CartSummary";
import CartFooter from "./cart/CartFooter";
import EmptyCart from "./cart/EmptyCart";


export default function PurchaseCartDrawer() {

  const { t } = useTranslate();

  const { selectedBranch } = useApp();


  const {
    showCart,
    setShowCart,

    cartItems,

    totalItems,
    totalQuantity,

    clearCart,

    removeFromCart,

    updateCartQuantity,

  } = usePurchaseContext();



  const [loading, setLoading] =
    useState(false);



  const closeDrawer = () => {

    if (!loading) {
      setShowCart(false);
    }

  };




  const handleSavePurchase = async () => {

    if (loading) return;



    if (
      !selectedBranch ||
      selectedBranch === "all"
    ) {

      toast.error(
        t("stockEntry.selectBranchFirst")
      );

      return;

    }




    if (!cartItems.length) {

      toast.error(
        t("stockEntry.emptyCart")
      );

      return;

    }




    try {

      setLoading(true);



      await createPurchaseService({

        branchId:selectedBranch,


        items: cartItems.map((item)=>({

          productId:
            item.productId,


          quantity:
            item.purchaseQuantity,

        })),

      });



      toast.success(
        t("stockEntry.purchaseSaved")
      );



      clearCart();

      closeDrawer();



    } catch(error) {

      console.error(error);


      toast.error(
        t("stockEntry.purchaseSaveFailed")
      );


    } finally {

      setLoading(false);

    }

  };




  return (

    <AppDrawer

      side="left"

      open={showCart}

      onClose={closeDrawer}

      width={410}

    >


      <div

        style={{

          display:"flex",

          flexDirection:"column",

          height:"100%",

          background:
            theme.colors.card,

        }}

      >



        <CartHeader

          totalItems={totalItems}

          hasItems={
            cartItems.length > 0
          }

          disabled={loading}

          onClear={clearCart}

          onClose={closeDrawer}

        />





        <div

          style={{

            flex:1,

            overflowY:"auto",

            padding:
              `${theme.spacing.md}px ${theme.spacing.lg}px`,

            display:"flex",

            flexDirection:"column",

            gap:
              theme.spacing.sm,

          }}

        >



          {cartItems.length === 0 ? (

            <EmptyCart />

          ) : (

            <>


              {cartItems.map((item)=>(

                <CartItem

                  key={item.productId}

                  item={item}

                  disabled={loading}


                  onUpdateQuantity={
                    updateCartQuantity
                  }


                  onRemove={() =>
                    removeFromCart(
                      item.productId
                    )
                  }

                />

              ))}





              <CartSummary

                totalItems={totalItems}

                totalQuantity={
                  totalQuantity
                }

              />



            </>

          )}


        </div>





        {cartItems.length > 0 && (


          <div

            style={{


              padding:
                `12px ${theme.spacing.lg}px ${theme.spacing.lg}px`,


              background:
                theme.colors.card,


              borderTop:
                `1px solid ${theme.colors.border}`,


            }}

          >


            <CartFooter

              loading={loading}

              onCancel={closeDrawer}

              onSave={handleSavePurchase}

            />


          </div>


        )}


      </div>


    </AppDrawer>

  );

}