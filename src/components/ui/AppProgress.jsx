import { theme } from "../../theme";

export default function AppProgress({
  value = 0,

  color = theme.colors.primary,

  background = theme.colors.cardSoft,

  height = 8,

  radius = theme.radius.full,

  animated = true,

  striped = false,

  showLabel = false,

  style = {},
}) {
  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(value) || 0
    )
  );

  return (
    <div style={style}>
      <div
        style={{
          width: "100%",
          height,
          background,
          borderRadius: radius,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: striped
              ? `repeating-linear-gradient(
                  45deg,
                  ${color},
                  ${color} 10px,
                  rgba(255,255,255,.18) 10px,
                  rgba(255,255,255,.18) 20px
                )`
              : color,

            borderRadius: radius,

            transition: animated
              ? "width .35s ease"
              : "none",
          }}
        />
      </div>

      {showLabel && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            fontWeight: 600,
            color: theme.colors.textSecondary,
            textAlign: "right",
          }}
        >
          {progress}%
        </div>
      )}
    </div>
  );
}