export default function SalesSearch({
  lang,
  search,
  setSearch,
  theme,
  t
}) {

  return (
    <div style={{
      position: "relative",
      marginBottom: "12px"
    }}>

      <span style={{
        position: "absolute",

        [lang === "ar"
          ? "right"
          : "left"]: "14px",

        top: "50%",

        transform: "translateY(-50%)",

        opacity: 0.5,

        fontSize: "15px",

        pointerEvents: "none"
      }}>
        🔍
      </span>

      <input
        autoComplete="off"

        dir={
          lang === "ar"
            ? "rtl"
            : "ltr"
        }

        type="text"

        placeholder={
          t("products.search")
        }

        value={search}

        onChange={(e) =>
          setSearch(e.target.value)
        }

        style={{
          fontSize: "14px",

          width: "100%",

          padding:
            lang === "ar"
              ? "14px 40px 14px 16px"
              : "14px 16px 14px 40px",

          borderRadius: "12px",

          background:
            theme.colors.card,

          border:
            `1px solid ${theme.colors.border}`
        }}
      />

    </div>
  );
}