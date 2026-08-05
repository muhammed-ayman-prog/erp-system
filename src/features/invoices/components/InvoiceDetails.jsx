import AppButton from "../../../components/ui/AppButton";
import AppCard from "../../../components/ui/AppCard";
import { theme } from "../../../theme";

import InvoiceActivityTimeline from "./InvoiceActivityTimeline/InvoiceActivityTimeline";
import InvoiceActionsDropdown from "./InvoiceActionsDropdown";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceSummary from "./InvoiceSummary";

export default function InvoiceDetails(props) {
  const {
    selectedInvoice,

    isMobile,
    showDetails,
    setShowDetails,
    isFullyRefunded,

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
        <AppButton
          fullWidth
          style={{
            marginBottom:
              theme.spacing.md,
          }}
          onClick={() =>
            setShowDetails(
              (prev) => !prev
            )
          }
        >
          {showDetails
            ? t("common.hide")
            : t("common.show")}
        </AppButton>
      )}

      {(!isMobile || showDetails) && (
        <AppCard
          id="invoice-print"
          className="invoice-print"
          padding="xl"
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
            }}
          >
            <InvoiceHeader
              selectedInvoice={
                selectedInvoice
              }
              formatDateTime={
                formatDateTime
              }
              isMobile={isMobile}
              t={t}
              setDropdownOpen={
                setDropdownOpen
              }
            />

            <InvoiceActionsDropdown
              dropdownOpen={
                dropdownOpen
              }
              selectedInvoice={
                selectedInvoice
              }
              cancelling={
                cancelling
              }
              setRefundItems={
                setRefundItems
              }
              setShowRefundPopup={
                setShowRefundPopup
              }
              setAction={setAction}
              setShowConfirm={
                setShowConfirm
              }
              handlePrint={
                handlePrint
              }
              setDropdownOpen={
                setDropdownOpen
              }
              theme={theme}
              t={t}
            />
          </div>

          <InvoiceSummary
            selectedInvoice={
              selectedInvoice
            }
            branchName={branchName}
            branchNameMap={
              branchNameMap
            }
            t={t}
            lang={lang}
            isFullyRefunded={
              isFullyRefunded
            }
            netTotal={netTotal}
            getKey={getKey}
          />

          <InvoiceActivityTimeline
            previousReturns={
              previousReturns
            }
            groupedReturns={
              groupedReturns
            }
            selectedInvoice={
              selectedInvoice
            }
            formatDateTime={
              formatDateTime
            }
            theme={theme}
            t={t}
          />
        </AppCard>
      )}
    </>
  );
}