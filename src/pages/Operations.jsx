import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  setDoc,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  query,
  serverTimestamp,
  updateDoc,
  orderBy,
  limit
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useTranslate } from "../useTranslate";
import ProductsManagement from
"../components/operations/ProductsManagement";
import AddProductSection from
"../components/operations/AddProductSection";
import LogsSection from
"../components/operations/LogsSection";
import ArchivedProducts from
"../components/operations/ArchivedProducts";
import EditProductModal from
"../components/operations/EditProductModal";
import ProductHistoryModal from
"../components/operations/ProductHistoryModal";
import { useAuth } from "../store/useAuth";
const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  dark: "#111827",
  gray: "#f3f4f6"
};
export default function Operations() {
  const { user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { t, tt, lang } = useTranslate();
  const [products, setProducts] = useState([]);
  const [activeAction, setActiveAction] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] =
  useState(null);

  const [editProductData, setEditProductData] =
  useState(null);
  const [editData, setEditData] = useState(null);


  const [branches, setBranches] = useState([]);
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [productId, setProductId] = useState("");
  const [availableQty, setAvailableQty] = useState(0);

  const [adjustBranch, setAdjustBranch] = useState("");
  const [adjustProduct, setAdjustProduct] = useState("");
  const [adjustType, setAdjustType] = useState("increase"); // increase / decrease
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustments, setAdjustments] = useState([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductType, setNewProductType] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newOilCategory, setNewOilCategory] = useState("");
  const [newProductSubCategory, setNewProductSubCategory] = useState("");
  const [newPricingTier, setNewPricingTier] = useState("");
  const [newProductCost, setNewProductCost] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [adjustAvailableQty, setAdjustAvailableQty] = useState(0);
  const [productsAccordionOpen, setProductsAccordionOpen] =
  useState(false);
  const [openGroups, setOpenGroups] =
  useState({});
  const [openContainerGroups, setOpenContainerGroups] =
  useState({});
  const [openOilGroups, setOpenOilGroups] =
useState({});
  const [productLogs, setProductLogs] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
const [logSearch, setLogSearch] = useState("");
const [logFilter, setLogFilter] = useState("");
const [activeLogTab, setActiveLogTab] =
useState("activity");
const [selectedProductHistory,
setSelectedProductHistory] =
useState(null);

const [productHistory,
setProductHistory] =
useState([]);
  
  useEffect(() => {
    const fetchQty = async () => {
      if (!fromBranch || !productId) {
        setAvailableQty(0);
        return;
      }

      try {
        const ref = doc(db, "inventory", `${fromBranch}_${productId}`);
        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
          setAvailableQty(docSnap.data().quantity || 0);
        } else {
          setAvailableQty(0);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchQty();
  }, [fromBranch, productId]);
  useEffect(() => {
    const fetchAdjustQty = async () => {
      if (!adjustBranch || !adjustProduct) {
        setAdjustAvailableQty(0);
        return;
      }

      try {
        const ref = doc(db, "inventory", `${adjustBranch}_${adjustProduct}`);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setAdjustAvailableQty(snap.data().quantity || 0);
        } else {
          setAdjustAvailableQty(0);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchAdjustQty();
  }, [adjustBranch, adjustProduct]);
  const [qty, setQty] = useState("");
  const [transfers, setTransfers] = useState([]);
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, "transfers"))
        );

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // 🔥 sort هنا
        data.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });

        setTransfers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTransfers();
  }, []);
  useEffect(() => {
    const fetchAdjustments = async () => {
      try {
        const snapshot = await getDocs(collection(db, "adjustments"));

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAdjustments(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAdjustments();
  }, []);

  // 📥 تحميل الفروع
  useEffect(() => {
    const fetchBranches = async () => {
      const snapshot = await getDocs(collection(db, "branches"));

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setBranches(data);
    };

    fetchBranches();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProducts(
      data.filter(
        p => !p.isArchived
      )
    );
    setArchivedProducts(
      data.filter(
        p => p.isArchived
      )
    );
    };

    fetchProducts();
  }, []);
  useEffect(() => {

  const fetchProductLogs = async () => {

    try {

      const q = query(
        collection(db, "productLogs")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      data.sort((a, b) => {

        const dateA =
          a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);

        const dateB =
          b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);

        return dateB - dateA;

      });

      setProductLogs(data);

    } catch (err) {

      console.error(err);

    }

  };

  fetchProductLogs();

}, []);
  useEffect(() => {
    setQty("");
  }, [productId, fromBranch]);
  const [search, setSearch] = useState("");
  const [productSearch, setProductSearch] =
  useState("");
  const [filterBranch, setFilterBranch] = useState("");
  useEffect(() => {
    if (!search) setFilterBranch("");
  }, [search]);
  useEffect(() => {
    setFilterBranch("");
  }, [fromBranch, toBranch]);


  // 🔄 Transfer Logic
  const handleTransfer = async () => {
    if (!fromBranch || !toBranch || !productId || Number(qty) <= 0) {
      toast.error(t("common.error"));
      return;
    }

    if (fromBranch === toBranch) {
      toast.error(t("operations.sameBranch"));
      return;
    }
    setTransferLoading(true);
    try {
      const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
      const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

      await runTransaction(db, async (transaction) => {
        const fromSnap = await transaction.get(fromRef);
        const toSnap = await transaction.get(toRef);

        const fromQty = fromSnap.exists()
          ? fromSnap.data().quantity || 0
          : 0;

        const toQty = toSnap.exists()
          ? toSnap.data().quantity || 0
          : 0;

        if (fromQty < Number(qty)) {
          throw new Error(t("operations.notEnoughStock"));
        }

        // ➖ خصم
        transaction.set(
          fromRef,
          {
            branchId: fromBranch,
            productId,
            quantity: fromQty - Number(qty)
          },
          { merge: true }
        );

        // ➕ إضافة
        transaction.set(
          toRef,
          {
            branchId: toBranch,
            productId,
            quantity: toQty + Number(qty)
          },
          { merge: true }
        );
      });
      const docRef = await addDoc(collection(db, "transfers"), {
        fromBranch,
        toBranch,
        productId,
        qty: Number(qty),
        user: user?.name || "unknown",
        createdAt: serverTimestamp(),
        reversed: false
      });
      setTransfers(prev => [
        {
          id: docRef.id, // 🔥 الصح
          fromBranch,
          toBranch,
          productId,
          qty: Number(qty),
          user: user?.name || "unknown",
          createdAt: new Date(),
          reversed: false
        },
        ...prev
      ]);
      toast.success(
  t("operations.transferSuccess")
);

setFromBranch("");
setToBranch("");
setProductId("");
setQty("");
setActiveAction(null);
} catch (err) {

  console.error(err);

  toast.error(err.message);

} finally {

  setTransferLoading(false);

}
};
      
  
  const branchKeyMap = {
    "Abbas Akkad 1": "abbasAkkad1",
    "Abbas Akkad 2": "abbasAkkad2",
    "Abbas Akkad 3": "abbasAkkad3",
    "City Stars": "cityStars",
    "El Obour": "elObour",
    "El Rehab": "elRehab"
  };


  const productMap = useMemo(
    () => Object.fromEntries(products.map(p => [p.id, p.name])),
    [products]
  );
  const branchMap = useMemo(
    () => Object.fromEntries(branches.map(b => [b.id, b.name])),
    [branches]
  );

  const getBranchName = (id) => {
    if (!id) return "";

    const name = branchMap[id] || id;
    const key = branchKeyMap[name];

    return key ? t(`branches.${key}`) : name;
  };

  const allActivities = useMemo(() => {
    const combined = [
      ...transfers.map(t => ({ ...t, actionType: "transfer" })),
      ...adjustments.map(a => ({ ...a, actionType: "adjust" }))
    ];

    return combined
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
  }, [transfers, adjustments]);
  const filteredActivities = allActivities.filter(item => {
    const productName =
      (productMap[item.productId] || item.productId).toLowerCase();




    const branchName =
      getBranchName(item.fromBranch) ||
      getBranchName(item.toBranch) ||
      getBranchName(item.branchId) ||
      "";

    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      productName.includes(searchValue) ||
      (branchName || "").toLowerCase().includes(searchValue);

    const matchesFilter =
      !filterBranch ||
      item.fromBranch === filterBranch ||
      item.toBranch === filterBranch ||
      item.branchId === filterBranch;

    return matchesSearch && matchesFilter;
  });
  const filteredProducts = useMemo(() => {

  return products
    .filter(
      product =>
        product.name
          ?.toLowerCase()
          .includes(
            (productSearch || "")
              .toLowerCase()
          )
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );

}, [products, productSearch]);  

  const handleUndo = async () => {
    if (!selectedActivity) return;

    const oldData = selectedActivity;

    // 🔥 ADD HERE
    if (oldData.reversed) {
      toast.error("Already reversed");
      return;
    }

    try {
      if (oldData.actionType === "transfer") {
        const { fromBranch, toBranch, productId } = oldData;
        const amount = Number(oldData.qty);

        const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
        const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

        await runTransaction(db, async (t) => {
          const fromSnap = await t.get(fromRef);
          const toSnap = await t.get(toRef);

          const fromQty = fromSnap.exists() ? fromSnap.data().quantity || 0 : 0;
          const toQty = toSnap.exists() ? toSnap.data().quantity || 0 : 0;

          t.set(fromRef, { quantity: fromQty + amount }, { merge: true });
          if (toQty - amount < 0) {
            throw new Error("Invalid inventory state");
          }

          t.set(toRef, { quantity: toQty - amount }, { merge: true });
        });
      }

      if (oldData.actionType === "adjust") {
        const { branchId, productId, qty, adjustType } = oldData;

        const ref = doc(db, "inventory", `${branchId}_${productId}`);

        await runTransaction(db, async (t) => {
          const snap = await t.get(ref);
          const currentQty = snap.exists() ? snap.data().quantity || 0 : 0;

          let newQty =
            adjustType === "increase"
              ? currentQty - qty
              : currentQty + qty;

          if (newQty < 0) {
            throw new Error("Invalid inventory state");
          }

          t.set(ref, { quantity: newQty }, { merge: true });
        });
      }

      // 🔥 بدل delete → mark reversed
      const collectionName =
        oldData.actionType === "transfer"
          ? "transfers"
          : "adjustments";

      await updateDoc(doc(db, collectionName, oldData.id), {
        reversed: true
      });
      if (collectionName === "transfers") {

  setTransfers(prev =>
    prev.map(item =>
      item.id === oldData.id
        ? { ...item, reversed: true }
        : item
    )
  );

} else {

  setAdjustments(prev =>
    prev.map(item =>
      item.id === oldData.id
        ? { ...item, reversed: true }
        : item
    )
  );

}

      toast.success(t("operations.undoSuccess"));
      setSelectedActivity(null);

    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleAdjust = async () => {
    if (!adjustBranch || !adjustProduct || Number(adjustQty) <= 0) {
      toast.error(t("common.error"));
      return;
    }
    setAdjustLoading(true);
    try {
      const ref = doc(db, "inventory", `${adjustBranch}_${adjustProduct}`);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);

        const currentQty = snap.exists()
          ? snap.data().quantity || 0
          : 0;

        let newQty;

        if (adjustType === "increase") {
          newQty = currentQty + Number(adjustQty);
        } else {
          if (Number(adjustQty) > currentQty) {
            throw new Error(t("operations.notEnoughStock"));
          }
          newQty = currentQty - Number(adjustQty);
        }

        transaction.set(ref, {
          branchId: adjustBranch,
          productId: adjustProduct,
          quantity: newQty
        }, { merge: true });
      });

      const docRef = await addDoc(collection(db, "adjustments"), {
        branchId: adjustBranch,
        productId: adjustProduct,
        adjustType,
        qty: Number(adjustQty),
        reason: adjustReason,
        user: user?.name || "unknown",
        createdAt: serverTimestamp(),
        reversed: false
      });
      setAdjustments(prev => [
        {
          id: docRef.id, // 🔥 الصح
          branchId: adjustBranch,
          productId: adjustProduct,
          adjustType,
          qty: Number(adjustQty),
          reason: adjustReason,
          user: user?.name || "unknown",
          createdAt: new Date(),
          reversed: false
        },
        ...prev
      ]);

      toast.success(t("common.save"));

      setAdjustBranch("");
      setAdjustProduct("");
      setAdjustQty("");
      setAdjustReason("");
      setAdjustType("increase");
      setActiveAction(null);
      setAdjustLoading(false);

    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setAdjustLoading(false);
    }
  };
  const handleCreateProduct = async () => {

    if (
      !newProductName ||
      !newProductType ||

      (
        newProductType === "oil" &&
        (
          !newOilCategory ||
          !newPricingTier
        )
      ) ||

      (
        newProductType === "container" &&
        !newProductSubCategory
      ) ||

      (
        (
          newProductType === "product" ||
          newProductType === "original"
        ) &&
        !newProductCategory
      )
    ) {

      toast.error("Fill required fields");

      return;
    }
    const existingProduct = products.find(
  p =>
    p.name.trim().toLowerCase() ===
    newProductName.trim().toLowerCase()
);

if (existingProduct) {

  toast.error("Product already exists");

  return;

}
    setCreateLoading(true);

    try {

      // 🔥 generate id
      const normalizedName = newProductName
        .trim()
        .replace(/\s+/g, "_")
        .toLowerCase();

      const productId = normalizedName;

      // 🔥 default thresholds
      let minStock = 3;

      if (newProductType === "oil") {
        minStock = 50;
      }

      if (
        newProductType === "container"
      ) {

        if (
          newProductSubCategory === "bottle"
        ) {
          minStock = 30;
        }

        if (
          newProductSubCategory === "box"
        ) {
          minStock = 15;
        }

        if (
          newProductSubCategory === "sample"
        ) {
          minStock = 10;
        }
      }

      // 🔥 create product
      await setDoc(
        doc(db, "products", productId),
        {
          name: newProductName,

          type: newProductType,



          subCategory:
            newProductSubCategory || null,
          oilCategory:
            newOilCategory || null,
          category:
            newProductType === "oil"
              ? (
                  newOilCategory === "French"
                    ? "French"
                  : newOilCategory === "Oriental"
                    ? `Oriental-${newPricingTier}`
                  : "Musk"
                )
              : newProductCategory || null,
          pricingTier:
            newPricingTier || null,
          muskType:
            newOilCategory === "Musk"
              ? newPricingTier
              : null,

          costPrice:
            Number(newProductCost) || 0,

          sellingPrice:
          (
            newProductType === "product" ||
            newProductType === "original"
          )
            ? Number(newProductPrice) || 0
            : null,

          minStock,

          createdAt: serverTimestamp(),

          createdBy:
            user?.name || "unknown",

          isArchived: false
        }
      );

      // 🔥 create inventory docs
      await Promise.all(

        branches.map(branch => {

          return setDoc(
            doc(
              db,
              "inventory",
              `${branch.id}_${productId}`
            ),
            {
              branchId: branch.id,
              productId,
              quantity: 0
            }
          );

        })
      );
      // 🔥 auto create pricing docs
        if (
          newProductType === "container" &&
          (
            newProductSubCategory === "bottle" ||
            newProductSubCategory === "sample"
          )
        ) {
          const normalizedName = newProductName
          .trim()
          .replace(/\s+/g, "_");
          const pricingDocs = [

            {
              id: `french_${newProductSubCategory}_${normalizedName}`,

              data: {
                category: "french",
                container: newProductSubCategory,
                size: newProductName,
                price: 0
              }
            },

            {
              id: `oriental_A_${newProductSubCategory}_${normalizedName}`,

              data: {
                category: "oriental",
                grade: "A",
                container: newProductSubCategory,
                size: newProductName,
                price: 0
              }
            },

            {
              id: `oriental_B_${newProductSubCategory}_${normalizedName}`,

              data: {
                category: "oriental",
                grade: "B",
                container: newProductSubCategory,
                size: newProductName,
                price: 0
              }
            },

            {
              id: `oriental_C_${newProductSubCategory}_${normalizedName}`,

              data: {
                category: "oriental",
                grade: "C",
                container: newProductSubCategory,
                size: newProductName,
                price: 0
              }
            }

          ];

          for (const item of pricingDocs) {

            await setDoc(
              doc(db, "pricing", item.id),
              item.data,
              { merge: true }
            );

          }
        }

      // 🔥 refresh products
      setProducts(prev => [
        ...prev,
        {
          id: productId,

          name: newProductName,

          type: newProductType,

          category:
            newProductCategory || null,

          subCategory:
            newProductSubCategory || null,

          costPrice:
            Number(newProductCost) || 0,

          sellingPrice:
          (
            newProductType === "product" ||
            newProductType === "original"
          )
            ? Number(newProductPrice) || 0
            : null,

          minStock
        }
      ]);
      await addDoc(
  collection(db, "productLogs"),
  {
    action: "create",

    productId,

    productName: newProductName,

    type: newProductType,

    category:
      newProductCategory ||

      (
        newProductType === "oil"
          ? newOilCategory
          : null
      ),

    user:
      user?.name || "unknown",

    createdAt:
      serverTimestamp()
  }
);
      toast.success("Product created");

      // 🔥 reset
      setNewProductName("");
      setNewProductType("");
      setNewProductCategory("");
      setNewProductSubCategory("");
      setNewProductCost("");
      setNewProductPrice("");
      setNewOilCategory("");
      setNewPricingTier("");

      setActiveAction(null);

    } catch (err) {

  console.error(err);

  toast.error(err.message);

} finally {

  setCreateLoading(false);

}
  };
  const handleArchiveProduct = async (product) => {

  const confirmArchive = window.confirm(
    `Archive ${product.name} ?`
  );

  if (!confirmArchive) return;

  try {

    await setDoc(
      doc(db, "products", product.id),
      {
        isArchived: true
      },
      { merge: true }
    );
    await addDoc(
  collection(db, "productLogs"),
  {
    action: "archive",

    productId: product.id,

    productName: product.name,

    type: product.type,

    user:
      user?.name || "unknown",

    createdAt:
      serverTimestamp()
  }
);
setProductLogs(prev => [
  {
    action: "archive",

    productName: product.name,

    type: product.type,

    user:
      user?.name || "unknown",

    createdAt: new Date()
  },
  ...prev
]);


    // 🔥 remove from local state
    setProducts(prev =>
      prev.filter(p => p.id !== product.id)
    );
    setArchivedProducts(prev => [
  ...prev,
  {
    ...product,
    isArchived: true
  }
]);

    toast.success("Product archived");

  } catch (err) {

    console.error(err);

    toast.error(err.message);

  }
};
const handleRestoreProduct = async (product) => {

  try {

    await setDoc(
      doc(db, "products", product.id),
      {
        isArchived: false
      },
      { merge: true }
    );

    await addDoc(
      collection(db, "productLogs"),
      {
        action: "restore",

        productId: product.id,

        productName: product.name,

        type: product.type,

        user:
          user?.name || "unknown",

        createdAt:
          serverTimestamp()
      }
    );
    setProductLogs(prev => [
  {
    action: "restore",

    productName: product.name,

    type: product.type,

    user:
      user?.name || "unknown",

    createdAt: new Date()
  },
  ...prev
]);

    setArchivedProducts(prev =>
      prev.filter(p => p.id !== product.id)
    );

    setProducts(prev => [
      ...prev,
      {
        ...product,
        isArchived: false
      }
    ]);

    toast.success("Product restored");

  } catch (err) {

    console.error(err);

    toast.error(err.message);

  }

};
const handleSaveProductEdit = async () => {

  if (
    !editingProduct ||
    !editProductData
  ) return;

  try {

    await updateDoc(
      doc(
        db,
        "products",
        editingProduct.id
      ),
      {
        name:
          editProductData.name,

        costPrice:
          Number(
            editProductData.costPrice
          ) || 0,

        

        minStock:
          Number(
            editProductData.minStock
          ) || 0
      }
    );

    await addDoc(
      collection(db, "productLogs"),
      {
        action: "edit",

        productId:
          editingProduct.id,

        productName:
          editProductData.name,

        type:
          editingProduct.type,

        user:
          user?.name || "unknown",

        createdAt:
          serverTimestamp()
      }
    );

    setProductLogs(prev => [
      {
        action: "edit",

        productName:
          editProductData.name,

        type:
          editingProduct.type,

        user:
          user?.name || "unknown",

        createdAt:
          new Date()
      },
      ...prev
    ]);

    setProducts(prev =>
      prev.map(product =>

        product.id ===
        editingProduct.id

          ? {
              ...product,

              ...editProductData
            }

          : product
      )
    );

    toast.success(
      "Product updated"
    );

    setEditingProduct(null);

    setEditProductData(null);

  } catch (err) {

    console.error(err);

    toast.error(err.message);

  }

};
const openProductHistory = (
  product
) => {

  const productActivityLogs =
    allActivities.filter(
      item =>
        item.productId === product.id
    );

  const productActionLogs =
    productLogs.filter(
      log =>
        log.productName === product.name
    );

  const merged = [

    ...productActivityLogs.map(
      item => ({
        ...item,
        logType: "activity"
      })
    ),

    ...productActionLogs.map(
      item => ({
        ...item,
        logType: "product"
      })
    )

  ];

  merged.sort((a, b) => {

    const aTime =
      a.createdAt?.seconds
        ? a.createdAt.seconds
        : new Date(a.createdAt).getTime();

    const bTime =
      b.createdAt?.seconds
        ? b.createdAt.seconds
        : new Date(b.createdAt).getTime();

    return bTime - aTime;

  });

  setProductHistory(merged);

  setSelectedProductHistory(product);

};
  const branchOrder = [
    "abbasAkkad1",
    "abbasAkkad2",
    "abbasAkkad3",
    "cityStars",
    "elObour",
    "elRehab"
  ];

  const sortedBranches = useMemo(() => {
    const orderMap = Object.fromEntries(
      branchOrder.map((id, index) => [id, index])
    );

    return [...branches].sort((a, b) => {
      const keyA = branchKeyMap[a.name]; // 🔥 المهم
      const keyB = branchKeyMap[b.name];

      const indexA = orderMap[keyA] ?? 999;
      const indexB = orderMap[keyB] ?? 999;

      return indexA - indexB;
    });
  }, [branches]);

  const handleEditSave = async () => {
    if (selectedActivity?.reversed) {
      toast.error("Already reversed");
      return;
    }
    const oldData = selectedActivity;
    if (!editData) return;

    try {
      // 🔴 1) reverse القديم
      if (oldData.actionType === "transfer") {
        const { fromBranch, toBranch, productId, qty } = oldData;

        const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
        const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

        await runTransaction(db, async (t) => {
          const fromSnap = await t.get(fromRef);
          const toSnap = await t.get(toRef);

          const fromQty = fromSnap.exists()
            ? fromSnap.data().quantity || 0
            : 0;
          const toQty = toSnap.exists()
            ? toSnap.data().quantity || 0
            : 0;

          t.set(fromRef, { quantity: fromQty + qty }, { merge: true });
          if (toQty - qty < 0) {
            throw new Error("Invalid reverse transfer");
          }

          t.set(toRef, { quantity: toQty - qty }, { merge: true });
        });
      }

      if (oldData.actionType === "adjust") {
        const { branchId, productId, qty, adjustType } = oldData;

        const ref = doc(db, "inventory", `${branchId}_${productId}`);

        await runTransaction(db, async (t) => {
          const snap = await t.get(ref);
          const currentQty = snap.exists()
            ? snap.data().quantity || 0
            : 0;

          let reversed =
            adjustType === "increase"
              ? currentQty - qty
              : currentQty + qty;

          if (reversed < 0) {
            throw new Error("Invalid reverse operation");
          }

          t.set(ref, { quantity: reversed }, { merge: true });
        });
      }

      // 🟢 2) apply الجديد
      if (oldData.actionType === "transfer") {
        const { fromBranch, toBranch, productId, qty } = editData;

        const fromRef = doc(db, "inventory", `${fromBranch}_${productId}`);
        const toRef = doc(db, "inventory", `${toBranch}_${productId}`);

        await runTransaction(db, async (t) => {
          const fromSnap = await t.get(fromRef);
          const toSnap = await t.get(toRef);

          const fromQty = fromSnap.exists()
            ? fromSnap.data().quantity || 0
            : 0;
          const toQty = toSnap.exists()
            ? toSnap.data().quantity || 0
            : 0;

          const amount = Number(qty);

          if (fromQty < amount) throw new Error("Not enough stock");

          t.set(fromRef, { quantity: fromQty - amount }, { merge: true });
          t.set(toRef, { quantity: toQty + amount }, { merge: true });
        });
      }

      if (oldData.actionType === "adjust") {
        const { branchId, productId, qty, adjustType } = editData;

        const ref = doc(db, "inventory", `${branchId}_${productId}`);

        await runTransaction(db, async (t) => {
          const snap = await t.get(ref);
          const currentQty = snap.exists()
            ? snap.data().quantity || 0
            : 0;

          if (adjustType === "decrease" && Number(qty) > currentQty) {
            throw new Error("Not enough stock");
          }

          let newQty =
            adjustType === "increase"
              ? currentQty + Number(qty)
              : currentQty - Number(qty);

          if (newQty < 0) {
            throw new Error("Invalid quantity");
          }

          t.set(ref, { quantity: newQty }, { merge: true });
        });
      }

      // 🔥 3) update document
      const collectionName =
        editData.actionType === "transfer"
          ? "transfers"
          : "adjustments";

      const { actionType, ...cleanData } = editData;

      await updateDoc(
        doc(db, collectionName, oldData.id),
        cleanData
      );

      toast.success(t("common.updated"));
      setIsEditing(false);
      setSelectedActivity(null);
      setEditData(null);

    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };
  const groupedProducts = useMemo(() => {

  return filteredProducts.reduce(
    (acc, product) => {

      const type =
        product.type || "other";

      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push(product);

      return acc;

    },
    {}
  );

}, [filteredProducts]);


  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            fontSize: "14px"
          }
        }}
      />
      <div style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "auto"
      }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "10px",
          color: "#111827" // 👈 ضيف دي
        }}>
          {t("operations.title")} ⚙️
        </h1>

        <div
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)", gap: "20px",
            marginTop: "20px"
          }}>
            <button
              onClick={() =>
                setActiveAction(
                  activeAction === "transfer"
                    ? null
                    : "transfer"
                )
              }
              style={{
                padding: "15px",
                borderRadius: "15px",
                border: "none",
                background: activeAction === "transfer" ? "#3b82f6" : "#f3f4f6",
                color: activeAction === "transfer" ? "#fff" : "#000",
                cursor: "pointer",
                fontWeight: "600",
                width: "100%",
                transition: "0.2s",
                transform: activeAction === "transfer" ? "scale(1.02)" : "scale(1)",
              }}
            >
              🔄 {t("operations.transfer")}
            </button>

            <button
              onClick={() =>
                setActiveAction(
                  activeAction === "adjust"
                    ? null
                    : "adjust"
                )
              }
              style={{
                padding: "15px",
                borderRadius: "15px",
                border: "none",
                background: activeAction === "adjust" ? COLORS.success : "#f3f4f6",
                color: activeAction === "adjust" ? "#fff" : "#000",
                cursor: "pointer",
                fontWeight: "600",
                width: "100%",
                transition: "0.2s",
                transform: activeAction === "adjust" ? "scale(1.02)" : "scale(1)",
              }}
            >
              ⚖️ {t("operations.adjust")}
            </button>
            <div
  style={{
    alignSelf: "stretch"
  }}
>

  <button
    onClick={() => {

  const nextState =
    !productsAccordionOpen;

  setProductsAccordionOpen(
    nextState
  );

  if (!nextState) {

    setActiveAction(null);

  }

}}

    style={{
      padding: "15px",
      borderRadius: "15px",
      border: "none",

      background:
        productsAccordionOpen
          ? "#111827"
          : "#f3f4f6",

      color:
        productsAccordionOpen
          ? "#fff"
          : "#000",

      cursor: "pointer",

      fontWeight: "700",

      width: "100%",

      fontSize: "16px",

      transition: "0.2s"
    }}
  >
    📦 Products
  </button>

  <div
    style={{
      maxHeight:
        productsAccordionOpen
          ? "1000px"
          : "0px",

      overflowY: "auto",

      transition:
        "max-height 0.35s ease",

      marginTop:
        productsAccordionOpen
          ? "15px"
          : "0px"
    }}
  >

      {/* ADD PRODUCT BUTTON */}

      <button
        onClick={() =>
          setActiveAction(
            activeAction === "addProduct"
              ? null
              : "addProduct"
          )
        }

        style={{
          padding: "15px",
          borderRadius: "15px",
          border: "none",

          background:
            activeAction === "addProduct"
              ? "#2563eb"
              : "#f3f4f6",

          color:
            activeAction === "addProduct"
              ? "#fff"
              : "#000",

          cursor: "pointer",

          fontWeight: "600",

          width: "100%",

          marginBottom: "10px"
        }}
      >
        ➕ Add Product
      </button>

      {/* PRODUCTS MANAGEMENT BUTTON */}

      <button
        onClick={() =>
          setActiveAction(
            activeAction === "productsManagement"
              ? null
              : "productsManagement"
          )
        }

        style={{
          padding: "15px",
          borderRadius: "15px",
          border: "none",

          background:
            activeAction ===
            "productsManagement"
              ? "#dc2626"
              : "#f3f4f6",

          color:
            activeAction ===
            "productsManagement"
              ? "#fff"
              : "#000",

          cursor: "pointer",

          fontWeight: "600",

          width: "100%"
        }}
      >
        📦 Products Management
      </button>

  </div>

</div>



          </div>
          <div
            style={{
              maxHeight: activeAction === "transfer" ? "1000px" : "0px",
              opacity: activeAction === "transfer" ? 1 : 0,
              transform: activeAction === "transfer" ? "translateY(0)" : "translateY(-10px)",
              overflow: "hidden",
              transition: "max-height 0.35s ease, opacity 0.25s ease, transform 0.3s ease"
            }}
          >
            <div style={{
              background: "#ffffff",
              padding: "25px",
              borderRadius: "20px",
              marginTop: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              border: "1px solid #f1f5f9" // 👈 ضيف دي
            }}>
              <h3 style={{ marginBottom: "10px" }}>
                {t("operations.transfer")} 🔄
              </h3>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "15px"
              }}>
                <label style={{ fontWeight: "600", fontSize: "14px" }}>
                  {t("operations.fromBranch")}
                </label>
                <select
                  value={fromBranch}
                  onChange={(e) => setFromBranch(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px"
                  }}
                >
                  <option value="">{t("operations.fromBranch")}</option>
                  {sortedBranches.map(b => {


                    return (
                      <option key={b.id} value={b.id}>
                        {getBranchName(b.id)}
                      </option>
                    );
                  })}
                </select>

                <label style={{ fontWeight: "600", fontSize: "14px" }}>
                  {t("operations.toBranch")}
                </label>
                <select
                  value={toBranch}
                  onChange={(e) => setToBranch(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px"
                  }}
                >
                  <option value="">{t("operations.toBranch")}</option>
                  {sortedBranches.map(b => (
                    <option key={b.id} value={b.id}>
                      {getBranchName(b.id)}
                    </option>
                  ))}
                </select>
                <label style={{ fontWeight: "600", fontSize: "14px" }}>
                  {t("operations.selectProduct")}
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px"
                  }}
                >

                  <option value="">{t("operations.selectProduct")}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p style={{
                  background: "#eef2ff",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "600"
                }}>
                  {t("operations.available")}: {availableQty}
                </p>

                <input
                  type="number"
                  min="1"
                  max={availableQty}
                  placeholder={t("operations.quantity")}
                  value={qty}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) <= availableQty) {
                      setQty(val);
                    }
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px", outline: "none",

                  }}
                  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px #3b82f6"}
                  onBlur={(e) => e.target.style.boxShadow = "none"}
                />
                {Number(qty) > availableQty && (
                  <p style={{ color: "red", marginTop: "5px" }}>
                    {t("operations.exceedStock")} ❌
                  </p>
                )}

                <button
                  onClick={handleTransfer}
                  disabled={
                    transferLoading ||
                    !fromBranch ||
                    !toBranch ||
                    !productId ||
                    Number(qty) <= 0 ||
                    Number(qty) > availableQty}
                  style={{
                    width: "100%",
                    boxShadow: "0 4px 10px rgba(59,130,246,0.3)",
                    marginTop: "10px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      (transferLoading || !fromBranch || !toBranch || !productId || Number(qty) <= 0 || Number(qty) > availableQty)
                        ? "#9ca3af"
                        : "#3b82f6",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "0.2s",
                    opacity: transferLoading ? 0.7 : 1,
                    cursor: transferLoading ? "wait" : "pointer",
                  }}
                >
                  {transferLoading ? t("operations.loadingTransfer") : "🔄 " + t("operations.transfer")}
                </button>
              </div>
            </div>

          </div>
          <div
            style={{
              maxHeight: activeAction === "adjust" ? "1000px" : "0px",
              opacity: activeAction === "adjust" ? 1 : 0,
              transform: activeAction === "adjust" ? "translateY(0)" : "translateY(-10px)",
              overflow: "hidden",
              transition: "max-height 0.35s ease, opacity 0.25s ease, transform 0.3s ease"
            }}
          >
            <div style={{
              background: "#ffffff",
              padding: "25px",
              borderRadius: "20px",
              marginTop: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              border: "1px solid #f1f5f9"
            }}>
              <h3>{t("operations.adjust")} ⚖️</h3>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "15px"
              }}>

                {/* Branch */}
                <select
                  value={adjustBranch}
                  onChange={(e) => setAdjustBranch(e.target.value)}
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
                >
                  <option value="">{t("branches.select")}</option>
                  {sortedBranches.map(b => (
                    <option key={b.id} value={b.id}>
                      {getBranchName(b.id)}
                    </option>
                  ))}
                </select>

                {/* Product */}
                <select
                  value={adjustProduct}
                  onChange={(e) => setAdjustProduct(e.target.value)}
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
                >
                  <option value="">{t("operations.selectProduct")}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p style={{
                  background: "#ecfdf5",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "600"
                }}>
                  {t("operations.available")}: {adjustAvailableQty}
                </p>

                {/* Type */}
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
                >
                  <option value="increase">
                    {t("operations.increase")} ➕
                  </option>

                  <option value="decrease">
                    {t("operations.decrease")} ➖
                  </option>
                </select>

                {/* Quantity */}
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (
                      val === "" ||
                      adjustType === "increase" ||
                      Number(val) <= adjustAvailableQty
                    ) {
                      setAdjustQty(val);
                    }
                  }}
                  placeholder={t("operations.quantity")}
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
                />
                {adjustType === "decrease" && Number(adjustQty) > adjustAvailableQty && (
                  <p style={{ color: "red", marginTop: "5px" }}>
                    {t("operations.exceedStock")} ❌
                  </p>
                )}

                {/* Reason */}
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={t("operations.reason")}
                  style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
                />

                <button
                  onClick={handleAdjust}
                  disabled={
                    adjustLoading ||
                    !adjustBranch ||
                    !adjustProduct ||
                    Number(adjustQty) <= 0 ||
                    (adjustType === "decrease" && Number(adjustQty) > adjustAvailableQty)
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      (adjustLoading || !adjustBranch || !adjustProduct || Number(adjustQty) <= 0 ||
                        (adjustType === "decrease" && Number(adjustQty) > adjustAvailableQty))
                        ? "#9ca3af"
                        : COLORS.success,
                    color: "#fff",
                    fontWeight: "600",
                    transition: "0.2s",
                    opacity: adjustLoading ? 0.7 : 1,
                    cursor: adjustLoading ? "wait" : "pointer",
                  }}
                >
                  {adjustLoading
                    ? t("operations.loadingAdjust")
                    : "⚖️ " + t("operations.adjust")}
                </button>

              </div>
            </div>
          </div>
          {activeAction === "addProduct" && (

<AddProductSection

  activeAction={activeAction}

  newProductName={newProductName}
  setNewProductName={setNewProductName}

  newProductType={newProductType}
  setNewProductType={setNewProductType}

  newProductCategory={newProductCategory}
  setNewProductCategory={setNewProductCategory}

  newOilCategory={newOilCategory}
  setNewOilCategory={setNewOilCategory}

  newProductSubCategory={newProductSubCategory}
  setNewProductSubCategory={setNewProductSubCategory}

  newPricingTier={newPricingTier}
  setNewPricingTier={setNewPricingTier}

  newProductCost={newProductCost}
  setNewProductCost={setNewProductCost}

  newProductPrice={newProductPrice}
  setNewProductPrice={setNewProductPrice}

  createLoading={createLoading}

  handleCreateProduct={handleCreateProduct}

/>

)}
          {activeAction === "productsManagement" && (

<>

<ProductsManagement
  openProductHistory={
    openProductHistory
  }
  activeAction={activeAction}
  COLORS={COLORS}

  groupedProducts={groupedProducts}

  openGroups={openGroups}
  setOpenGroups={setOpenGroups}

  openContainerGroups={openContainerGroups}
  setOpenContainerGroups={setOpenContainerGroups}

  openOilGroups={openOilGroups}
  setOpenOilGroups={setOpenOilGroups}

  handleArchiveProduct={handleArchiveProduct}

  productSearch={productSearch}
  setProductSearch={setProductSearch}
setEditingProduct={setEditingProduct}

setEditProductData={
  setEditProductData
}

/>

<ArchivedProducts

  archivedProducts={archivedProducts}

  handleRestoreProduct={
    handleRestoreProduct
  }

/>

</>

)}
          <LogsSection

  t={t}
  COLORS={COLORS}
  productsAccordionOpen={productsAccordionOpen}
  search={search}
  setSearch={setSearch}

  filterBranch={filterBranch}
  setFilterBranch={setFilterBranch}

  sortedBranches={sortedBranches}
  getBranchName={getBranchName}

  activeLogTab={activeLogTab}
  setActiveLogTab={setActiveLogTab}

  filteredActivities={filteredActivities}

  setSelectedActivity={setSelectedActivity}

  productMap={productMap}

  productLogs={productLogs}

  logSearch={logSearch}
  setLogSearch={setLogSearch}

  logFilter={logFilter}
  setLogFilter={setLogFilter}

/>

        </div>

      </div>
      <EditProductModal

        editingProduct={
          editingProduct
        }

        editProductData={
          editProductData
        }

        setEditProductData={
          setEditProductData
        }

        setEditingProduct={
          setEditingProduct
        }

        handleSaveProductEdit={
          handleSaveProductEdit
        }

      />
      <ProductHistoryModal

  selectedProductHistory={
    selectedProductHistory
  }

  setSelectedProductHistory={
    setSelectedProductHistory
  }

  productHistory={
    productHistory
  }

/>
      {selectedActivity && (
        <div
          onClick={() => setSelectedActivity(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "20px",
              width: "420px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              animation: "fadeIn 0.2s ease"
            }}
          >
            <h3 style={{
              marginBottom: "15px",
              fontSize: "18px",
              fontWeight: "700"
            }}>
              {selectedActivity.actionType === "transfer"
                ? "🔄 " + t("operations.transfer")
                : "⚖️ " + t("operations.adjust")}
            </h3>

            <p style={{ marginBottom: "8px" }}>
              <strong>{t("operations.product")}:</strong>{" "}
              {productMap[selectedActivity.productId] || selectedActivity.productId}
            </p>

            {selectedActivity.actionType === "transfer" && (
              <>
                <p style={{ marginBottom: "8px" }}>
                  {t("operations.fromBranch")}:
                  {getBranchName(selectedActivity.fromBranch)}
                </p>

                <p style={{ marginBottom: "8px" }}>
                  {t("operations.toBranch")}:
                  {getBranchName(selectedActivity.toBranch)}
                </p>
              </>
            )}

            {selectedActivity.actionType === "adjust" && (
              <>
                <p style={{ marginBottom: "8px" }}>
                  {t("branches.single")}: {getBranchName(selectedActivity.branchId)}
                </p>

                <p style={{ marginBottom: "8px" }}>
                  {(selectedActivity.adjustType === "increase"
                    ? t("operations.increase")
                    : t("operations.decrease"))}
                </p>

                {selectedActivity.reason && (
                  <p style={{ marginBottom: "8px" }}>
                    {t("operations.reason")}: {selectedActivity.reason}
                  </p>
                )}
              </>
            )}

            <p style={{ marginBottom: "8px" }}>
              <strong>{t("common.qty")}:</strong> {selectedActivity.qty}
            </p>

            <p style={{ marginBottom: "8px" }}>
              <strong>{t("users.title")}:</strong> {selectedActivity.user}
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button
                onClick={() => setSelectedActivity(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e5e7eb",
                  cursor: "pointer"
                }}
              >
                {t("common.close")}
              </button>

              <button
                onClick={handleUndo}
                disabled={selectedActivity.reversed}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: COLORS.danger,
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                ↩ Reverse
              </button>

            </div>
            
            <button
              onClick={() => {
                setEditData({ ...selectedActivity });
                setIsEditing(true);
              }}
              disabled={selectedActivity.reversed}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: "#f59e0b",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              ✏️ Edit
            </button>
            {isEditing && editData && (
              <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>

                <input
                  type="number"
                  value={editData.qty}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0) {
                      setEditData(prev => ({ ...prev, qty: val }));
                    }
                  }}
                  placeholder="Quantity"
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                />

                {editData.actionType === "adjust" && (
                  <select
                    value={editData.adjustType}
                    onChange={(e) =>
                      setEditData(prev => ({ ...prev, adjustType: e.target.value }))
                    }
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </select>
                )}

                <button
                  onClick={handleEditSave}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: COLORS.primary,
                    color: "#fff"
                  }}
                >
                  💾 Save
                </button>
              </div>

            )}
          </div>
        </div>

      )}
    </>
  );
}
