import {
  doc,
  collection,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import { db } from "../../../../firebase";


export async function undoPurchaseService(
  purchase,
  user
) {

  if (!purchase?.id) {
    throw new Error("Invalid purchase");
  }


  if (purchase.undone) {
    throw new Error("Already undone");
  }


  await runTransaction(
    db,
    async (transaction) => {


      const inventoryRefs = [];

      const inventorySnapshots = [];


      // ==========================
      // 1- READS FIRST
      // ==========================

      for (const item of purchase.items || []) {

        const inventoryRef =
          doc(
            db,
            "inventory",
            `${purchase.branchId}_${item.productId}`
          );


        inventoryRefs.push({
          ref: inventoryRef,
          item,
        });


        const snap =
          await transaction.get(
            inventoryRef
          );


        inventorySnapshots.push(snap);

      }



      // ==========================
      // 2- UPDATE PURCHASE
      // ==========================

      const purchaseRef =
        doc(
          db,
          "purchases",
          purchase.id
        );


      transaction.update(
        purchaseRef,
        {
          undone: true,

          undoneAt:
            serverTimestamp(),

          undoneBy:
            user?.uid || null,

          undoneByName:
            user?.name ||
            user?.displayName ||
            "",
        }
      );



      // ==========================
      // 3- UPDATE INVENTORY
      // ==========================

      inventoryRefs.forEach(
        (entry, index) => {

          const snap =
            inventorySnapshots[index];


          if (snap.exists()) {

            const current =
              Number(
                snap.data().quantity || 0
              );


            transaction.update(
              entry.ref,
              {

                quantity:
                  Math.max(
                    0,
                    current -
                    Number(
                      entry.item.quantity || 0
                    )
                  ),

                updatedAt:
                  serverTimestamp(),

              }
            );

          }

        }
      );



      // ==========================
      // 4- CREATE STOCK LOGS
      // ==========================

      for (
        const item of purchase.items || []
      ) {


        const stockRef =
          doc(
            collection(
              db,
              "stock"
            )
          );


        transaction.set(
          stockRef,
          {

            branchId:
              purchase.branchId,


            branchName:
              purchase.branchName,


            productId:
              item.productId,


            quantity:
              item.quantity,


            direction:
              "OUT",


            movementType:
              "PURCHASE_UNDO",


            movementSource:
              "PURCHASE",


            type:
              "purchase_undo",


            createdAt:
              serverTimestamp(),


            userId:
              user?.uid || null,


            userName:
              user?.name ||
              user?.displayName ||
              "",

          }
        );

      }


    }
  );

}