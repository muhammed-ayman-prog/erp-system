import AppCard from "../../../components/ui/AppCard";

import AppSkeleton from "../../../components/ui/AppSkeleton";

export default function ProductGridSkeleton() {

  return (
    <div className="products-grid">

      {Array.from({ length: 8 }).map((_, i) => (

        <AppCard
          key={i}

          style={{
            minHeight: "180px"
          }}
        >

          <AppSkeleton
            height="12px"
            width="40%"
          />

          <AppSkeleton
            height="42px"

            style={{
              marginTop: "14px"
            }}
          />

          <AppSkeleton
            height="12px"
            width="60%"

            style={{
              marginTop: "20px"
            }}
          />

          <AppSkeleton
            height="16px"
            width="35%"

            style={{
              marginTop: "auto"
            }}
          />

        </AppCard>

      ))}

    </div>
  );
}