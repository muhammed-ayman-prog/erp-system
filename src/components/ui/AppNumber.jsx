import { useMemo } from "react";

export default function AppNumber({
  value = 0,

  currency,

  prefix = "",

  suffix = "",

  decimals = 0,

  compact = false,

  negativeColor = false,

  locale,

  size,

  weight,

  color,

  align,

  as: Component = "span",

  style = {},

  className = "",
}) {
  const number = Number(value) || 0;

  const formatted = useMemo(() => {
    const formatter = new Intl.NumberFormat(
      locale,
      {
        notation: compact
          ? "compact"
          : "standard",

        maximumFractionDigits: decimals,

        minimumFractionDigits: decimals,
      }
    );

    return formatter.format(number);
  }, [
    number,
    decimals,
    compact,
    locale,
  ]);

  const textColor =
    negativeColor && number < 0
      ? "#dc2626"
      : color;

  return (
    <Component
      className={className}
      style={{
        color: textColor,
        fontSize: size,
        fontWeight: weight,
        textAlign: align,
        fontVariantNumeric:
          "tabular-nums",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {prefix}

      {formatted}

      {currency && ` ${currency}`}

      {suffix}
    </Component>
  );
}