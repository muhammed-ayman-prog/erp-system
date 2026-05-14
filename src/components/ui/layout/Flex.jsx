export default function Flex({
  children,

  align = "center",

  justify = "flex-start",

  gap = "10px",

  direction = "row",

  wrap = "nowrap",

  fullWidth = false,

  style = {},
}) {

  return (

    <div
      style={{
        display: "flex",

        alignItems: align,

        justifyContent: justify,

        gap,

        flexDirection: direction,

        flexWrap: wrap,

        width:
          fullWidth
            ? "100%"
            : "auto",

        ...style,
      }}
    >

      {children}

    </div>

  );

}