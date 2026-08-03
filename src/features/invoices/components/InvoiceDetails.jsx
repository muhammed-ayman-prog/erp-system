import InvoiceActivityTimeline from "./InvoiceActivityTimeline/InvoiceActivityTimeline";
import InvoiceSummary from "./InvoiceSummary";
import InvoiceActionsDropdown from "./InvoiceActionsDropdown";
import InvoiceHeader from "./InvoiceHeader";
export default function InvoiceDetails(props) {
  const {
    selectedInvoice,

    isMobile,
    showDetails,
    setShowDetails,
    isFullyRefunded,
    theme,
    t,
    lang,

    dropdownOpen,
    setDropdownOpen,

    cancelling,

    setRefundItems,
    setShowRefundPopup,
    setAction,
    setShowConfirm,

    handlePrint,

    formatDateTime,

    netTotal,

    previousReturns,
    groupedReturns,

    branchName,
    branchNameMap,
     getKey,
  } = props;

  return (
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

      <InvoiceHeader
  selectedInvoice={selectedInvoice}
  formatDateTime={formatDateTime}
  isMobile={isMobile}
  theme={theme}
  t={t}
  setDropdownOpen={setDropdownOpen}
/>

      <InvoiceActionsDropdown
  dropdownOpen={dropdownOpen}
  selectedInvoice={selectedInvoice}
  cancelling={cancelling}
  setRefundItems={setRefundItems}
  setShowRefundPopup={setShowRefundPopup}
  setAction={setAction}
  setShowConfirm={setShowConfirm}
  handlePrint={handlePrint}
  setDropdownOpen={setDropdownOpen}
  theme={theme}
  t={t}
/>
      

    <InvoiceSummary
  selectedInvoice={selectedInvoice}
  branchName={branchName}
  branchNameMap={branchNameMap}
  theme={theme}
  t={t}
  lang={lang}
  isFullyRefunded={isFullyRefunded}
  netTotal={netTotal}
  getKey={getKey}
/>


<InvoiceActivityTimeline
  previousReturns={previousReturns}
  groupedReturns={groupedReturns}
  selectedInvoice={selectedInvoice}
  formatDateTime={formatDateTime}
  theme={theme}
  t={t}
/>
</div>
  )}
  
</>

  );
}