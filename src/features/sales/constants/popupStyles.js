export const popupButtonStyle = (
  theme
) => ({

  padding: "12px 16px",

  margin: "6px",

  background:
    theme.colors.secondary,

  color:
    theme.colors.text,

  border:
    `1px solid ${theme.colors.border}`,

  borderRadius: "12px",

  cursor: "pointer",

  transition: "0.2s"
});