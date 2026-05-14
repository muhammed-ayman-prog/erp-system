import AppButton from "../../../../components/ui/AppButton";

export default function PopupContainerButtons({

  isMusk,

  containerType,
  setContainerType,

  getContainerButtonStyle,

  t
}) {

  return (

    <div className="popup-buttons">

      {!isMusk && (
        <>

          <AppButton
            onClick={() => {
              setContainerType(
                "bottle"
              );
            }}

            style={
              getContainerButtonStyle(
                "bottle"
              )
            }
          >

            {t("products.bottle")}

          </AppButton>

          <AppButton
            onClick={() => {
              setContainerType(
                "box"
              );
            }}

            style={
              getContainerButtonStyle(
                "box"
              )
            }
          >

            {t("products.box")}

          </AppButton>
        </>
      )}

      <AppButton
        onClick={() => {
          setContainerType(
            "sample"
          );
        }}

        style={
          getContainerButtonStyle(
            "sample"
          )
        }
      >

        {t("products.samples")}

      </AppButton>

      <AppButton
        onClick={() => setContainerType("oil")}

        style={
          getContainerButtonStyle(
            "oil"
          )
        }
      >

        {t("products.pureOil")}

      </AppButton>

    </div>
  );
}