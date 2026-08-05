import {
  Ban,
  Printer,
  RotateCcw,
} from "lucide-react";

import AppButton from "../../../components/ui/AppButton";
import AppCard from "../../../components/ui/AppCard";
import { theme } from "../../../theme";

export default function InvoiceActionsDropdown(props) {
  const {
    dropdownOpen,
    selectedInvoice,
    cancelling,
    setRefundItems,
    setShowRefundPopup,
    setAction,
    setShowConfirm,
    handlePrint,
    setDropdownOpen,
    t,
  } = props;

  if (!dropdownOpen) return null;

  const actions = [
    ...(selectedInvoice?.status !== "cancelled"
      ? [
          {
            key: "refund",
            label: t("invoices.refund"),
            color: "warning",
            icon: <RotateCcw size={16} />,
          },
        ]
      : []),

    ...(selectedInvoice?.status !== "cancelled"
      ? [
          {
            key: "cancel",
            label: t("common.cancel"),
            color: "danger",
            icon: <Ban size={16} />,
          },
        ]
      : []),

    {
      key: "print",
      label: t("invoices.print"),
      color: "primary",
      icon: <Printer size={16} />,
    },
  ];

  const handleAction = (key) => {
    if (
      key !== "print" &&
      (selectedInvoice.status ===
        "cancelled" ||
        cancelling)
    ) {
      return;
    }

    switch (key) {
      case "refund":
        setRefundItems([]);
        setShowRefundPopup(true);
        break;

      case "cancel":
        setAction("cancel");
        setShowConfirm(true);
        break;

      case "print":
        handlePrint();
        break;

      default:
        break;
    }

    setDropdownOpen(false);
  };

  return (
    <AppCard
      className="no-print"
      padding="sm"
      shadow="lg"
      style={{
        position: "absolute",
        top: 54,
        left: 0,
        minWidth: 190,
        zIndex: 1000,
      }}
      onClick={(e) =>
        e.stopPropagation()
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.xs,
        }}
      >
        {actions.map((action) => (
          <AppButton
            key={action.key}
            variant={`${action.color}-ghost`}
            justify="flex-start"
            leftIcon={action.icon}
            fullWidth
            onClick={() =>
              handleAction(action.key)
            }
          >
            {action.label}
          </AppButton>
        ))}
      </div>
    </AppCard>
  );
}