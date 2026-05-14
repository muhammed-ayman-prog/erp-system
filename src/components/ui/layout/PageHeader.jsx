import { theme } from "../../../theme";

export default function PageHeader({
  title,
  subtitle,
  actions,
  style = {},
}) {

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap",
        ...style,
      }}
    >

      <div>

        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "800",
            color: theme.colors.text,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>

        {subtitle && (

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              fontSize: "14px",
              color:
                theme.colors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>

        )}

      </div>

      {actions && (

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {actions}
        </div>

      )}

    </div>

  );

}