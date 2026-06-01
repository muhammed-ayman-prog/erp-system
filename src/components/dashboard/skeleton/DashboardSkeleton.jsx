import {
  page
} from "../dashboardStyles";

import useIsMobile from
"../../../hooks/useIsMobile";

function DashboardSkeleton() {

  const isMobile =
    useIsMobile();

  return (

    <div style={page}>

      <div style={{
        height: 35,
        width: 180,

        background:
          "linear-gradient(90deg,#eee,#f5f5f5,#eee)",

        backgroundSize:
          "200% 100%",

        animation:
          "skeleton-loading 1.4s ease-in-out infinite",

        borderRadius: 12,

        marginBottom: 20
      }}/>

      <div style={{

        display: "grid",

        gridTemplateColumns:
          isMobile
            ? "1fr"
            : "repeat(auto-fit,minmax(220px,1fr))",

        gap: 15
      }}>

        {[...Array(8)].map((_, i) => (

          <div
            key={i}

            style={{

              height: 120,

              borderRadius: 16,

              background:
                "linear-gradient(90deg,#eee,#f5f5f5,#eee)",

              backgroundSize:
                "200% 100%",

              animation:
                "skeleton-loading 1.4s ease-in-out infinite"
            }}
          />

        ))}

      </div>

    </div>

  );
}

export default DashboardSkeleton;