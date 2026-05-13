export default function AppCard({
  children,
  style = {}
}) {

  return (
    <div
      style={{
        background: "#fff",

        borderRadius: "18px",

        padding: "16px",

        border:
          "1px solid #e5e7eb",

        boxShadow:
          "0 1px 3px rgba(0,0,0,0.05)",

        ...style
      }}
    >

      {children}

    </div>
  );
}