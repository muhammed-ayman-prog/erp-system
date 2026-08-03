import SearchInput from "../../../components/ui/forms/SearchInput";
import AppCard from "../../../components/ui/AppCard";

import { useTranslate } from "../../../useTranslate";
import { usePurchaseContext } from "../context/PurchaseContext";

export default function Search() {
  const { t, lang } = useTranslate();

  const {
    searchQuery,
    setSearchQuery,
  } = usePurchaseContext();

  return (
    <AppCard>
      <SearchInput
        value={searchQuery}
        lang={lang}
        placeholder={t("common.search")}
        onChange={(e) =>
          setSearchQuery(e.target.value)
        }
      />
    </AppCard>
  );
}