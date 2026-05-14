export default function PopupPrice({
  price,
  lang,
  t
}) {

  return (
    <p className="popup-price">

      {t("common.price")}

      :{" "}

      {(price || 0).toLocaleString(
        lang === "ar"
          ? "ar-EG"
          : "en-US"
      )}

      {" "}EGP

    </p>
  );
}