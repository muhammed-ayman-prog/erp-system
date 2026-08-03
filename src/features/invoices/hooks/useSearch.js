import { useEffect, useMemo, useState } from "react";

export default function useSearch(initialValue = "") {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const searchKey = useMemo(
    () => (debouncedSearch || "").toLowerCase(),
    [debouncedSearch]
  );

  return {
    search,
    setSearch,
    searchKey,
  };
}