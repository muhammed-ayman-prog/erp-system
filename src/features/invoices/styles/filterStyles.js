export const createFilterStyles = (theme) => {
  const filterInput = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.card,
    outline: "none",
    fontSize: "14px",
  };

  const filterLabel = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
    color: theme.colors.textSecondary,
  };

  return {
    filterInput,
    filterLabel,
  };
};