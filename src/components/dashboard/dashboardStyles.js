export const page = {
  padding:
    window.innerWidth < 768
      ? 10
      : 20
};

export const topBar = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 15
};

export const filter = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
};

export const exportBtns = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  width: "100%"
};

export const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  background: "#fff",
  border: "1px solid #e5e7eb",
  flex: "1 1 120px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontWeight: "500",
  transition: "0.2s"
};

export const alerts = {
  padding: 14,
  background: "#fff1f2",
  borderRadius: 14,
  marginBottom: 20,
  border: "1px solid #fecaca",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontWeight: "600"
};