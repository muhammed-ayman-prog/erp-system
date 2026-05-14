import {
  useEffect,
  useRef,
  useState
} from "react";
export default function CustomerSection({
  theme,
  t,
  employees,
  customerName,
  setCustomerName,

  customerPhone,
  setCustomerPhone,

  customerData,
  getCustomerTier,

  seller: selectedSeller,
  setSelectedSeller,

  showErrors,
  setShowErrors
}) {
const [showSellerMenu, setShowSellerMenu] =
  useState(false);
const sellerMenuRef = useRef(null);
useEffect(() => {

  function handleClickOutside(e) {

    if (
      sellerMenuRef.current &&
      !sellerMenuRef.current.contains(e.target)
    ) {

      setShowSellerMenu(false);
    }
  }

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {

    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };

}, []);
  return (
    <div style={{ marginTop: "15px" }}>

      <p>{t("customer.info")}</p>

      {/* Phone */}
      <input
        type="text"
        placeholder={t("customer.phone")}
        value={customerPhone}
        onChange={(e) => {

          setCustomerPhone(
            e.target.value
              .replace(/\s/g, "")
              .replace(/^\+2/, "")
          );

          setShowErrors(false);
        }}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",

          border:
            showErrors && !customerPhone
              ? "2px solid #ef4444"
              : `1px solid ${theme.colors.border}`,

          boxShadow:
            showErrors && !customerPhone
              ? "0 0 0 2px rgba(239,68,68,0.2)"
              : "none"
        }}
      />

      {/* Name */}
      <input
        type="text"
        placeholder={t("customer.name")}
        value={customerName}
        onChange={(e) => {

          setCustomerName(e.target.value);

          setShowErrors(false);
        }}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "8px",
          borderRadius: "10px",

          border:
            showErrors && !customerName
              ? "2px solid #ef4444"
              : `1px solid ${theme.colors.border}`,

          boxShadow:
            showErrors && !customerName
              ? "0 0 0 2px rgba(239,68,68,0.2)"
              : "none"
        }}
      />

      {/* Tier */}
      {customerData && (

        <div style={{ marginBottom: "10px" }}>

          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "2px",
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "600",

            background:
              getCustomerTier(customerData).background,

            border: "1px solid rgba(0,0,0,0.05)"
          }}>

            <span>
              {getCustomerTier(customerData).label}
            </span>

            <span style={{
              fontSize: "10px",
              color: "#64748b",
              fontWeight: "500"
            }}>
              {(customerData.ordersCount || 0)} Orders •{" "}
              {customerData.totalSpent || 0} EGP
            </span>

          </div>

        </div>

      )}

      {/* Sales Name */}
      <div style={{ marginBottom: "10px" }}>

        <div
          ref={sellerMenuRef}

          style={{
            position: "relative"
          }}
        >

  <button
    type="button"
    aria-expanded={showSellerMenu}
    aria-haspopup="listbox"
    onClick={() =>
      setShowSellerMenu(
        !showSellerMenu
      )
    }

    style={{
      width: "100%",
      padding: "14px 16px",
      transition: "0.2s ease",
      boxShadow:
        showSellerMenu
          ? "0 0 0 4px rgba(59,130,246,0.12)"
          : "none",
      borderRadius: "12px",

      border:
        showErrors && !selectedSeller
          ? "2px solid #ef4444"
          : `1px solid ${theme.colors.border}`,

      background: theme.colors.card,

      color:
        selectedSeller
          ? theme.colors.text
          : theme.colors.textSecondary,

      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",

      cursor: "pointer"
    }}
  >

    <span>
      {selectedSeller?.name ||
        t("cart.selectSeller")}
    </span>

    <span style={{
      fontSize: "12px",
      opacity: 0.7,
      transform:
        showSellerMenu
          ? "rotate(180deg)"
          : "rotate(0deg)",
      transition: "0.2s"
    }}>
      ▼
    </span>

  </button>

  {showSellerMenu && (

    <div
      style={{
        position: "absolute",

        top: "110%",
        left: 0,
        right: 0,

        background: theme.colors.card,

        border:
          `1px solid ${theme.colors.border}`,

        borderRadius: "18px",

        overflow: "hidden",

        zIndex: 50,

        padding: "8px",

        backdropFilter: "blur(12px)",

        boxShadow:
          "0 20px 50px rgba(0,0,0,0.12)"
      }}
    >

      {employees?.length ? (

  employees.map((employee, index) => (

        <button
          key={index}

          type="button"

          onClick={() => {

            setSelectedSeller(employee);

            setShowSellerMenu(false);
          }}

          style={{
            width: "100%",

            padding: "12px 14px",

            border: "none",

            borderRadius: "12px",

            marginBottom: "4px",

            background:
              selectedSeller?.name === employee.name
                ? "rgba(59,130,246,0.12)"
                : "transparent",

            color: theme.colors.text,

            textAlign: "start",

            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            gap: "10px",

            transition: "0.18s ease"
          }}
          onMouseEnter={(e) => {

            if (window.innerWidth <= 768) return;
            e.currentTarget.style.background =
              "rgba(59,130,246,0.08)";
          }}

          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              selectedSeller?.name === employee.name
                ? "rgba(59,130,246,0.12)"
                : "transparent";
          }}
        >

          <>
          <div style={{
            width: "34px",
            height: "34px",

            borderRadius: "999px",

            background:
              "rgba(139,92,246,0.12)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            fontSize: "13px",
            fontWeight: "700",
            color: "#7c3aed"
          }}>
            {employee.name?.charAt(0)}
          </div>

          <div style={{
                display: "flex",
                flexDirection: "column",
                flex: 1
              }}>
            <span style={{
              fontWeight: "600",
              fontSize: "14px"
            }}>
              {employee.name}
            </span>

            <span style={{
              fontSize: "11px",
              color: "#64748b"
            }}>
              {t(`roles.${employee.role || "seller"}`)}
            </span>
          </div>
        </>

        </button>

      ))
        ) : (

  <div style={{
    padding: "14px",
    textAlign: "center",
    fontSize: "13px",
    color: theme.colors.textSecondary
  }}>
    {t("cart.noSellers")}
  </div>

)}

    </div>

  )}

</div>

      </div>

    </div>
  );
}