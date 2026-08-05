import { theme } from "../../theme";

const shimmer = {
  background:
    "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 37%,#f1f5f9 63%)",
  backgroundSize: "400% 100%",
  animation: "app-skeleton-loading 1.4s ease infinite",
};

function Block({
  width = "100%",
  height = 16,
  radius = theme.radius.md,
  style = {},
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        ...shimmer,
        ...style,
      }}
    />
  );
}

export default function AppSkeleton({
  variant = "card",

  rows = 5,
}) {
  return (
    <>
      <style>
        {`
        @keyframes app-skeleton-loading{
          0%{
            background-position:100% 0;
          }

          100%{
            background-position:-100% 0;
          }
        }
      `}
      </style>

      {variant === "stat" && (
        <div
          style={{
            background: theme.colors.card,

            borderRadius: theme.radius.xl,

            border: `1px solid ${theme.colors.border}`,

            padding: theme.spacing.xxl,
          }}
        >
          <Block
            width="55%"
            height={16}
          />

          <Block
            width="70%"
            height={34}
            style={{
              marginTop: 20,
            }}
          />

          <Block
            width="40%"
            height={14}
            style={{
              marginTop: 16,
            }}
          />
        </div>
      )}

      {variant === "table" && (
        <div
          style={{
            display: "flex",

            flexDirection: "column",

            gap: 14,
          }}
        >
          {Array.from({
            length: rows,
          }).map((_, i) => (
            <Block
              key={i}
              height={48}
            />
          ))}
        </div>
      )}

      {variant === "form" && (
        <div
          style={{
            display: "flex",

            flexDirection: "column",

            gap: 16,
          }}
        >
          {Array.from({
            length: rows,
          }).map((_, i) => (
            <Block
              key={i}
              height={44}
            />
          ))}
        </div>
      )}

      {variant === "card" && (
        <div
          style={{
            background: theme.colors.card,

            borderRadius: theme.radius.xl,

            border: `1px solid ${theme.colors.border}`,

            padding: theme.spacing.xxl,
          }}
        >
          <Block
            width="70%"
            height={20}
          />

          <Block
            width="100%"
            height={14}
            style={{
              marginTop: 20,
            }}
          />

          <Block
            width="90%"
            height={14}
            style={{
              marginTop: 12,
            }}
          />

          <Block
            width="50%"
            height={14}
            style={{
              marginTop: 12,
            }}
          />
        </div>
      )}
    </>
  );
}