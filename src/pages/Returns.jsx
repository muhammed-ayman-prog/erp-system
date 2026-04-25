import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useTranslate } from "../useTranslate";
export default function Returns() {
  const t = useTranslate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const q = query(
          collection(db, "returns"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const result = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setData(result);
      } catch (err) {
        console.error("Error fetching returns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return "-";
    try {
      return new Date(ts.seconds * 1000).toLocaleString();
    } catch {
      return "-";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>{t("returns.title")} 🔄</h2>
      </div>

      {/* Loading */}
      {loading && <p>{t("common.loading")}</p>}

      {/* Table */}
      {!loading && (
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            
            <thead style={{ background: "#f9f9fb" }}>
              <tr style={{ textAlign: "left", fontSize: "13px", color: "#666" }}>
                <th style={{ padding: "12px" }}>{t("returns.invoice")}</th>
                <th>{t("returns.product")}</th>
                <th>{t("common.qty")}</th>
                <th>{t("returns.type")}</th>
                <th>{t("common.date")}</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>
                    {t("returns.noReturns")}
                  </td>
                </tr>
              )}

              {data.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderTop: "1px solid #eee" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9f9fb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "12px" }}>{r.invoiceId}</td>
                  <td>{r.productName}</td>
                  <td>{r.quantity}</td>

                  {/* Type Badge */}
                  <td>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      background:
                        r.type === "refund" ? "#ffecec" : "#e6f0ff",
                      color:
                        r.type === "refund" ? "#ff3b30" : "#004085"
                    }}>
                      {t(`returns.${r.type}`)}
                    </span>
                  </td>

                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}