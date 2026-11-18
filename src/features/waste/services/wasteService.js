import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../../../firebase";
import {
  isValidBusinessDate,
} from "../../expenses/utils/businessDate";
// ==================================================
// Products
// ==================================================

export const getWasteProducts = async () => {
  const snapshot = await getDocs(
    collection(db, "products")
  );

  return snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...productDoc.data(),
  }));
};

// ==================================================
// Realtime Stock
// ==================================================

export const subscribeToWasteStock = ({
  branchId,
  isOwner,
  onData,
  onError,
}) => {
  if (!branchId) {
    return () => {};
  }

  const stockQuery =
    isOwner && branchId === "all"
      ? query(
          collection(db, "inventory")
        )
      : query(
          collection(db, "inventory"),
          where(
            "branchId",
            "==",
            branchId
          )
        );

  return onSnapshot(
    stockQuery,
    (snapshot) => {
      const stockMap = {};

      snapshot.docs.forEach(
        (stockDoc) => {
          const data =
            stockDoc.data();

          const quantity =
            Number(
              data.quantity
            ) || 0;

          if (
            data.type === "sale" ||
            data.type === "waste"
          ) {
            stockMap[
              data.productId
            ] =
              (
                stockMap[
                  data.productId
                ] || 0
              ) - quantity;
          } else {
            stockMap[
              data.productId
            ] =
              (
                stockMap[
                  data.productId
                ] || 0
              ) + quantity;
          }
        }
      );

      onData(stockMap);
    },
    onError
  );
};

// ==================================================
// Waste History
// ==================================================

export const subscribeToWasteHistory = ({
  branchId,
  isOwner,
  onData,
  onError,
}) => {
  if (!branchId) {
    return () => {};
  }

  const wasteQuery =
    isOwner && branchId === "all"
      ? query(
          collection(db, "stock")
        )
      : query(
          collection(db, "stock"),
          where(
            "branchId",
            "==",
            branchId
          )
        );

  return onSnapshot(
    wasteQuery,
    (snapshot) => {
      const data = snapshot.docs
        .map((wasteDoc) => ({
          id: wasteDoc.id,
          ...wasteDoc.data(),
        }))
        .filter(
          (item) =>
            item.type === "waste"
        )
        .sort((a, b) => {
          const dateA =
            a.createdAt?.seconds ||
            0;

          const dateB =
            b.createdAt?.seconds ||
            0;

          return dateB - dateA;
        });

      onData(data);
    },
    onError
  );
};

// ==================================================
// Create Waste Transaction
// ==================================================

export const createWasteTransaction =
  async ({
    branchId,
    userId,
    items,
    businessDate,
  }) => {
    // ------------------------------------------------
    // Basic Validation
    // ------------------------------------------------

    if (
      !branchId ||
      !userId
    ) {
      throw new Error(
        "WASTE_INVALID_DATA"
      );
    }

    if (
      !Array.isArray(items) ||
      !items.length
    ) {
      throw new Error(
        "WASTE_NO_ITEMS"
      );
    }
    if (!isValidBusinessDate(businessDate)) {
  throw new Error("WASTE_INVALID_DATA");
}
    // ------------------------------------------------
    // Valid Items
    // ------------------------------------------------

    const validItems =
      items.filter(
        (item) =>
          item?.productId &&
          Number(item.quantity) > 0
      );

    if (!validItems.length) {
      throw new Error(
        "WASTE_NO_ITEMS"
      );
    }

    // ------------------------------------------------
    // Generate Operation ID
    //
    // Every product submitted in this action gets
    // the same wasteOperationId.
    // ------------------------------------------------

    const wasteOperationId =
      doc(
        collection(
          db,
          "stock"
        )
      ).id;

    // ------------------------------------------------
    // Combine Quantities By Product
    //
    // This is only used for inventory deduction.
    //
    // Example:
    //
    // Product A -> 2
    // Product A -> 3
    //
    // Inventory deduction = 5
    //
    // But the two waste records remain separate,
    // preserving their individual waste types/notes.
    // ------------------------------------------------

    const quantitiesByProduct =
      {};

    for (const item of validItems) {
      const productId =
        item.productId;

      const quantity =
        Number(item.quantity);

      quantitiesByProduct[
        productId
      ] =
        (
          quantitiesByProduct[
            productId
          ] || 0
        ) + quantity;
    }

    const productIds =
      Object.keys(
        quantitiesByProduct
      );

    // ==================================================
    // Firestore Transaction
    // ==================================================

    await runTransaction(
      db,
      async (transaction) => {
        // ----------------------------------------------
        // READ PHASE
        //
        // IMPORTANT:
        // All transaction reads happen before writes.
        // ----------------------------------------------

        const inventorySnapshots =
          [];

        for (
          const productId of productIds
        ) {
          const inventoryRef =
            doc(
              db,
              "inventory",
              `${branchId}_${productId}`
            );

          const inventorySnapshot =
            await transaction.get(
              inventoryRef
            );

          inventorySnapshots.push({
            productId,
            inventoryRef,
            inventorySnapshot,
          });
        }

        // ----------------------------------------------
        // VALIDATION PHASE
        // ----------------------------------------------

        for (
          const {
            inventorySnapshot,
            productId,
          } of inventorySnapshots
        ) {
          if (
            !inventorySnapshot.exists()
          ) {
            throw new Error(
              "WASTE_PRODUCT_NOT_FOUND"
            );
          }

          const currentQuantity =
            Number(
              inventorySnapshot
                .data()
                .quantity
            ) || 0;

          const requestedQuantity =
            quantitiesByProduct[
              productId
            ];

          if (
            requestedQuantity >
            currentQuantity
          ) {
            throw new Error(
              "WASTE_QTY_EXCEEDED"
            );
          }
        }

        // ----------------------------------------------
        // INVENTORY WRITE PHASE
        // ----------------------------------------------

        for (
          const {
            inventoryRef,
            productId,
          } of inventorySnapshots
        ) {
          const quantity =
            quantitiesByProduct[
              productId
            ];

          transaction.update(
            inventoryRef,
            {
              quantity:
                increment(
                  -quantity
                ),
            }
          );
        }

        // ----------------------------------------------
        // WASTE RECORDS
        // ----------------------------------------------

        for (
          const item of validItems
        ) {
          const wasteRef =
            doc(
              collection(
                db,
                "stock"
              )
            );

          transaction.set(
            wasteRef,
            {
              // ----------------------------------------
              // Product
              // ----------------------------------------

              productId:
                item.productId,

              quantity:
                Number(
                  item.quantity
                ),

              // ----------------------------------------
              // Branch
              // ----------------------------------------

              branchId,

              // ----------------------------------------
              // Stock Movement
              // ----------------------------------------

              
type: "waste",

direction: "OUT",

movementType: "WASTE",

movementSource: "WASTE",

source: "WASTE",


              // ----------------------------------------
              // Waste Operation
              // ----------------------------------------
              //
              // Same ID for every product in this
              // submission.
              //

              wasteOperationId,

              // ----------------------------------------
              // Waste Details
              // ----------------------------------------

              wasteType:
                item.wasteType ||
                null,

              note:
                item.wasteType ===
                "other"
                  ? String(
                      item.note ||
                        ""
                    ).trim()
                  : "",

              // ----------------------------------------
              // Audit
              // ----------------------------------------
              businessDate,
              createdAt:
                serverTimestamp(),

              userId,
            }
          );
        }
      }
    );

    // ------------------------------------------------
    // Return
    // ------------------------------------------------

    return {
      success: true,
      wasteOperationId,
    };
  };