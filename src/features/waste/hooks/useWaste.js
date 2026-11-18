import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../../store/useAuth";
import { useApp } from "../../../store/useApp";
import { useTranslate } from "../../../useTranslate";

import {
  createWasteTransaction,
  getWasteProducts,
  subscribeToWasteHistory,
  subscribeToWasteStock,
} from "../services/wasteService";
import {
  getTodayBusinessDate,
  isValidBusinessDate,
} from "../../expenses/utils/businessDate";
import {
  INITIAL_WASTE_ITEM,
  WASTE_TYPES,
  WASTE_PRODUCT_CATEGORIES,
} from "../constants/wasteConstants";

export default function useWaste() {
  const { t } = useTranslate();
  const { user } = useAuth();
  const { selectedBranch } = useApp();

  // ==================================================
  // Branch
  // ==================================================

  const branchToUse =
    user?.role === "owner"
      ? selectedBranch
      : user?.branchIds?.[0];

  // ==================================================
  // Data
  // ==================================================

  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [wasteList, setWasteList] = useState([]);

  // ==================================================
  // Form
  // ==================================================

const [items, setItems] = useState([
  { ...INITIAL_WASTE_ITEM },
]);

const [businessDate, setBusinessDate] = useState(
  getTodayBusinessDate
);

  // ==================================================
  // UI State
  // ==================================================

  const [showToast, setShowToast] =
    useState(false);

  const [toastText, setToastText] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ==================================================
  // Products
  // ==================================================

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const data =
          await getWasteProducts();

        if (active) {
          setProducts(data);
        }
      } catch (error) {
        console.error(
          "Failed to load waste products:",
          error
        );
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  // ==================================================
  // Realtime Stock
  // ==================================================

  useEffect(() => {
    if (!branchToUse) return;

    const unsubscribe =
      subscribeToWasteStock({
        branchId: branchToUse,
        isOwner:
          user?.role === "owner",
        onData: setStockMap,
        onError: (error) => {
          console.error(
            "Failed to listen to waste stock:",
            error
          );
        },
      });

    return unsubscribe;
  }, [
    branchToUse,
    user?.role,
  ]);

  // ==================================================
  // Realtime History
  // ==================================================

  useEffect(() => {
    if (!branchToUse) return;

    const unsubscribe =
      subscribeToWasteHistory({
        branchId: branchToUse,
        isOwner:
          user?.role === "owner",
        onData: setWasteList,
        onError: (error) => {
          console.error(
            "Failed to listen to waste history:",
            error
          );
        },
      });

    return unsubscribe;
  }, [
    branchToUse,
    user?.role,
  ]);

  // ==================================================
  // Toast
  // ==================================================

  useEffect(() => {
    if (!showToast) return;

    const timeout = setTimeout(() => {
      setShowToast(false);
    }, 1500);

    return () =>
      clearTimeout(timeout);
  }, [showToast]);

  const showMessage = useCallback(
    (message) => {
      setToastText(message);
      setShowToast(true);
    },
    []
  );

  // ==================================================
  // Form Actions
  // ==================================================

  const addRow = useCallback(() => {
    setItems((currentItems) => [
      ...currentItems,
      {
        ...INITIAL_WASTE_ITEM,
      },
    ]);
  }, []);

  const removeRow = useCallback(
    (index) => {
      setItems((currentItems) => {
        if (currentItems.length === 1) {
          return currentItems;
        }

        return currentItems.filter(
          (_, itemIndex) =>
            itemIndex !== index
        );
      });
    },
    []
  );

  // ==================================================
  // Update Item
  // ==================================================

  const updateItem = useCallback(
    (index, field, value) => {
      setItems((currentItems) =>
        currentItems.map(
          (item, itemIndex) => {
            if (itemIndex !== index) {
              return item;
            }

            const updatedItem = {
              ...item,
              [field]: value,
            };

            // ------------------------------------------
            // Category changed
            // ------------------------------------------

            if (
              field ===
              "productCategory"
            ) {
              updatedItem.productId = "";
              updatedItem.quantity = "";
            }

            // ------------------------------------------
            // Product changed
            // ------------------------------------------

            if (
              field === "productId"
            ) {
              updatedItem.quantity = "";
            }

            // ------------------------------------------
            // Waste type changed
            // ------------------------------------------

            if (
              field === "wasteType" &&
              value !==
                WASTE_TYPES.OTHER
            ) {
              updatedItem.note = "";
            }

            return updatedItem;
          }
        )
      );
    },
    []
  );

  // ==================================================
  // Reset Form
  // ==================================================

const resetForm = useCallback(() => {
  setItems([
    {
      ...INITIAL_WASTE_ITEM,
    },
  ]);

  setBusinessDate(getTodayBusinessDate());
}, []);

  // ==================================================
  // Product Helpers
  // ==================================================

  const getProductStock =
    useCallback(
      (productId) => {
        if (!productId) {
          return 0;
        }

        return (
          Number(
            stockMap[productId]
          ) || 0
        );
      },
      [stockMap]
    );

  // ==================================================
  // Products By Category
  // ==================================================

  const getProductsForCategory =
    useCallback(
      (category) => {
        if (!category) {
          return [];
        }

        const filteredProducts =
          products.filter(
            (product) => {
              const productCategory =
                product.category;

              // ----------------------------------------
              // French
              // ----------------------------------------

              if (
                category ===
                WASTE_PRODUCT_CATEGORIES.FRENCH
              ) {
                return (
                  productCategory ===
                  "French"
                );
              }

              // ----------------------------------------
              // Oriental
              // Oriental-A / Oriental-B / Oriental-C
              // ----------------------------------------

              if (
                category ===
                WASTE_PRODUCT_CATEGORIES.ORIENTAL
              ) {
                return (
                  typeof productCategory ===
                    "string" &&
                  productCategory.startsWith(
                    "Oriental"
                  )
                );
              }

              // ----------------------------------------
              // Musk
              // ----------------------------------------

              if (
                category ===
                WASTE_PRODUCT_CATEGORIES.MUSK
              ) {
                return (
                  productCategory ===
                  "Musk"
                );
              }

              // ----------------------------------------
              // Body
              // ----------------------------------------

              if (
                category ===
                WASTE_PRODUCT_CATEGORIES.BODY
              ) {
                return (
                  productCategory ===
                    "Body" ||
                  productCategory ===
                    "Makhmaria"
                );
              }

              // ----------------------------------------
              // Original
              // ----------------------------------------

              if (
                category ===
                WASTE_PRODUCT_CATEGORIES.ORIGINAL
              ) {
                return (
                  productCategory ===
                  "Original"
                );
              }

              // ----------------------------------------
              // Container
              // ----------------------------------------

              if (
                category ===
                WASTE_PRODUCT_CATEGORIES.CONTAINER
              ) {
                return (
                  productCategory ===
                  "container"
                );
              }

              return false;
            }
          );

        // ----------------------------------------------
        // Stock First
        // ----------------------------------------------

        return filteredProducts.sort(
          (a, b) => {
            const stockA =
              getProductStock(a.id);

            const stockB =
              getProductStock(b.id);

            if (
              stockA > 0 &&
              stockB <= 0
            ) {
              return -1;
            }

            if (
              stockA <= 0 &&
              stockB > 0
            ) {
              return 1;
            }

            if (
              stockB !== stockA
            ) {
              return (
                stockB - stockA
              );
            }

            return String(
              a.name || ""
            ).localeCompare(
              String(
                b.name || ""
              ),
              undefined,
              {
                sensitivity:
                  "base",
              }
            );
          }
        );
      },
      [
        products,
        getProductStock,
      ]
    );

  // ==================================================
  // Product Lookup
  // ==================================================

  const productMap = useMemo(() => {
    return products.reduce(
      (map, product) => {
        map[product.id] =
          product;

        return map;
      },
      {}
    );
  }, [products]);

  // ==================================================
  // Waste Operations
  //
  // Groups multiple waste records that belong
  // to the same submission.
  // ==================================================

  const wasteOperations =
    useMemo(() => {
      const operationsMap =
        new Map();

      wasteList.forEach(
        (item) => {
          /*
           * New records have wasteOperationId.
           *
           * Old records don't have one, so we use
           * their document ID as a fallback.
           * This keeps existing history working.
           */

          const operationId =
            item.wasteOperationId ||
            item.id;

          if (
            !operationsMap.has(
              operationId
            )
          ) {
            operationsMap.set(
              operationId,
              {
                id: operationId,

                items: [],

                totalQuantity: 0,

                createdAt:
                  item.createdAt ||
                  null,

                branchId:
                  item.branchId ||
                  null,

                userId:
                  item.userId ||
                  null,
              }
            );
          }

          const operation =
            operationsMap.get(
              operationId
            );

          const quantity =
            Number(
              item.quantity
            ) || 0;

          const product =
            productMap[
              item.productId
            ];

          operation.items.push({
            ...item,

            productName:
              product?.name ||
              item.productName ||
              "—",

            productCategory:
              product?.category ||
              null,
          });

          operation.totalQuantity +=
            quantity;

          // Keep the latest timestamp
          if (
            item.createdAt?.seconds >
            operation.createdAt
              ?.seconds
          ) {
            operation.createdAt =
              item.createdAt;
          }
        }
      );

      return Array.from(
        operationsMap.values()
      ).sort(
        (a, b) => {
          const dateA =
            a.createdAt?.seconds ||
            0;

          const dateB =
            b.createdAt?.seconds ||
            0;

          return (
            dateB - dateA
          );
        }
      );
    }, [
      wasteList,
      productMap,
    ]);

  // ==================================================
  // Derived Statistics
  // ==================================================

  const stats = useMemo(() => {
    // ----------------------------------------------
    // Total Operations
    // ----------------------------------------------

    const totalOperations =
      wasteOperations.length;

    // ----------------------------------------------
    // Total Quantity
    // ----------------------------------------------

    const totalQuantity =
      wasteList.reduce(
        (total, item) =>
          total +
          (Number(
            item.quantity
          ) || 0),
        0
      );

    // ----------------------------------------------
    // Waste Type Counts
    //
    // Count operations containing the type,
    // not simply number of documents.
    // ----------------------------------------------

    const wasteTypeCounts =
      {};

    wasteOperations.forEach(
      (operation) => {
        const typesInOperation =
          new Set();

        operation.items.forEach(
          (item) => {
            if (
              item.wasteType
            ) {
              typesInOperation.add(
                item.wasteType
              );
            }
          }
        );

        typesInOperation.forEach(
          (type) => {
            wasteTypeCounts[type] =
              (
                wasteTypeCounts[
                  type
                ] || 0
              ) + 1;
          }
        );
      }
    );

    const topWasteType =
      Object.entries(
        wasteTypeCounts
      ).sort(
        (a, b) =>
          b[1] - a[1]
      )[0] || null;

    return {
      totalOperations,

      totalQuantity,

      topWasteType:
        topWasteType?.[0] ||
        null,

      topWasteTypeCount:
        topWasteType?.[1] ||
        0,
    };
  }, [
    wasteList,
    wasteOperations,
  ]);

  // ==================================================
  // Submit Waste
  // ==================================================

  const handleWaste =
    useCallback(
      async () => {
        // --------------------------------------------
        // Branch
        // --------------------------------------------

        if (
          !branchToUse ||
          branchToUse === "all"
        ) {
          showMessage(
            t(
              "waste.selectBranch"
            )
          );

          return;
        }
        // Validate Waste Date
        if (!isValidBusinessDate(businessDate)) {
          showMessage("اختر تاريخ الهدر بشكل صحيح");
          return;
        }
        // --------------------------------------------
        // Valid Items
        // --------------------------------------------

        const validItems =
          items.filter(
            (item) =>
              item.productId &&
              Number(
                item.quantity
              ) > 0
          );

        if (
          !validItems.length
        ) {
          showMessage(
            t(
              "waste.addItems"
            )
          );

          return;
        }

        // --------------------------------------------
        // Validate Every Item
        // --------------------------------------------

        for (
          const item of validItems
        ) {
          // ------------------------------------------
          // Category
          // ------------------------------------------

          if (
            !item.productCategory
          ) {
            showMessage(
              t(
                "products.selectCategory"
              )
            );

            return;
          }

          // ------------------------------------------
          // Waste Type
          // ------------------------------------------

          if (
            !item.wasteType
          ) {
            showMessage(
              t(
                "waste.selectType"
              )
            );

            return;
          }

          // ------------------------------------------
          // Other Notes
          // ------------------------------------------

          if (
            item.wasteType ===
              WASTE_TYPES.OTHER &&
            !String(
              item.note || ""
            ).trim()
          ) {
            showMessage(
              t(
                "waste.otherNotesRequired"
              )
            );

            return;
          }

          // ------------------------------------------
          // Quantity
          // ------------------------------------------

          const quantity =
            Number(
              item.quantity
            );

          const availableStock =
            getProductStock(
              item.productId
            );

          if (
            quantity <= 0
          ) {
            showMessage(
              t(
                "waste.addItems"
              )
            );

            return;
          }

          if (
            quantity >
            availableStock
          ) {
            showMessage(
              t(
                "waste.qtyExceeded"
              )
            );

            return;
          }
        }

        // --------------------------------------------
        // Submit
        // --------------------------------------------

        setIsSubmitting(true);

        try {
          await createWasteTransaction(
            {
              branchId: branchToUse,
              userId: user?.uid,
              items: validItems,
              businessDate,
            }
          );

          resetForm();

          showMessage(
            t(
              "waste.success"
            )
          );
        } catch (error) {
          console.error(
            "Waste submission failed:",
            error
          );

          const errorMessage =
            error?.message;

          if (
            errorMessage ===
            "WASTE_PRODUCT_NOT_FOUND"
          ) {
            showMessage(
              t(
                "waste.productNotFound"
              )
            );
          } else if (
            errorMessage ===
            "WASTE_QTY_EXCEEDED"
          ) {
            showMessage(
              t(
                "waste.qtyExceeded"
              )
            );
          } else if (
            errorMessage ===
            "WASTE_NO_ITEMS"
          ) {
            showMessage(
              t(
                "waste.addItems"
              )
            );
          } else if (
            errorMessage ===
            "WASTE_INVALID_DATA"
          ) {
            showMessage(
              t(
                "common.error"
              )
            );
          } else {
            showMessage(
              t(
                "common.error"
              )
            );
          }
        } finally {
          setIsSubmitting(false);
        }
      },
      [
        branchToUse,
        businessDate,
        getProductStock,
        items,
        resetForm,
        showMessage,
        t,
        user?.uid,
      ]
    );

  // ==================================================
  // Return
  // ==================================================

  return {
    // ----------------------------------------------
    // Context
    // ----------------------------------------------

    user,
    branchToUse,

    // ----------------------------------------------
    // Data
    // ----------------------------------------------
    businessDate,
    setBusinessDate,
    products,
    productMap,
    stockMap,
    wasteList,
    wasteOperations,

    // ----------------------------------------------
    // Statistics
    // ----------------------------------------------

    stats,

    // ----------------------------------------------
    // Form
    // ----------------------------------------------

    items,

    // ----------------------------------------------
    // Form Actions
    // ----------------------------------------------

    updateItem,
    addRow,
    removeRow,
    resetForm,
    handleWaste,

    // ----------------------------------------------
    // Product Helpers
    // ----------------------------------------------

    getProductsForCategory,
    getProductStock,

    // ----------------------------------------------
    // Constants
    // ----------------------------------------------

    WASTE_TYPES,
    WASTE_PRODUCT_CATEGORIES,

    // ----------------------------------------------
    // UI State
    // ----------------------------------------------

    isSubmitting,
    showToast,
    toastText,
  };
}