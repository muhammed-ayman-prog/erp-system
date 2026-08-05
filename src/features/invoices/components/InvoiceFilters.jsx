import { Search } from "lucide-react";

import AppFilterBar from "../../../components/ui/AppFilterBar";
import AppFormField from "../../../components/ui/AppFormField";
import AppInput from "../../../components/ui/AppInput";
import AppSelect from "../../../components/ui/AppSelect";

export default function InvoiceFilters(props) {
  const {
    fromDate,
    setFromDate,

    toDate,
    setToDate,

    search,
    setSearch,

    paymentFilter,
    setPaymentFilter,

    selectedSeller,
    setSelectedSeller,

    sellers,

    invoiceStatusFilter,
    setInvoiceStatusFilter,

    t,
  } = props;

  return (
    <AppFilterBar>
      <AppFormField
  label={t("common.search")}
  style={{
    gridColumn: "1 / -1",
  }}
>
        <AppInput
          value={search}
          startIcon={<Search size={18} />}
          placeholder={t("common.search")}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </AppFormField>

      <AppFormField
        label={t("payment.method")}
      >
        <AppSelect
          value={paymentFilter}
          onChange={(e) =>
            setPaymentFilter(e.target.value)
          }
        >
          <option value="all">
            {t("common.all")}
          </option>

          <option value="cash">
            {t("common.cash")}
          </option>

          <option value="visa">
            {t("common.visa")}
          </option>

          <option value="instapay">
            {t("common.instapay")}
          </option>
        </AppSelect>
      </AppFormField>

      <AppFormField
        label={t("users.sales")}
      >
        <AppSelect
          value={selectedSeller}
          onChange={(e) =>
            setSelectedSeller(e.target.value)
          }
        >
          <option value="all">
            {t("common.all")}
          </option>

          {sellers.map((seller) => (
            <option
              key={seller}
              value={seller}
            >
              {seller}
            </option>
          ))}
        </AppSelect>
      </AppFormField>

      <AppFormField
        label={t("common.status")}
      >
        <AppSelect
          value={invoiceStatusFilter}
          onChange={(e) =>
            setInvoiceStatusFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            {t("common.all")}
          </option>

          <option value="completed">
            {t("invoices.completed")}
          </option>

          <option value="partial">
            {t("invoices.partialRefunded")}
          </option>

          <option value="refunded">
            {t("invoices.refunded")}
          </option>

          <option value="cancelled">
            {t("invoices.cancelled")}
          </option>
        </AppSelect>
      </AppFormField>

      <AppFormField
        label={t("common.from")}
      >
        <AppInput
          type="date"
          value={fromDate}
          onChange={(e) =>
            setFromDate(e.target.value)
          }
        />
      </AppFormField>

      <AppFormField
        label={t("common.to")}
      >
        <AppInput
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(e.target.value)
          }
        />
      </AppFormField>
    </AppFilterBar>
  );
}