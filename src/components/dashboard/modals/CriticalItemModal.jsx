import { useTranslate } from "../../../useTranslate";
export default function
CriticalItemModal({
  selectedCriticalItem,
  setSelectedCriticalItem
}) {
  const { t } = useTranslate();

  if (!selectedCriticalItem)
    return null;

  return (
  <div
    onClick={() =>
      setSelectedCriticalItem(null)
    }

    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}
  >

        <div onClick={(e) => e.stopPropagation()}
         style={{
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          width: 400,
          maxHeight: "80vh",
          overflowY: "auto"
        }}>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15
          }}>
            <h4>
              {t("dashboard.branchStock")}
            </h4>
            <h3>
              {selectedCriticalItem.name}
            </h3>

            <button
              onClick={() =>
                setSelectedCriticalItem(null)
              }
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18
              }}
            >
              ✖
            </button>
          </div>

          {selectedCriticalItem.branchDetails
            ?.sort((a, b) => a.qty - b.qty)
            .map((b, i) => (

              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #eee"
                }}
              >
                <span>{b.branch}</span>

                <strong style={{
                  color:
                    b.qty <= 0
                      ? "#dc2626"
                      : "#f59e0b"
                }}>
                  {b.qty}
                </strong>
              </div>
          ))}

        </div>
    </div>
  );
}