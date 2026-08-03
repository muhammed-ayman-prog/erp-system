import PageHeader from "../../../components/ui/layout/PageHeader";
import { useTranslate } from "../../../useTranslate";
import usePurchaseHistory from "./hooks/usePurchaseHistory";
import HistoryFilters from "./components/HistoryFilters";
import HistoryTable from "./components/HistoryTable";


export default function PurchaseHistory() {
  const { t } = useTranslate();

  const {
    loading,
    purchases,
    stockLogs,

    search,
    setSearch,

    fromDate,
  setFromDate,

  toDate,
  setToDate,

    openId,
    setOpenId,
  } = usePurchaseHistory();

  return (
    <>
      <PageHeader
        title={t("stockEntry.history")}
        subtitle="عرض جميع عمليات الشراء"
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <HistoryFilters
  search={search}
  setSearch={setSearch}
  fromDate={fromDate}
  setFromDate={setFromDate}
  toDate={toDate}
  setToDate={setToDate}
/>

        <HistoryTable
  purchases={purchases}
  openId={openId}
  setOpenId={setOpenId}
/>

        {loading && <div>Loading...</div>}

        {!loading && purchases.length === 0 && (
          <div>لا توجد عمليات شراء.</div>
        )}
      </div>
    </>
  );
}