import AppCard from "../AppCard";
import { theme } from "../../../theme";

export default function SectionCard({
  title,
  subtitle,
  actions,
  children,
  style = {},
  contentStyle = {},
}) {

  return (

    <AppCard
      style={{
        padding: "20px",
        borderRadius: "20px",
        overflow: "hidden",
        ...style,
      }}
    >

      {(title || subtitle || actions) && (

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            marginBottom: "18px",
            flexWrap: "wrap",
          }}
        >

          <div>

            {title && (

              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                {title}
              </h3>

            )}

            {subtitle && (

              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "13px",
                  color:
                    theme.colors.textSecondary,
                }}
              >
                {subtitle}
              </p>

            )}

          </div>

          {actions && (
            <div>
              {actions}
            </div>
          )}

        </div>

      )}

      <div style={contentStyle}>
        {children}
      </div>

    </AppCard>

  );

}