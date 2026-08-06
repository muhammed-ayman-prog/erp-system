import {
  FlaskConical,
  Leaf,
  Sparkles,
  Star,
} from "lucide-react";

import AppButton from "../../../components/ui/AppButton";

export default function SalesCategories({
  isMobile,
  mainTab,
  setMainTab,
  setSubTab,
  setPopupStep,
  setShowPopup,
  t,
}) {
  const categories = [
    {
      key: "french",
      label: t("products.french"),
      icon: <FlaskConical size={20} />,
      onClick: () => {
        setMainTab("french");
        setSubTab(null);
      },
    },

    {
      key: "oriental",
      label: t("products.oriental"),
      icon: <Leaf size={20} />,
      onClick: () => {
        setPopupStep("oriental");
        setShowPopup(true);
      },
    },

    {
      key: "body",
      label: t("products.body"),
      icon: <Sparkles size={20} />,
      onClick: () => {
        setPopupStep("body");
        setShowPopup(true);
      },
    },

    {
      key: "original",
      label: t("products.original"),
      icon: <Star size={20} />,
      onClick: () => {
        setMainTab("original");
        setSubTab(null);
      },
    },
  ];

  return (
    <div
      className="hide-scroll"
      style={{
        display: "flex",

        flexDirection: isMobile
          ? "row"
          : "column",

        gap: 12,

        overflowX: isMobile
          ? "auto"
          : "visible",

        scrollbarWidth: "none",

        msOverflowStyle: "none",

        paddingBottom: isMobile
          ? 4
          : 0,
      }}
    >
      {categories.map((item) => {
        const active =
          mainTab === item.key;

        return (
          <AppButton
            key={item.key}
            size="lg"
            leftIcon={item.icon}
            justify="flex-start"
            fullWidth={!isMobile}
            variant={
              active
                ? "primary"
                : "secondary"
            }
            onClick={item.onClick}
            style={{
              flexShrink: 0,

              minWidth: isMobile
                ? 165
                : "100%",

              fontWeight: active
                ? 700
                : 600,

              boxShadow: active
                ? "0 10px 28px rgba(37,99,235,.18)"
                : undefined,
            }}
          >
            {item.label}
          </AppButton>
        );
      })}
    </div>
  );
}