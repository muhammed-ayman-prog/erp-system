  import { db } from "../firebase";
  import { useEffect, useMemo, useState } from "react";
  import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    increment,
    getDoc,
    getDocs,
    updateDoc,
    serverTimestamp,
    where,
    writeBatch
  } from "firebase/firestore";
  import {
    useNavigate,
    useParams
  } from "react-router-dom";
  import { useApp } from "../store/useApp";
  import { theme } from "../theme";
  import { useTranslate } from "../useTranslate";
  import { createPortal } from "react-dom";
  import toast from "react-hot-toast";
  import { DollarSign, Banknote, CreditCard, Smartphone } from "lucide-react";
  import logAction from "../utils/logAction";
  const branchNameMap = {
  "City Stars": "cityStars",
  "City Stars 2": "cityStars2",
  "Abbas Akkad 1": "abbasAkkad1",
  "Abbas Akkad 2": "abbasAkkad2",
  "Abbas Akkad 3": "abbasAkkad3",
  "El Obour": "elObour",
  "El Rehab": "elRehab"
};
  export default function Invoices() {
    const { t, lang } = useTranslate();
    const [isMobile, setIsMobile] = useState(
  typeof window !== "undefined"
    ? window.innerWidth < 900
    : false
);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 900);
  };

  handleResize();

  window.addEventListener("resize", handleResize);

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );
}, []);
    const [showDetails, setShowDetails] = useState(true);
    const navigate = useNavigate();
    const { id } =
    useParams();
    const {
      selectedBranch,
      user
    } = useApp();
    const [branchName, setBranchName] = useState("");

    const [sales, setSales] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [action, setAction] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(search); 
    // Exchange state
    const [showRefundPopup, setShowRefundPopup] = useState(false);
    const [refundItems, setRefundItems] = useState([]);
    const hasValidRefund = useMemo(
    () => refundItems.some(i => i.qty > 0),
    [refundItems]
  );
    const getKey = (item) =>
    `${item.productId || item.id}_${
      (item.containerType || item.container || "")
        .toLowerCase()
        .trim()
    }_${item.size}`;
    const refundMap = useMemo(() =>
    Object.fromEntries(
      refundItems.map(i => [
        getKey(i),
        i.qty
      ])
    ),
  [refundItems]);
    const [loading, setLoading] = useState(false);
    const [previousReturns, setPreviousReturns] = useState([]);
    const [salesFilter, setSalesFilter] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const handleRowHover = (e, active) => {
    if (!active) {
      e.currentTarget.style.transform = "scale(1.01)";
      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
    }
  };

  const handleRowLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
  };
    useEffect(() => {

  if (!selectedBranch) return;

  const q = query(
    collection(db, "sales"),

    where(
      "branchId",
      "==",
      selectedBranch
    ),

    orderBy(
      "createdAt",
      "desc"
    )
  );

  const unsub = onSnapshot(
    q,
    (snap) => {

      const data = snap.docs.map(
        (d) => ({
          id: d.id,
          ...d.data(),
        })
      );

      setSales(data);

      setLoadingSales(false);
    }
  );

  return () => unsub();

}, [selectedBranch]);
    useEffect(() => {

    if (!id || !sales.length)
      return;

    const invoice =
      sales.find(
        s => s.id === id
      );

    if (invoice) {

      setSelectedInvoice(
        invoice
      );

    }

  }, [id, sales]);
    useEffect(() => {
    const fetchBranch = async () => {
      if (!selectedInvoice?.branchId) return;

      try {
        const ref = doc(db, "branches", selectedInvoice.branchId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setBranchName(snap.data().name);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchBranch();
  }, [selectedInvoice]);
  useEffect(() => {
    if (!selectedInvoice?.id) {
      setPreviousReturns([]);
      return;
    }

    const q = query(
  collection(db, "returns"),

  where(
    "invoiceId",
    "==",
    selectedInvoice.id
  ),

  where(
    "branchId",
    "==",
    selectedInvoice.branchId
  )
);

    const unsub = onSnapshot(q, (snap) => {
      setPreviousReturns(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, [selectedInvoice?.id]);
  useEffect(() => {
    if (showRefundPopup || showConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showRefundPopup, showConfirm]);
  useEffect(() => {
    setPage(1);
  }, [search, salesFilter, fromDate, toDate]);
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      @keyframes pulse {
        0% { opacity: 0.5 }
        50% { opacity: 1 }
        100% { opacity: 0.5 }
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {

  const close = () =>
    setDropdownOpen(false);

  window.addEventListener(
    "click",
    close
  );

  return () =>
    window.removeEventListener(
      "click",
      close
    );

}, []);
    // 🔍 Filter
    const searchKey = (debouncedSearch || "").toLowerCase();
    const salesKey = (salesFilter || "").toLowerCase();
    const filtered = useMemo(() => {
    return sales.filter(s => {
      const match =
        (s.customerName || "").toLowerCase().includes(searchKey) ||
        (s.customerPhone || "").includes(searchKey) ||
        s.invoiceNumber?.toString().includes(searchKey);

      const matchSales =
        !salesKey ||
        (s.salesName || "").toLowerCase().includes(salesKey);

      const date = s.createdAt?.seconds
        ? new Date(s.createdAt.seconds * 1000)
        : null;

      let ok = true;

      if (date) {
        if (fromDate && date < new Date(fromDate)) ok = false;
        if (toDate) {
  const end = new Date(toDate);
  end.setHours(23, 59, 59, 999);

  if (date > end) ok = false;
}
      }

      return match && matchSales && ok;
    });
  }, [sales, searchKey, salesKey, fromDate, toDate]);
    const [loadingSales, setLoadingSales] = useState(true);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

    // 💰 totals
    const totals = useMemo(() => {
      let total = 0,
        cash = 0,
        visa = 0,
        instapay = 0;

      filtered.forEach(i => {
        if (i.status === "cancelled") return;
        let net = i.total || 0;
        // 👇 لو الفاتورة متردة بالكامل
        const refundedAmount =
          i.refundedAmount || 0;

        net = (i.total || 0) - refundedAmount;

        if (net < 0) {
          net = 0;
        }

        // 👇 حماية
        if (net < 0) net = 0;

        total += net;
        const method =
        (i.paymentMethod || "cash")
        .toLowerCase();
        if (method === "cash") cash += net;
        if (method === "visa") visa += net;
        if (method === "instapay") instapay += net;
            });

      return { total, cash, visa, instapay };
    }, [filtered]);

    // 🧠 helpers
  

    // 🔴 CANCEL
    const handleCancel = async (inv) => {
    if (inv.status === "cancelled" || cancelling) return;
    const refundedQty =
      inv.refundedQty || 0;

    const refundedMl =
      inv.refundedMl || 0;

    const totalProducts =
      inv.items
        ?.filter(
          i =>
            (i.containerType || "")
              .toLowerCase() !== "oil"
        )
        .reduce(
          (sum, i) => sum + i.qty,
          0
        ) || 0;

    const totalMl =
      inv.items
        ?.filter(
          i =>
            (i.containerType || "")
              .toLowerCase() === "oil"
        )
        .reduce(
          (sum, i) =>
            sum + (i.oilQty * i.qty),
          0
        ) || 0;

    const fullyRefunded =
      isFullyRefunded(
        refundedQty,
        refundedMl,
        totalProducts,
        totalMl
      );

    if (fullyRefunded) {
      toast.error(t("invoices.refunded"));
      return;
    }

    setCancelling(true);

    try {
      const batch = writeBatch(db);

      const returnsSnap = await getDocs(
        query(
          collection(db, "returns"),
          where("invoiceId", "==", inv.id)
        )
      );

      const getKey = (i) =>
    `${i.productId || i.id}_${
      (i.container || i.containerType || "")
        .toLowerCase()
        .trim()
    }_${i.size}`;

  const refundedMap = {};

  returnsSnap.docs.forEach(d => {
    const data = d.data();
    const key = getKey(data);

    refundedMap[key] =
      (refundedMap[key] || 0) + (data.quantity || 0);
  });

      for (const item of inv.items) {
        const key = getKey(item);
  const alreadyRefunded = refundedMap[key] || 0;

  const isOil =
    (item.containerType || "").toLowerCase().trim() === "oil";

  const total = isOil
  ? (item.oilQty || 0) * (item.qty || 0)
  : (item.qty || 0);

  const remaining = Math.max(
  0,
  total - alreadyRefunded
);

  if (remaining <= 0) continue;
  
    
  if (isOil) {
    const invRef = doc(
  db,
  "inventory",
  `${inv.branchId}_${item.oilId || item.id}`
);

  batch.update(invRef, {
  quantity: increment(remaining)
});

  }
  else {

    const invRef = doc(
  db,
  "inventory",
  `${inv.branchId}_${item.containerId || item.id}`
);

    batch.update(invRef, {
      quantity: increment(remaining)
    });
const type =
  (item.containerType || "")
    .toLowerCase();

const isReadyProduct =
  type === "original" ||
  type === "ready" ||
  type === "cream" ||
  type === "مخمرية";

if (
  !isReadyProduct &&
  item.oilQty > 0
) {

  const oilRef = doc(
  db,
  "inventory",
  `${inv.branchId}_${item.oilId || item.id}`
);

batch.update(oilRef, {
  quantity: increment(
    (item.oilQty || 0) * remaining
)
});
}
  }
      }

      const saleRef = doc(db, "sales", inv.id);

      batch.update(saleRef, {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        hasRefund: true,
        refundedQty: totalProducts,
        refundedMl: totalMl,
        refundedAmount: inv.total || 0
      });
      // optimistic update
  setSales(prev =>
  prev.map(s =>
    s.id === inv.id
      ? {
          ...s,
          status: "cancelled",
          hasRefund: true,
          refundedQty: totalProducts,
          refundedMl: totalMl,
          refundedAmount: inv.total || 0
        }
      : s
  )
);


      await batch.commit();
      // 👤 Update customer stats
if (inv.customerId) {

  const customerRef = doc(
    db,
    "customers",
    inv.customerId
  );

  await updateDoc(customerRef, {

    totalSpent: increment(
      -(
  (inv.total || 0) -
  (inv.refundedAmount || 0)
)
    ),
  });
}
await logAction({
  action: "CANCEL_INVOICE",
  module: "Sales",
  severity: "warning",
  status: "success",

  performedBy: user?.uid || "",
  performedByName:
    user?.displayName ||
    user?.name ||
    user?.email ||
    "",

  userId: user?.uid || "",

  branchId: inv.branchId,
branchName: branchName || selectedBranch,

  targetId: inv.id,
  targetName: inv.invoiceNumber,

  details: {
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerName,
    customerPhone: inv.customerPhone,
    paymentMethod: inv.paymentMethod,
    refundedAmount: inv.total || 0,
  },

  changes: [
    {
      field: "status",
      before: "completed",
      after: "cancelled"
    }
  ]
});

      toast.success(t("invoices.cancelSuccess"));

    } catch (err) {
      console.error(err);
      toast.error(t("common.error"));
    } finally {
      setCancelling(false);
    }
  };
  // 🎬 Execute Action
    const confirmAction = async () => {
      if (!selectedInvoice) return;

      if (action === "cancel") await handleCancel(selectedInvoice);

      setShowConfirm(false);
      setAction("");
    };
    const handlePrint = () => {

  const content =
    document.getElementById(
      "invoice-print"
    );

  if (!content) return;

  const win = window.open(
    "",
    "",
    "width=800,height=600,noopener,noreferrer"
  );

  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Invoice</title>

        <style>
          body {
            font-family: Arial;
            padding: 20px;
          }

          button {
            display: none !important;
          }
        </style>
      </head>

      <body></body>
    </html>
  `);

  const clone =
    content.cloneNode(true);

  win.document.body.appendChild(clone);

  win.document.close();

  win.focus();

  win.print();
  win.onafterprint = () => win.close();
};


  const handleRefundQty = (item, qty) => {
    const q = Math.max(0, Number(qty) || 0);
    const key = getKey(item);

    setRefundItems(prev => {
      if (q === 0) {
        return prev.filter(p => getKey(p) !== key);
      }

      const exists = prev.find(p => getKey(p) === key);

      if (exists) {
        return prev.map(p =>
          getKey(p) === key ? { ...p, qty: q } : p
        );
      }

      return [...prev, { ...item, qty: q }];
    });
  };
  const isFullyRefunded = (
  refundedQty,
  refundedMl,
  totalProducts,
  totalMl
) => {

  const productsDone =
    totalProducts === 0 ||
    refundedQty >= totalProducts;

  const oilsDone =
    totalMl === 0 ||
    refundedMl >= totalMl;

  return productsDone && oilsDone;

};
  const handlePartialRefund = async () => {
    if (loading) return;
    if (!selectedInvoice || !selectedInvoice.items) return;

  const refunded =
  selectedInvoice.refundedQty || 0;

const refundedMl =
  selectedInvoice.refundedMl || 0;

const totalProducts =
  selectedInvoice.items
    ?.filter(
      i =>
        (i.containerType || "")
          .toLowerCase() !== "oil"
    )
    .reduce(
      (sum, i) => sum + i.qty,
      0
    ) || 0;

const totalMl =
  selectedInvoice.items
    ?.filter(
      i =>
        (i.containerType || "")
          .toLowerCase() === "oil"
    )
    .reduce(
      (sum, i) =>
        sum + (i.oilQty * i.qty),
      0
    ) || 0;

const fullyRefunded =
  isFullyRefunded(
    refunded,
    refundedMl,
    totalProducts,
    totalMl
  );
  if (fullyRefunded) {
    toast.error(t("invoices.closed"));
    return;
  }
    
    try {

    setLoading(true);

    const freshSaleSnap = await getDoc(
    doc(db, "sales", selectedInvoice.id)
  );

  if (!freshSaleSnap.exists()) {
    toast.error(t("common.notFound"));
    setLoading(false);
    return;
  }

  const freshInvoice = freshSaleSnap.data();
  const freshReturnsSnap = await getDocs(
  query(
    collection(db, "returns"),

    where(
      "invoiceId",
      "==",
      selectedInvoice.id
    ),

    where(
      "branchId",
      "==",
      selectedInvoice.branchId
    )
  )
);

  const freshReturns = freshReturnsSnap.docs.map(d => d.data());

  if (freshInvoice.status === "cancelled") {
    toast.error(t("invoices.cancelled"));
    setLoading(false);
    return;
  }
    const validItems = (refundItems || []).filter(i => i.qty > 0);

  if (validItems.length === 0) {
  toast.error(t("invoices.selectQty"));
    setLoading(false);
    return;
  }
    

  const batch = writeBatch(db); 
  for (const item of validItems) {
    const sourceItem = selectedInvoice.items.find(
    i => getKey(i) === getKey(item)
  );
    const alreadyRefunded = freshReturns
    .filter(r => getKey(r) === getKey(item))
    .reduce((sum, r) => sum + r.quantity, 0);

    const maxAllowed =
    ((sourceItem?.containerType || "").toLowerCase() === "oil"
      ? (sourceItem?.oilQty || 0) * (sourceItem?.qty || 0)
      : sourceItem?.qty || 0) - alreadyRefunded;

    const requestedQty = item.qty;
    

  if (requestedQty > maxAllowed) {
      toast.error(t("invoices.maxRefundExceeded"));
      setLoading(false);
      return;
    }
  }  

      for (const item of validItems) {

    const originalItem = selectedInvoice.items.find(
      i => getKey(i) === getKey(item)
    );
    // 🔥 لازم يتعرفوا هنا فوق
    const returnRef = doc(collection(db, "returns"));
    let returnedRefs = [];
    let returnedRef = null;
    
  const type =
  (item.containerType || "")
    .toLowerCase();

const isReadyProduct =
  type === "original" ||
  type === "ready" ||
  type === "cream" ||
  type === "مخمرية";
    const isOil =
    (item.containerType || "").toLowerCase().trim() === "oil";

  if (isOil || isReadyProduct) {
    const invRef = doc(
  db,
  "inventory",
  `${selectedInvoice.branchId}_${
  isOil
  ? item.oilId || item.id
  : item.productId || item.id
}`
);

 batch.update(invRef, {
  quantity: increment(item.qty)
});

  } else {

    // ✅ كل قطعة تبقى document مستقل
    for (let i = 0; i < item.qty; i++) {

      returnedRef = doc(collection(db, "returned_items"));
      returnedRefs.push(returnedRef.id);

      batch.set(returnedRef, {

        productId: item.productId || item.id,
        name: item.name,

        quantity: 1,

        branchId: selectedInvoice.branchId,

        price: item.price || 0,

        invoiceId: selectedInvoice.id,

        containerName:
          item.containerName ||
          item.sizeLabel ||
          `${item.containerType} ${item.size || ""}`.trim(),

        containerType: item.containerType || "",

        size: item.size || "",

        status: "available",

        returnId: returnRef.id,

        createdAt: serverTimestamp()
      });
    }
  }

    // 🔥 ده لازم يكون جوه اللوب وتحت الكل
    batch.set(returnRef, {
      invoiceId: selectedInvoice.id,
      productId: item.productId || item.id,
      productName: item.name,
      productType: item.type || "unknown",
      category: item.category || "",
      size: item.size || "",
      unit: (item.size || "").includes("ml") ? "ml" : "",
      quantity: item.qty,
      price: item.price,

      type: "refund",
      status: "returned",

      branchId: selectedInvoice.branchId,
      originalOilQty: item.oilQty || 0,
      originalQty: originalItem?.qty || 1, 
      container: item.containerType?.toUpperCase() || "",
      containerName:
    item.containerName ||
    item.sizeLabel ||
    [
      item.containerType,
      item.size
    ]
      .filter(Boolean)
      .join(" • "),

      returnedItemIds: returnedRefs, // 🔥 مهم

      returnId: returnRef.id,

      refundDate: serverTimestamp(),
      originalSaleDate: selectedInvoice.createdAt,
      createdAt: serverTimestamp()
    });
  }


  const refundedQtyNow = validItems.reduce((s, i) => {
  const isOil =
    (i.containerType || "").toLowerCase() === "oil";

  return isOil ? s : s + i.qty;
}, 0);

const refundedMlNow = validItems.reduce((s, i) => {

  const isOil =
    (i.containerType || "").toLowerCase() === "oil";

  return isOil
    ? s + ((i.oilQty || 0) * (i.qty || 0))
    : s;

}, 0);

  const saleRef = doc(db, "sales", selectedInvoice.id);

  const refundAmountNow = validItems.reduce(
  (sum, item) => {
    const originalItem =
     selectedInvoice.items.find(
      i => getKey(i) === getKey(item)
    );
    const isOil =
      (item.containerType || "")
        .toLowerCase() === "oil";

    if (isOil) {

  const originalMl =
    item.oilQty *
    (originalItem?.qty || 1);

  const pricePerMl =
    originalMl > 0
      ? (item.price || 0) / originalMl
      : 0;

  return sum + (
    pricePerMl * item.qty
  );
}

    return sum + (
      (item.price || 0) *
      (item.qty || 0)
    );

  },
  0
);

batch.update(saleRef, {
  hasRefund: true,

  refundedQty: increment(refundedQtyNow),

  refundedMl: increment(refundedMlNow),

  refundedAmount: increment(
    refundAmountNow
  ),

  lastRefundDate:
    serverTimestamp()
});

  setSales(prev =>
  prev.map(s =>
    s.id === selectedInvoice.id
      ? {
          ...s,

          refundedQty:
            (s.refundedQty || 0) + refundedQtyNow,

          refundedMl:
            (s.refundedMl || 0) + refundedMlNow,

          hasRefund: true
        }
      : s
  )
);
  // 🔥 مرة واحدة بس
  await batch.commit();
  // 👤 Update customer stats
if (
  selectedInvoice.customerId &&
  refundAmountNow > 0
) {

  const customerRef = doc(
    db,
    "customers",
    selectedInvoice.customerId
  );

  await updateDoc(customerRef, {

  totalSpent: increment(
    -refundAmountNow
  ),

  totalRefunded: increment(
    refundAmountNow
  )

});
}
await logAction({
  action: "PARTIAL_REFUND",
  module: "Sales",
  severity: "warning",
  status: "success",

  performedBy: user?.uid || "",
  performedByName:
    user?.displayName ||
    user?.name ||
    user?.email ||
    "",

  userId: user?.uid || "",

  branchId: selectedInvoice.branchId,
branchName: branchName || selectedBranch,

  targetId: selectedInvoice.id,
  targetName: selectedInvoice.invoiceNumber,

  details: {
    invoiceNumber:
      selectedInvoice.invoiceNumber,

    customerName:
      selectedInvoice.customerName,

    customerPhone:
      selectedInvoice.customerPhone,
    paymentMethod: selectedInvoice.paymentMethod,
    refundAmount:
      refundAmountNow,

    refundedItems:
      validItems.map(i => ({
        name: i.name,
        qty: i.qty
      }))
  }
});
  toast.success(t("invoices.refundSuccess"));

    // UI
    setShowRefundPopup(false);

setRefundItems([]);

setSelectedInvoice(prev => ({
  ...prev,

  refundedQty:
    (prev?.refundedQty || 0) + refundedQtyNow,

  refundedMl:
    (prev?.refundedMl || 0) + refundedMlNow,

  refundedAmount:
    (prev?.refundedAmount || 0) + refundAmountNow,

  hasRefund: true
}));

setPreviousReturns([]);

  } catch (err) {
    console.error(err);
    toast.error(t("common.error"));
  } finally {
    setLoading(false);
  }

      


  };
    const netTotal = Math.max(
  0,
    (selectedInvoice?.total || 0) -
    (selectedInvoice?.refundedAmount || 0)
  );
    const liveReturns = previousReturns || [];
    const formatDate = (value) => {

  if (!value?.seconds) return "-";

  return new Date(
    value.seconds * 1000
  ).toLocaleDateString();

};

const formatDateTime = (value) => {

  if (!value?.seconds) return "-";

  return new Date(
    value.seconds * 1000
  ).toLocaleString();

};
const modalBoxStyle = {
  ...modalBox,
  maxWidth: isMobile ? "92%" : "380px",
};
    return (
      <div style={{ padding: isMobile ? 12 : 20 }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      gap: "12px",
      flexWrap: "wrap"
    }}
  >
    {/* الشمال */}
    <div>
      <h1 style={{ margin: 0 }}>{t("invoices.title")}</h1>

      <span
        style={{
          color: theme.colors.textSecondary,
          fontSize: "13px"
        }}
      >
        {t("invoices.subtitle")}
      </span>
    </div>

    {/* اليمين */}
    <button
    type="button"
      onClick={() => navigate(-1)}
      style={{
        padding: "6px 12px",
        borderRadius: "8px",
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.card,
        cursor: "pointer",
        fontWeight: "500"
      }}
      onMouseEnter={e => handleRowHover(e, false)}
  onMouseLeave={handleRowLeave}
    >
      {t("common.back")}
    </button>
  </div>

        {/* 🔥 HEADER */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap"
          }}>
          <input
    placeholder={t("invoices.search")}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
        style={{
      flex: 1,
      padding: "10px 14px",
      borderRadius: "10px",
      border: `1px solid ${theme.colors.border}`,
      outline: "none",
      fontSize: "14px",
      transition: "0.2s",
      background: theme.colors.card,
      minWidth: isMobile ? "100%" : "220px"
    }}
  />
  <input
    placeholder={t("invoices.filter.sales")}
    value={salesFilter}
    onChange={(e) => setSalesFilter(e.target.value)}
        style={{
      flex: 1,
      padding: "10px 14px",
      borderRadius: "10px",
      border: `1px solid ${theme.colors.border}`,
      marginTop: "8px",
      fontSize: "14px",
      transition: "0.2s",
      background: theme.colors.card,
      minWidth: isMobile ? "100%" : "220px"
    }}
  />

          <input
              type="date"
              onChange={e => setFromDate(e.target.value)}
              style={{
              padding: "10px",
              borderRadius: "10px",
              border: `1px solid ${theme.colors.border}`,
              transition: "0.2s",
              background: theme.colors.card,
              minWidth: isMobile ? "100%" : "220px"
              }}
          />
            
          <input
              type="date"
              onChange={e => setToDate(e.target.value)}
              style={{
              padding: "10px",
              borderRadius: "10px",
              border: `1px solid ${theme.colors.border}`,
              transition: "0.2s",
              background: theme.colors.card,
              minWidth: isMobile ? "100%" : "220px"
              }}
          />
          </div>

        {/* 💰 CARDS */}
        <div style={{ display: "grid",
          gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10
          }}>
          <Card title={t("cart.total")} value={totals.total} type="total" />
          <Card title={t("common.cash")} value={totals.cash} type="cash" />
          <Card title={t("common.visa")} value={totals.visa} type="visa" />
          <Card title={t("common.instapay")} value={totals.instapay} type="instapay" />
        </div>

        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          alignItems: "flex-start",
          flexWrap: isMobile ? "wrap" : "nowrap"
        }}>
          {/* TABLE */}
          <div style={{
            flex: 3,
            maxHeight: "500px",
            overflowY: "auto",
            overflowX: "auto",
            minWidth: 0,
            scrollbarWidth: "thin",
            paddingRight: "4px",
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
              minWidth: isMobile ? "720px" : "100%",
              }}>
              <thead style={{
  textAlign: "center",
    fontSize: "13px",
    fontWeight: "600",
    color: theme.colors.textSecondary,
    background: theme.colors.cardSoft,
    position: isMobile ? "static" : "sticky",
    top: 0,
    zIndex: 2,
    
    
  }}>
              <tr>
    <th style={{ padding: "10px" }}>{t("invoices.invoice")}</th>
    <th style={{ padding: "10px" }}>{t("customer.title")}</th>
    <th style={{ padding: "10px" }}>{t("common.date")}</th>
    <th style={{ padding: "10px" }}>{t("payment.method")}</th>
    <th style={{ padding: "10px" }}>{t("cart.total")}</th>
    <th style={{ padding: "10px" }}>{t("common.status")}</th>
  </tr>
              </thead>
              <tbody>
                {loadingSales
      ? Array.from({ length: 5 }).map((_, i) => (
          <tr key={i}>
            <td colSpan="6" style={{ padding: "12px" }}>
              <div
                style={{
                  height: "20px",
                  borderRadius: "6px",
                  background: "#f1f5f9",
                  animation: "pulse 1.5s infinite"
                }}
              />
            </td>
          </tr>
        ))
        
      : paginated.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
        <div style={{ color: "#999" }}>
          📭 {t("common.noData")}
        </div>
      </td>
    </tr>
  ) : (
    paginated.map(s => {
    

  const refundedQty = s.refundedQty || 0;
const refundedMl = s.refundedMl || 0;

const totalProducts =
  s.items
    ?.filter(
      i =>
        (i.containerType || "")
          .toLowerCase() !== "oil"
    )
    .reduce(
      (sum, i) => sum + i.qty,
      0
    ) || 0;

const totalMl =
  s.items
    ?.filter(
      i =>
        (i.containerType || "")
          .toLowerCase() === "oil"
    )
    .reduce(
      (sum, i) =>
        sum + (i.oilQty * i.qty),
      0
    ) || 0;

const fullyRefunded =
  isFullyRefunded(
    refundedQty,
    refundedMl,
    totalProducts,
    totalMl
  );

const statusStyle =
  s.status === "cancelled"
    ? { bg: "#e5e7eb", color: "#374151" }
    : fullyRefunded
    ? { bg: "#fee2e2", color: "#dc2626" }
    : refundedQty > 0 || refundedMl > 0
    ? { bg: "#fef9c3", color: "#ca8a04" }
    : { bg: "#dcfce7", color: "#16a34a" };


  return ( 
            
    <tr
    key={s.id}
    onClick={() => {
    setSelectedInvoice(s);
    setDropdownOpen(false);
  }}
    style={{
      cursor: "pointer",
      background:
        selectedInvoice?.id === s.id
          ? theme.colors.secondary
          : theme.colors.card,
      border:
      selectedInvoice?.id === s.id
        ? `2px solid ${theme.colors.primary}`
        : "2px solid transparent",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      borderRadius: "12px",
      overflow: "hidden",
      opacity: s.status === "cancelled" ? 0.75 : 1,
    }}
    onMouseEnter={e => handleRowHover(e, false)}
  onMouseLeave={handleRowLeave}
  >
      {/* Invoice */}
      <td style={{
  padding: "14px 12px",
  fontWeight: "600",
  textAlign: "center"
}}>
  {s.invoiceNumber}
</td>

<td style={{
  padding: "14px 12px",
  fontSize: "14px",
  textAlign: "center"
}}>
  {s.customerName || "-"}
</td>

<td style={{
  padding: "14px 12px",
  fontSize: "14px",
  textAlign: "center"
}}>
  {formatDate(s.createdAt)}
</td>

<td style={{
  padding: "14px 12px",
  fontSize: "14px",
  textAlign: "center"
}}>
        <span style={{
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#f1f5f9",
    fontSize: "12px",
    fontWeight: "500"
  }}>
    {t(`common.${(s.paymentMethod || "").toLowerCase()}`)}
  </span>
      </td>

      {/* Total */}
      <td style={{
        padding: "12px",
        fontWeight: "600",
        textAlign: "center"
      }}>
        {s.total?.toLocaleString()} EGP
      </td>
          
      {/* Status */}
      <td style={{
        padding: "14px 12px",
        fontSize: "14px",
        textAlign: "center"
      }}>
        <span
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
            padding: "5px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "600"
          }}
        >
          {
    s.status === "cancelled"
      ? t("invoices.cancelled")
      : fullyRefunded
      ? t("invoices.refunded")
      : refundedQty > 0 || refundedMl > 0
      ? t("invoices.partialRefunded")
      : t("invoices.completed")
  }
        </span>
      </td>
      
      
    </tr>
  );
  }))
  }

  
              </tbody>
            </table>

            <div style={{
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}>
    <button
    type="button"
      disabled={page === 1}
      onClick={() => setPage(p => p - 1)}
      style={{
        padding: "6px 12px",
        borderRadius: "8px",
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.card,
        cursor: "pointer"
      }}
    >
      {t("common.prev")}
    </button>

    <span style={{ fontSize: "13px" }}>
      {t("common.page")} {page} of {totalPages}
    </span>

    <button
    type="button"
      disabled={page === totalPages}
      onClick={() => setPage(p => p + 1)}
      style={{
        padding: "6px 12px",
        borderRadius: "8px",
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.card,
        cursor: "pointer"
      }}
    >
      {t("common.next")}
    </button>
  </div>
          </div>

          {/* SIDE PANEL */}
          <div style={{
    flex: 2,
    minWidth: 0,
    width: isMobile ? "100%" : "auto",
    position: isMobile ? "static" : "sticky",
    top: "20px",
    height: "fit-content",
    background: theme.colors.card,
    padding: isMobile ? "14px" : "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",

    transform: selectedInvoice ? "translateX(0)" : "translateX(20px)",
    opacity: selectedInvoice ? 1 : 0.6,
    transition: "0.3s"
  }}>
          {!selectedInvoice && <p>{t("invoices.select")}</p>}
          
          {selectedInvoice && (

<>
{isMobile && (
  <button
    type="button"
    onClick={() => setShowDetails(prev => !prev)}
    style={{
      width: "100%",
      marginBottom: "10px",
      padding: "10px",
      borderRadius: "10px",
      border: "none",
      background: theme.colors.primary,
      color: "#fff",
      fontWeight: "600"
    }}
  >
    {showDetails
      ? t("common.hide")
      : t("common.show")}
  </button>
)}
{(!isMobile || showDetails) && (
            

              <div
                id="invoice-print"
                style={{ position: "relative" }}
              >
              <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  }}>
    <div>
      <h3 style={{ margin: 0 }}>
        {selectedInvoice.invoiceNumber}
      </h3>

      <div style={{
        fontSize: "12px",
        color: theme.colors.textSecondary,
        marginTop: "4px"
      }}>
        {formatDateTime(selectedInvoice.createdAt)}
      </div>
    </div>

    {/* Actions */}
    <button
    type="button"
      onClick={(e) => {
        e.stopPropagation();
        setDropdownOpen(prev => !prev);
      }}
      style={{
        padding: isMobile ? "10px 14px" : "6px 12px",
        borderRadius: "8px",
        border: "none",
        background: theme.colors.primary,
        color: "#fff",
        cursor: "pointer",
        fontSize: "12px",
        transition: "0.2s",
      }}
    >
      {t("common.actions")} ⋮
    </button>
  </div>

    {/* Dropdown */}
    {dropdownOpen && (
      <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "40px",
        right: "10px",
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: "12px",
        padding: "6px 0",
        boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
        overflow: "hidden",
        zIndex: 1000,
        minWidth: "150px"
      }}
  >
    
      
          {[
  ...(selectedInvoice?.status !== "cancelled"
    ? [{
        key: "refund",
        label: t("invoices.refund"),
        color: theme.colors.warning
      }]
    : []),

  ...(selectedInvoice?.status !== "cancelled"
    ? [{
        key: "cancel",
        label: t("common.cancel"),
        color: theme.colors.danger
      }]
    : []),

  {
    key: "print",
    label: t("invoices.print"),
    color: theme.colors.primary
  }
].map(a => (
    <div
    key={a.key}
    onMouseEnter={e => {
      e.currentTarget.style.background = "#f8fafc";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "transparent";
    }}
      onClick={() => {

  if (
    a.key !== "print" &&
    (
      selectedInvoice.status === "cancelled" ||
      cancelling
    )
  ) {
    return;
  }

  if (a.key === "refund") {

    setRefundItems([]);
    setShowRefundPopup(true);

  }

  else if (a.key === "cancel") {

    setAction("cancel");
    setShowConfirm(true);

  }

  else if (a.key === "print") {

    handlePrint();

  }

  setDropdownOpen(false);
}}
      style={{
        padding: "10px 14px",
        cursor: "pointer",
        color: a.color,
        fontWeight: "500"
      }}
    >
      {a.label}
    </div>
  ))}
        </div>
      )}
    


              
              <div style={{
    marginTop: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: theme.colors.cardSoft
  }}>

    {/* Customer */}
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontWeight: "600" }}>
        {selectedInvoice.customerName || "-"}
      </div>
      <div style={{
        fontSize: "12px",
        color: theme.colors.textSecondary
      }}>
        {selectedInvoice.customerPhone || ""}
      </div>
    </div>

    

  </div>

    {/* 🔵 Sales Info */}
    <div style={{
      display: "flex",
      gap: "10px",
      marginBottom: "6px",
      flexWrap: "wrap"
    }}>
      <span style={{
        padding: "4px 10px",
        borderRadius: "999px",
        background: "#eef2ff",
        fontSize: "12px",
        fontWeight: "600"
      }}>
        👨‍💼 {t("invoices.salesName")}: {

  selectedInvoice.items?.find(
    i => i.seller
  )?.seller

  ||

  selectedInvoice.salesName

  ||

  (
    lang === "ar"
      ? "غير معروف"
      : "Unknown"
  )
}
      </span>

      {selectedInvoice.enteredBy !== selectedInvoice.salesName && (
    <span style={{
      padding: "4px 10px",
      borderRadius: "999px",
      background: "#ecfeff",
      fontSize: "12px"
    }}>
      🖥️ {t("invoices.enteredBy")}: {

  selectedInvoice.enteredBy &&
  selectedInvoice.enteredBy !== "Unknown User"

    ? selectedInvoice.enteredBy

    : (
        selectedInvoice.items?.find(
          i => i.seller
        )?.seller

        ||

        selectedInvoice.salesName

        ||

        (
          lang === "ar"
            ? "غير معروف"
            : "Unknown"
        )
      )
}
    </span>
  )}


    </div>

    {/* 🏪 Branch */}
    <div>
      {t("branches.title")}: {

  branchNameMap[branchName]

    ? t(
        `branchNames.${branchNameMap[branchName]}`
      )

    : branchName
}
    </div>

    {/* 💳 Payment */}
    <div>
      {t("payment.method")}: {
  t(`common.${(selectedInvoice.paymentMethod || "cash").toLowerCase()}`)
}
    
    </div>
    
    


              
              


  {(() => {

  const refunded =
    selectedInvoice.refundedQty || 0;

  const refundedMl =
    selectedInvoice.refundedMl || 0;

  const totalProducts =
    selectedInvoice.items
      ?.filter(
        i =>
          (i.containerType || "")
            .toLowerCase() !== "oil"
      )
      .reduce(
        (sum, i) => sum + i.qty,
        0
      ) || 0;

  const totalMl =
    selectedInvoice.items
      ?.filter(
        i =>
          (i.containerType || "")
            .toLowerCase() === "oil"
      )
      .reduce(
        (sum, i) =>
          sum + (i.oilQty * i.qty),
        0
      ) || 0;

  const fullyRefunded =
  isFullyRefunded(
    refunded,
    refundedMl,
    totalProducts,
    totalMl
  );

  return (
      <div style={{
        marginTop: "10px",
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        display: "inline-block",
        background:
          fullyRefunded
            ? "#fee2e2"
            : refunded > 0 || refundedMl > 0
            ? "#fef9c3"
            : "#dcfce7",
        color:
          fullyRefunded
            ? "#dc2626"
            : refunded > 0 || refundedMl > 0
            ? "#ca8a04"
            : "#16a34a"
      }}>
        {
          fullyRefunded
            ? t("invoices.refunded")
            : refunded > 0 || refundedMl > 0
            ? t("invoices.partialRefunded")
            : t("invoices.completed")
        }
      </div>
        );
      })()}
              <div style={{
                fontSize: "28px",
                fontWeight: "800",
                color: theme.colors.success,
                marginTop: "15px",
                background: "#ecfdf5",
                padding: "10px",
                borderRadius: "10px",
                textAlign: "center"
              }}>
                {netTotal.toLocaleString()} EGP
              </div>

              {/* 🧾 Items Table */}
          <div style={{
          marginTop: "15px",
          borderTop: `1px solid ${theme.colors.border}`,
          paddingTop: "10px",
          background: theme.colors.cardSoft,
          borderRadius: "10px",
          padding: "12px"
          }}>

          {/* 🔹 Header */}
          <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: theme.colors.textSecondary,
              marginBottom: "8px"
          }}>
            
              <span style={{ flex: 2 }}>{t("products.title")}</span>
              <span style={{ flex: 1, textAlign: "center" }}>{t("common.qty")}</span>
              <span style={{ flex: 1, textAlign: "right" }}>{t("common.price")}</span>
          </div>
          

          {/* 🔹 Items */}
          {selectedInvoice.items.map((item, i) => (
              <div key={`${getKey(item)}_${i}`} style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
  padding: "6px 0",
  borderBottom: "1px dashed #eee",
              fontSize: "14px"
              }}>
              <div style={{ flex: 2 }}>
    {item.name}

    <div style={{
      fontSize: "12px",
      color: theme.colors.textSecondary,
      marginTop: "2px"
    }}>
      {(item.containerType || "").toLowerCase() === "oil"
  ? (
      lang === "ar"
        ? "زيت خام"
        : "Pure Oil"
    )
  : (
      item.containerName ||
      item.sizeLabel ||
      [
        item.containerType,
        item.size
      ]
        .filter(Boolean)
        .join(" • ")
    )
}
    </div>

    {/* 🛢 الزيت */}
    {item.oilQty > 0 && (
      <div style={{
        fontSize: "12px",
        color: theme.colors.textSecondary,
        marginTop: "2px"
      }}>
        {t("products.oil")}: {item.oilQty} {t("common.ml")}
      </div>
    )}
  </div>

              <span style={{ flex: 1, textAlign: "center" }}>
                  {(item.containerType || "").toLowerCase() === "oil"
                    ? (
                        lang === "ar"
                          ? `${item.oilQty * item.qty} مل`
                          : `${item.oilQty * item.qty} ml`
                      )
                    : item.qty}
              </span>

              <span style={{ flex: 1, textAlign: "right" }}>
                  {(item.containerType || "").toLowerCase() === "oil"
                    ? `${item.price} EGP`
                    : `${(item.price || 0) * item.qty} EGP`}
              </span>
              </div>
          ))}
          {previousReturns.length > 0 && (
    <div style={{
      marginTop: "15px",
      padding: "10px",
      background: "#fef9c3",
      border: "1px solid #fde68a",
      borderRadius: "10px"
    }}>
      <div style={{
    fontWeight: "700",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#92400e"
  }}>
    🔁 {t("invoices.returnedItems")}
  </div>

      {previousReturns.map((r, i) => (
    <div
    key={i}
    style={{
      fontSize: "13px",
      lineHeight: "1.8"
    }}
  >
    {r.productName}

  {r.containerName && (
    <>
      {" • "}
      {r.containerName}
    </>
  )}

  {" • "}

  {r.unit === "ml"
    ? `${r.quantity} ml`
    : r.quantity}

  {" • "}

    {(() => {
    const isPureOil =
    (r.container || r.containerType || "")
      .toLowerCase() === "oil";

    if (isPureOil) {
      const totalMl =
        (r.originalOilQty || parseInt(r.size) || 1) *
        (r.originalQty || 1);

      const pricePerMl =
        totalMl > 0 ? (r.price || 0) / totalMl : 0;

      const totalPrice = pricePerMl * r.quantity;

      return `${totalPrice} EGP`;
    }

    return `${(r.price || 0) * (r.quantity || 0)} EGP`;
  })()}
  </div>
  ))}
    </div>
  )}

          </div>
          {/* 💰 Totals */}
  <div style={{
    marginTop: "15px",
    borderTop: `1px solid ${theme.colors.border}`,
    paddingTop: "10px"
  }}>

    <div style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px"
    }}>
      <span>{t("cart.subtotal")}</span>
      <span>{netTotal.toLocaleString()} EGP</span>
    </div>

    <div style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px"
    }}>
      <span>{t("cart.discount")}</span>
      <span>{selectedInvoice.discount || 0} EGP</span>
    </div>

    <div style={{
      display: "flex",
      justifyContent: "space-between",
      fontWeight: "bold",
      marginTop: "6px",
      fontSize: "15px"
    }}>
      <span>{t("cart.total")}</span>
      <span>{netTotal.toLocaleString()} EGP</span>
    </div>

  </div>

              {/* Print */}
              <button
              type="button"
              onClick={handlePrint}
              style={{
                  marginTop: "5px",
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  background: theme.colors.primary,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                  boxShadow: "0 10px 20px rgba(37,99,235,0.3)",
                  transition: "0.2s"
              }}
              onMouseEnter={e => handleRowHover(e, false)}
  onMouseLeave={handleRowLeave}
              >
              🖨 {t("invoices.print")}
              </button>
              </div>
          )}
        </>
)}
          
          </div>
        </div>
        {showRefundPopup && (
          createPortal(
        <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000
        }}>
        <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: isMobile ? "95%" : "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        paddingRight: "6px",
        scrollbarWidth: "thin",

        }}>

        <h3>{t("invoices.refundItems")}</h3>

        {selectedInvoice?.items.map((item, i) => {
    

  const alreadyRefunded = liveReturns
    .filter(r => getKey(r) === getKey(item))
    .reduce((sum, r) => sum + r.quantity, 0);

    const isOil =
    (item.containerType || "").toLowerCase().trim() === "oil";

  const remaining = Math.max(
  0,
  isOil
    ? ((item.oilQty || 0) * (item.qty || 0)) - alreadyRefunded
    : item.qty - alreadyRefunded
);

    return (
      <div key={`${getKey(item)}_${i}`} style={{ marginBottom: "10px" }}>
        <div>
          <>
    {item.name}

    <div style={{
      fontSize: "12px",
      opacity: 0.7,
      marginTop: "2px"
    }}>
      {(item.containerType || "").toLowerCase() === "oil"
  ? (
      lang === "ar"
        ? "زيت خام"
        : "Pure Oil"
    )
  : (
      item.containerName ||
      item.sizeLabel ||
      [
        item.containerType,
        item.size
      ]
        .filter(Boolean)
        .join(" • ")
    )
}
    </div>
  </>

          <span style={{ fontSize: "12px", marginLeft: "6px" }}>
            {isOil
              ? `${remaining} / ${remaining + alreadyRefunded} ml ${t("common.available")}`
              : `${remaining} / ${remaining + alreadyRefunded} ${t("common.available")}`
            }
          </span>

          {remaining === 0 && (
            <span style={{ color: "red", marginLeft: "6px" }}>
              {t("invoices.refunded")}
            </span>
          )}
        </div>

        <input
          type="number"
          inputMode="numeric"
          style={{
    width: "100%",
    padding: "8px 10px",
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
    marginTop: "4px",
    outline: "none",
    fontSize: "14px",
    transition: "0.2s",
  }}
          min="0"
          max={remaining}
          onFocus={(e) => {
    e.target.style.borderColor = theme.colors.primary;
    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.secondary}`;
  }}

  onBlur={(e) => {
    e.target.style.borderColor = theme.colors.border;
    e.target.style.boxShadow = "none";

    let value = Number(e.target.value) || 0;

    const maxQty = remaining;

    if (value > maxQty) {
      handleRefundQty(item, maxQty);
    toast.error(
  `${t("common.max")}: ${maxQty}`
);
    value = maxQty;
  }
    
  }}
          disabled={remaining === 0}
          placeholder={
            isOil
              ? t("common.ml")
              : t("common.qty")
          }
          value={refundMap[getKey(item)] || ""}
          onChange={(e) => {

          const value = Math.min(
            remaining,
            Number(e.target.value) || 0
          );

          handleRefundQty(item, value);

        }}
        />
        <div style={{
    fontSize: "11px",
    color: "#888",
    marginTop: "4px"
  }}>
    {isOil
      ? `${t("common.max")}: ${remaining} ml`
      : `${t("common.max")}: ${remaining}`
    }
  </div>
      </div>
    );
  })}

          <button
          type="button"
            onClick={handlePartialRefund}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}

            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          disabled={loading || !hasValidRefund}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: theme.colors.primary,
              color: "#fff",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              marginTop: "12px"
            }}
          >
          {loading
? `⏳ ${t("common.loading")}`
: t("invoices.confirmRefund")}
        </button>

        <button
        type="button"
    onClick={() => {
      setShowRefundPopup(false);
      setRefundItems([]);
    }}

    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-1px)";
    }}

    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
    }}

    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "10px",
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.card,
      marginTop: "8px",
      cursor: "pointer",
      transition: "0.2s"
    }}
  >
    {t("common.cancel")}
  </button>

      </div>
    </div>,
    document.body
    )
  )}
        {/* 🔴 CONFIRM MODAL */}
        {showConfirm && (
          createPortal(
          <div style={modalStyle}>
            <div style={modalBoxStyle}>
              <div style={{ marginBottom: "15px" }}>
    <h3 style={{ margin: 0 }}>{t("common.confirmAction")}</h3>

    <p style={{
      fontSize: "13px",
      color: theme.colors.textSecondary,
      marginTop: "6px"
    }}>
      {t("invoices.cancelWarning")}
    </p>
  </div>
              <button
              type="button"
    onClick={() => setShowConfirm(false)}
    style={{
      padding: "8px 12px",
      borderRadius: "8px",
      border: `1px solid ${theme.colors.border}`,
      marginRight: "8px"
    }}
  >
    {t("common.cancel")}
  </button>

  <button
  type="button"
    onClick={confirmAction}
    style={{
      padding: "8px 12px",
      borderRadius: "8px",
      background: theme.colors.danger,
      color: "#fff",
      border: "none"
    }}
  >
    {t("common.confirm")}
  </button>
            </div>
          </div>,
        document.body
          )
        )}
      </div>
    );
  }

  const Card = ({ title, value, type }) => {
    const styles = {
      total: {
        bg: "#16a34a",       // أخضر غامق
        color: "#ffffff",    // أبيض
        border: "#16a34a"
      },
      cash: {
        bg: "#ecfdf5",       // أخضر فاتح
        color: "#16a34a",
        border: "#bbf7d0"
      },
      visa: {
        bg: "#fef3c7",
        color: "#b45309"
      },
      instapay: {
        bg: "#f3e8ff",
        color: "#7c3aed"
      }
    };

    const s = styles[type] || {};
    const icons = {
    total: <DollarSign size={20} color="#fff" strokeWidth={2.5} />,
    cash: <Banknote size={18} />,
    visa: <CreditCard size={18} />,
    instapay: <Smartphone size={18} />
  };

    return (
    <div
      style={{
        background: s.bg || theme.colors.card,
        border: `1px solid ${s.border || theme.colors.border}`,
        padding: 15,
        borderRadius: 12,
        flex: 1,
        cursor: "pointer",
        transition: "0.2s",
        boxShadow:
          type === "total"
            ? "0 10px 30px rgba(22,163,74,0.3)"
            : "0 8px 20px rgba(0,0,0,0.05)"
      }}
      onMouseEnter={e => {
    e.currentTarget.style.transform = "scale(1.02)";
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = "scale(1)";
  }}
    >
          {/* 🔥 Top Row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap"
          }}>
            <span style={{
              fontSize: "12px",
              color: type === "total" ? "#d1fae5" : theme.colors.textSecondary
            }}>
              {title}
            </span>

            <div style={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                type === "total"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.05)"
            }}>
              {icons[type]}
            </div>
          </div>

          {/* 💰 Value */}
          <div style={{
            fontSize: type === "total" ? "26px" : "20px",
            fontWeight: "700",
            marginTop: "8px",
            color: s.color || theme.colors.text
          }}>
            {Number(value || 0).toLocaleString()} EGP
          </div>
        </div>
    );
  };

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000   // 👈 مهم
  };

  const modalBox = {
    background: theme.colors.card,
    padding: 20,
    borderRadius: 12,

    width: "100%",
    maxWidth: "380px", 

    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    position: "relative"
  };