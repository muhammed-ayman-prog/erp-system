import AppButton from "../../../../components/ui/AppButton";
export default function PopupStepOptions({

  title,

  options,

  btnStyle
}) {

  return (

    <>
      <h3>{title}</h3>

      {options.map((item) => (

        <AppButton
          key={item.label}

          style={btnStyle}

          onClick={item.onClick}
        >

          {item.label}

        </AppButton>

      ))}
    </>
  );
}