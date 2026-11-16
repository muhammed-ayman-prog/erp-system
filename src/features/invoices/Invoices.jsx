  import { db } from "../../firebase";
  import useInvoices from "./hooks/useInvoices";
  import { useEffect, useState, useMemo } from "react";
  import printInvoice from "./utils/printInvoice";
  import AppPageHeader from "../../components/ui/AppPageHeader";
import AppFilterBar from "../../components/ui/AppFilterBar";
import AppCard from "../../components/ui/AppCard";
  import {
  doc,
  increment,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  writeBatch,
  runTransaction,
  query,
  where,
  collection,
  onSnapshot,
} from "firebase/firestore";
  import {
    useNavigate,
    useParams
  } from "react-router-dom";
  import { useApp } from "../../store/useApp";
  import { theme } from "../../theme";
  import { useTranslate } from "../../useTranslate";
  import toast from "react-hot-toast";
  import InvoiceCards from "./components/InvoiceCards";
  import InvoiceFilters from "./components/InvoiceFilters";
  import InvoiceTable from "./components/InvoiceTable";
  import RefundModal from "./components/RefundModal";
  import CancelModal from "./components/CancelModal";
  import InvoiceDetails from "./components/InvoiceDetails";
  import handleCancel from "./services/cancelInvoice";
  import useInvoiceFilters from "./hooks/useInvoiceFilters";
  import useFinancialTotals from "./hooks/useFinancialTotals";
  import useInvoiceReturns from "./hooks/useInvoiceReturns";
  import useRefund from "./hooks/useRefund";
  import usePagination from "./hooks/usePagination";
  import useSearch from "./hooks/useSearch";
  import logAction from "../../utils/logAction";
  import { useAuth } from "../../store/useAuth";
  import { getTodayRange } from "../../utils/dateFilter.js";
  import useResponsive from "./hooks/useResponsive";
  import { ArrowRight } from "lucide-react";
  import AppButton from "../../components/ui/AppButton";
import {
  getKey,
  isFullyRefunded,
  formatDate,
  formatDateTime
} from "./utils/invoiceHelpers";
import useDropdown from "./hooks/useDropdown";
import useReturns from "./hooks/useReturns";
import useReturnFilters from "./hooks/useReturnFilters";
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
    const { user } = useAuth();
   
    const {
      selectedBranch
    } = useApp();
    const showBranchFilter =
  user?.role === "owner" &&
  selectedBranch === "all";

    const { t, lang } = useTranslate();
    const isMobile = useResponsive();
    const [showDetails, setShowDetails] = useState(true);
    const navigate = useNavigate();
    const { id } =
    useParams();
    
    const [branchName, setBranchName] = useState("");
    const [branches, setBranches] = useState([]);
   const {
    invoices:sales,
    loading:loadingSales,
    setInvoices
    }=useInvoices({

branchId:selectedBranch,

allBranches:
user?.role==="owner" &&
selectedBranch==="all"

});

const {
  returns,
  loadingReturns,
} = useReturns({
  branchId: selectedBranch,

  allBranches:
    user?.role === "owner" &&
    selectedBranch === "all",
});

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const todayRange = getTodayRange();
    const [fromDate,setFromDate] =
     useState(todayRange.fromDate);
    const [toDate,setToDate] =
      useState(todayRange.toDate);
    const [action, setAction] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    // Exchange state
    const [showRefundPopup, setShowRefundPopup] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState("all");

    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");

    const [paymentFilter, setPaymentFilter] = useState("all");
    const [branchFilter, setBranchFilter] = useState("all");
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
    if (showRefundPopup || showConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showRefundPopup, showConfirm]);

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
  const unsubscribe = onSnapshot(
    collection(db, "branches"),
    (snap) => {
      const data = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (b) => b.isArchived !== true
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      setBranches(data);
    }
  );

  return () => unsubscribe();
}, []);

const {
  dropdownOpen,
  setDropdownOpen,
} = useDropdown();

      const {
  search,
  setSearch,
  searchKey,
} = useSearch();
  const {
  sellers,
  filteredInvoices,
} = useInvoiceFilters({
  sales,
  searchKey,
  selectedSeller,
  paymentFilter,
  invoiceStatusFilter,
  fromDate,
  toDate,

  branchFilter,
  showBranchFilter,
});
const filteredReturns = useReturnFilters({
  returns,

  searchKey,

  paymentFilter,

  selectedSeller,

  fromDate,
  toDate,

  branchFilter,
  showBranchFilter,
});
const combinedRows = useMemo(() => {
  // تجهيز فواتير البيع
  const saleRows = filteredInvoices.map((sale) => ({
    ...sale,
    rowType: "sale",
    rowId: `sale-${sale.id}`,
  }));

  // تجميع مستندات المرتجعات حسب returnId
  const returnGroups = new Map();

  filteredReturns.forEach((item) => {
    const groupId = item.returnId || item.id;

    if (!returnGroups.has(groupId)) {
      returnGroups.set(groupId, {
        ...item,
        id: groupId,
        rowId: `return-${groupId}`,
        rowType: "return",
        totalRefund: 0,
        totalQuantity: 0,
        products: [],
      });
    }

    const group = returnGroups.get(groupId);

    group.totalRefund += Number(item.price || 0);
    group.totalQuantity += Number(item.quantity || 0);

    if (
      item.productName &&
      !group.products.includes(item.productName)
    ) {
      group.products.push(item.productName);
    }
  });

  const returnRows = Array.from(returnGroups.values()).map(
    (item) => {
      const originalInvoice = sales.find(
        (sale) => sale.id === item.invoiceDocId
      );

      return {
        ...item,
        invoiceNumber:
          item.invoiceId ||
          originalInvoice?.invoiceNumber ||
          "-",
        customerName: originalInvoice?.customerName || "-",
        branchName:
          item.branchName || originalInvoice?.branchName || "-",
        paymentMethod: item.refundPaymentMethod || "cash",
        refundDate: item.refundDate,
        originalInvoice,
      };
    }
  );

  const getTimestamp = (value) => {
    if (!value) return 0;

    if (typeof value.toMillis === "function") {
      return value.toMillis();
    }

    if (value.seconds) {
      return value.seconds * 1000;
    }

    const date = new Date(value).getTime();
    return Number.isNaN(date) ? 0 : date;
  };

  return [...saleRows, ...returnRows].sort((a, b) => {
    const dateA = getTimestamp(
      a.rowType === "return"
        ? a.refundDate
        : a.saleDate || a.createdAt
    );

    const dateB = getTimestamp(
      b.rowType === "return"
        ? b.refundDate
        : b.saleDate || b.createdAt
    );

    return dateB - dateA;
  });
}, [filteredInvoices, filteredReturns, sales]);
 const {
      page,
      setPage,
      paginated,
      totalPages,
    } = usePagination(combinedRows);

    
    const [cancelReason, setCancelReason] = useState("");
    const [cancelReasonType, setCancelReasonType] = useState("");

    // 💰 totals
  const totals = useFinancialTotals({
  sales: filteredInvoices,
  returns: filteredReturns,
});

  

   
  // 🎬 Execute Action
    const confirmAction = async () => {
      if (!selectedInvoice) return;

      if (action === "cancel") {
  await handleCancel({
    inv: selectedInvoice,
    reason: cancelReason.trim(),

    db,
    user,
    t,
    toast,

    runTransaction,
    query,
    collection,
    where,
    getDocs,
    doc,
    increment,
    serverTimestamp,

    setInvoices,
    branchName,
    selectedBranch,

    logAction,
    setCancelling,
  });
}

      setShowConfirm(false);
      setAction("");
      setCancelReason("");
      setCancelReasonType("");
    };
 const {
  previousReturns,
  setPreviousReturns,
  groupedReturns,
  liveReturns,
} = useInvoiceReturns(selectedInvoice);
const {
  loading,

  refundItems,
  setRefundItems,

  refundMap,
  hasValidRefund,

  handleRefundQty,

  refundPaymentMethod,
  setRefundPaymentMethod,

  executeRefund,
} = useRefund({
  selectedInvoice,

  db,
  user,
  toast,
  t,

  writeBatch,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  increment,
  updateDoc,
  serverTimestamp,

  setInvoices,
  setSelectedInvoice,
  setShowRefundPopup,
  setPreviousReturns,

  branchName,
  selectedBranch,

  getKey,
  isFullyRefunded,

  logAction,
});
   const handlePrint = printInvoice;
   const netTotal = Math.max(
  0,
    (selectedInvoice?.total || 0) -
    (selectedInvoice?.refundedAmount || 0)
  );
 
const handleSelectInvoiceRow = async (row) => {
  setDropdownOpen(false);

  // فاتورة بيع عادية
  if (row.rowType !== "return") {
    setSelectedInvoice(row);
    return;
  }

  // البحث عن الفاتورة الأصلية
  const originalInvoice =
    row.originalInvoice ||
    sales.find((sale) => sale.id === row.invoiceDocId);

  if (originalInvoice) {
    setSelectedInvoice(originalInvoice);
    return;
  }

  // جلب الفاتورة من Firestore عند عدم وجودها محليًا
  if (!row.invoiceDocId) {
    toast.error(
      lang === "ar"
        ? "رقم الفاتورة الأصلية غير متاح"
        : "Original invoice reference is missing"
    );
    return;
  }

  try {
    const invoiceSnap = await getDoc(
      doc(db, "sales", row.invoiceDocId)
    );

    if (!invoiceSnap.exists()) {
      toast.error(
        lang === "ar"
          ? "الفاتورة الأصلية غير موجودة"
          : "Original invoice not found"
      );
      return;
    }

    setSelectedInvoice({
      id: invoiceSnap.id,
      ...invoiceSnap.data(),
    });
  } catch (error) {
    console.error("Error loading original invoice:", error);

    toast.error(
      lang === "ar"
        ? "حدث خطأ أثناء تحميل الفاتورة"
        : "Failed to load original invoice"
    );
  }
};
    return (
      <div style={{ padding: isMobile ? 12 : 20 }}>
        
        {/* Invoices Page Header */}
<div
  style={{
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    direction: "ltr",
    width: "100%",
  }}
>
  {/* Back Button - Far Left */}
  <div
    className="no-print"
    style={{
      flexShrink: 0,
    }}
  >
    <AppButton
      variant="secondary"
      leftIcon={<ArrowRight size={16} />}
      onClick={() => navigate("/sales")}
    >
      رجوع للمبيعات
    </AppButton>
  </div>

  {/* Page Title - Right */}
  <div
    style={{
      flex: 1,
      minWidth: 200,
      direction: lang === "ar" ? "rtl" : "ltr",
    }}
  >
    <AppPageHeader
      title={t("invoices.title")}
      subtitle={t("invoices.subtitle")}
    />
  </div>
</div>
        {/* 💰 CARDS */}
       <InvoiceCards
          totals={totals}
          t={t}
        />
      
      <InvoiceFilters
  fromDate={fromDate}
  setFromDate={setFromDate}
  toDate={toDate}
  setToDate={setToDate}
  search={search}
  setSearch={setSearch}
  paymentFilter={paymentFilter}
  setPaymentFilter={setPaymentFilter}
  selectedSeller={selectedSeller}
  setSelectedSeller={setSelectedSeller}
  sellers={sellers}
  invoiceStatusFilter={invoiceStatusFilter}
  setInvoiceStatusFilter={setInvoiceStatusFilter}
  showBranchFilter={showBranchFilter}
  branchFilter={branchFilter}
  setBranchFilter={setBranchFilter}
  branches={branches}
  t={t}
/>

        

        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          alignItems: "flex-start",
          flexWrap: isMobile ? "wrap" : "nowrap"
        }}>
          <InvoiceTable
  isMobile={isMobile}
  loadingSales={loadingSales || loadingReturns}
  paginated={paginated}
  selectedInvoice={selectedInvoice}
  setSelectedInvoice={setSelectedInvoice}
  onSelectRow={handleSelectInvoiceRow}
  theme={theme}
  t={t}
  page={page}
  setPage={setPage}
  totalPages={totalPages}
  handleRowHover={handleRowHover}
  handleRowLeave={handleRowLeave}
  formatDate={formatDate}
  isFullyRefunded={isFullyRefunded}
  lang={lang}
  dropdownOpen={dropdownOpen}
  setDropdownOpen={setDropdownOpen}
/>

          {/* SIDE PANEL */}
          <AppCard
style={{
flex:2,
minWidth:0,
width:isMobile ? "100%" : undefined,
position:isMobile ? "static" : "sticky",
top:20,

height:"fit-content",

transform:selectedInvoice
?"translateX(0)"
:"translateX(20px)",

opacity:selectedInvoice?1:.6,

transition:"0.3s"
}}
>
          {!selectedInvoice && <p>{t("invoices.select")}</p>}
          
          {selectedInvoice && (

<InvoiceDetails
  selectedInvoice={selectedInvoice}
  isMobile={isMobile}
  showDetails={showDetails}
  setShowDetails={setShowDetails}
  theme={theme}
  t={t}
  lang={lang}

  setRefundItems={setRefundItems}

  branchName={branchName}
  branchNameMap={branchNameMap}

  dropdownOpen={dropdownOpen}
  setDropdownOpen={setDropdownOpen}

  cancelling={cancelling}
  handlePrint={handlePrint}
  handleRowHover={handleRowHover}
  handleRowLeave={handleRowLeave}

  action={action}
  setAction={setAction}
  setShowRefundPopup={setShowRefundPopup}
  setShowConfirm={setShowConfirm}

  formatDateTime={formatDateTime}
  formatDate={formatDate}

  netTotal={netTotal}

  previousReturns={previousReturns}
  groupedReturns={groupedReturns}

  getKey={getKey}
  isFullyRefunded={isFullyRefunded}
/>
)}
          
          </AppCard>
        </div>
        <RefundModal
  showRefundPopup={showRefundPopup}
  selectedInvoice={selectedInvoice}
  liveReturns={liveReturns}
  getKey={getKey}
  lang={lang}
  t={t}
  theme={theme}
  isMobile={isMobile}
  refundMap={refundMap}
  handleRefundQty={handleRefundQty}
  handlePartialRefund={executeRefund}
  loading={loading}
  hasValidRefund={hasValidRefund}
  setShowRefundPopup={setShowRefundPopup}
  setRefundItems={setRefundItems}
  refundPaymentMethod={refundPaymentMethod}
  setRefundPaymentMethod={setRefundPaymentMethod}
/>
        {/* 🔴 CONFIRM MODAL */}
        <CancelModal
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          cancelReasonType={cancelReasonType}
          setCancelReasonType={setCancelReasonType}
          confirmAction={confirmAction}
          theme={theme}
          t={t}
        />
      </div>
    );
  }