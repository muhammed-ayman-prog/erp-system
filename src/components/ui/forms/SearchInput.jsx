import { theme } from "../../../theme";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  lang = "en",
  style = {},
  inputStyle = {},
}) {

  const isRTL =
    lang === "ar";

  return (

    <div
      style={{
        position: "relative",
        width: "100%",
        ...style,
      }}
    >

      <span
        style={{
          position: "absolute",

          top: "50%",

          transform:
            "translateY(-50%)",

          [isRTL
            ? "right"
            : "left"]: "14px",

          opacity: 0.5,

          fontSize: "14px",

          pointerEvents: "none",
        }}
      >
        🔍
      </span>

      <input
        type="text"

        value={value}

        onChange={onChange}

        dir={
          isRTL
            ? "rtl"
            : "ltr"
        }

        placeholder={placeholder}

        autoComplete="off"

        style={{
          width: "100%",

          padding:
            isRTL
              ? "13px 42px 13px 14px"
              : "13px 14px 13px 42px",

          borderRadius: "14px",

          border:
            `1px solid ${theme.colors.border}`,

          background:
            theme.colors.card,

          color:
            theme.colors.text,

          fontSize: "14px",

          outline: "none",

          transition: "0.2s",

          ...inputStyle,
        }}

        onFocus={(e) => {

          e.target.style.border =
            `1px solid ${theme.colors.primary}`;

          e.target.style.boxShadow =
            `0 0 0 3px ${theme.colors.primary}20`;
        }}

        onBlur={(e) => {

          e.target.style.border =
            `1px solid ${theme.colors.border}`;

          e.target.style.boxShadow =
            "none";
        }}
      />

    </div>

  );

}