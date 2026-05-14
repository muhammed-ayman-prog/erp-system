export default function AppSkeleton({
  height = "20px",
  width = "100%",
  radius = "12px",
  style = {}
}) {

  return (
    <div
      style={{
        width,

        height,

        borderRadius: radius,

        background:
          "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 37%,#f1f5f9 63%)",

        backgroundSize:
          "400% 100%",

        animation:
          "skeleton-loading 1.4s ease infinite",

        ...style
      }}
    />
  );
}