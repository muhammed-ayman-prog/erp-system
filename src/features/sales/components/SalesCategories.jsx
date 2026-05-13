import {
  FlaskConical,
  Leaf,
  Sparkles,
  Star
} from "lucide-react";

export default function SalesCategories({
  isMobile,
  mainTab,
  setMainTab,
  setSubTab,
  setPopupStep,
  setShowPopup,
  t
}) {

  return (
    <div
      className="hide-scroll"
      style={{
        display: "flex",
        flexDirection:
          isMobile ? "row" : "column",

        overflowX:
          isMobile ? "auto" : "visible",

        scrollbarWidth: "none",

        msOverflowStyle: "none",

        gap: "8px",

        scrollBehavior: "smooth"
      }}
    >

      <div
        className={`cat-item ${
          mainTab === "french"
            ? "active"
            : ""
        }`}
        onClick={() => {
          setMainTab("french");
          setSubTab(null);
        }}
      >
        <FlaskConical size={16} />
        {t("products.french")}
      </div>

      <div
        className={`cat-item ${
          mainTab === "oriental"
            ? "active"
            : ""
        }`}
        onClick={() => {
          setPopupStep("oriental");
          setShowPopup(true);
        }}
      >
        <Leaf size={16} />
        {t("products.oriental")}
      </div>

      <div
        className={`cat-item ${
          mainTab === "body"
            ? "active"
            : ""
        }`}
        onClick={() => {
          setPopupStep("body");
          setShowPopup(true);
        }}
      >
        <Sparkles size={16} />
        {t("products.body")}
      </div>

      <div
        className={`cat-item ${
          mainTab === "original"
            ? "active"
            : ""
        }`}
        onClick={() => {
          setMainTab("original");
          setSubTab(null);
        }}
      >
        <Star size={16} />
        {t("products.original")}
      </div>

    </div>
  );
}