import { useMemo, useState } from "react";

import AppTable from "./AppTable";
import AppEmptyState from "./AppEmptyState";

export default function AppDataTable({
  rows = [],
  columns = [],

  loading = false,

  pageSize = 10,

  searchable = false,

  searchPlaceholder = "Search...",

  searchKeys = [],

  emptyTitle = "No Data",

  renderCell,

  keyField = "id",

  onRowClick,
}) {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    if (!searchable || !search.trim()) {
      return rows;
    }

    const keyword = search.toLowerCase();

    return rows.filter((row) =>
      searchKeys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [rows, search, searchable, searchKeys]);

  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / pageSize)
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredRows.slice(
      start,
      start + pageSize
    );
  }, [filteredRows, page, pageSize]);

  return (
    <>
      {searchable && (
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />
      )}

      <AppTable
        loading={loading}
        columns={columns}
        rows={paginatedRows}
        keyField={keyField}
        renderCell={renderCell}
        onRowClick={onRowClick}
        hover
        striped
        emptyComponent={
          <AppEmptyState
            title={emptyTitle}
          />
        }
      />

      {totalPages > 1 && (
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {Array.from(
            { length: totalPages },
            (_, i) => (
              <button
                key={i}
                onClick={() =>
                  setPage(i + 1)
                }
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  background:
                    page === i + 1
                      ? "#2563eb"
                      : "#fff",
                  color:
                    page === i + 1
                      ? "#fff"
                      : "#000",
                }}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}