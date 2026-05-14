export default function AccordionGroup({
  title,
  isOpen,
  onToggle,
  children,

  background = "#f3f4f6",

  contentStyle = {},

  buttonStyle = {},

  className = "",
}) {

  return (

    <div>

      <button
        onClick={onToggle}

        style={{
          width: "100%",

          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",

          padding: "12px 15px",

          borderRadius: "12px",

          border: "none",

          background,

          cursor: "pointer",

          fontWeight: "700",

          fontSize: "16px",

          marginBottom: "10px",
          ...buttonStyle,
        }}
      >

        <span>
          {title}
        </span>

        <span>
          {isOpen ? "−" : "+"}
        </span>

      </button>

      <div
        style={{
          maxHeight:
            isOpen
              ? "9999px"
              : "0px",

          overflow: "hidden",

          transition:
            "max-height 0.3s ease",

          ...contentStyle
        }}
      >

        {children}

      </div>

    </div>

  );

}