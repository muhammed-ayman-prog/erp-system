import SearchInput
from "../../../components/ui/forms/SearchInput";

export default function UsersFilters({
  t,
  search,
  setSearch,
  filterBranch,
  setFilterBranch,
  branches,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "10px",
      }}
    >
      <SearchInput
        placeholder={t("users.search")}
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          flex: "1 1 220px",
        }}
      />

      <select
        value={filterBranch}
        onChange={(e) =>
          setFilterBranch(e.target.value)
        }
        style={{
          flex: "1 1 160px",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          background: "#fff",
        }}
      >
        <option value="all">
          {t("branches.all")}
        </option>

        {branches.map((b) => (
          <option
            key={b.id}
            value={b.id}
          >
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}