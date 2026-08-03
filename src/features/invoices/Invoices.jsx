  import { db } from "../../firebase";
  import useInvoices from "./hooks/useInvoices";
  import { useEffect,useState } from "react";
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
  query,
  where,
  collection
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
  import useInvoiceTotals from "./hooks/useInvoiceTotals";
  import useInvoiceReturns from "./hooks/useInvoiceReturns";
  import useRefund from "./hooks/useRefund";
  import usePagination from "./hooks/usePagination";
  import useSearch from "./hooks/useSearch";
  import logAction from "../../utils/logAction";
  import { useAuth } from "../../store/useAuth";
  import { getTodayRange } from "../../utils/dateFilter.js";
  import useResponsive from "./hooks/useResponsive";
import {
  getKey,
  isFullyRefunded,
  formatDate,
  formatDateTime
} from "./utils/invoiceHelpers";
import useDropdown from "./hooks/useDropdown";
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

    const { t, lang } = useTranslate();
    const isMobile = useResponsive();
    const [showDetails, setShowDetails] = useState(true);
    const navigate = useNavigate();
    const { id } =
    useParams();
    
    const [branchName, setBranchName] = useState("");
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
});
 const {
      page,
      setPage,
      paginated,
      totalPages,
    } = usePagination(filteredInvoices)

    
    const [cancelReason, setCancelReason] = useState("");
    const [cancelReasonType, setCancelReasonType] = useState("");

    // 💰 totals
   const totals = useInvoiceTotals(filteredInvoices)

    // 🧠 helpers
  

   
  // 🎬 Execute Action
    const confirmAction = async () => {
      if (!selectedInvoice) return;

      if (action === "cancel") await handleCancel({
  inv: selectedInvoice,
  reason: cancelReason.trim(),

  db,
  user,
  t,
  toast,

  writeBatch,
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

  isFullyRefunded,

  updateDoc,

  logAction,

  setCancelling,
});

      setShowConfirm(false);
      setAction("");
      setCancelReason("");
      setCancelReasonType("");
    };
const {
  loading,

  refundItems,
  setRefundItems,

  refundMap,
  hasValidRefund,

  handleRefundQty,

  executeRefund,
} = useRefund({
  selectedInvoice,

  db,
  user,
  toast,
  t,

  writeBatch,
  collection,
  doc,
  increment,
  serverTimestamp,

  setInvoices,

  branchName,
  selectedBranch,

  logAction,
});
   const handlePrint = printInvoice;
   const netTotal = Math.max(
  0,
    (selectedInvoice?.total || 0) -
    (selectedInvoice?.refundedAmount || 0)
  );
  const {
  previousReturns,
  groupedReturns,
  liveReturns,
} = useInvoiceReturns(selectedInvoice);

    return (
      <div style={{ padding: isMobile ? 12 : 20 }}>
        
        <AppPageHeader
    title={t("invoices.title")}
    subtitle={t("invoices.subtitle")}
/>
        {/* 💰 CARDS */}
       <InvoiceCards
          totals={totals}
          t={t}
        />
      <AppFilterBar>
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
  t={t}
/>
</AppFilterBar>
        

        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          alignItems: "flex-start",
          flexWrap: isMobile ? "wrap" : "nowrap"
        }}>
          <InvoiceTable
            isMobile={isMobile}
            loadingSales={loadingSales}
            paginated={paginated}
            selectedInvoice={selectedInvoice}
            setSelectedInvoice={setSelectedInvoice}
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