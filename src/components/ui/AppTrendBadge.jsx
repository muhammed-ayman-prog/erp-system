import {
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

import AppBadge from "./AppBadge";

export default function AppTrendBadge({
  value = 0,
  suffix = "%",
}) {
  const number = Number(value) || 0;

  let color = "secondary";
  let Icon = Minus;
  let text = `0${suffix}`;

  if (number > 0) {
    color = "success";
    Icon = TrendingUp;
    text = `+${number}${suffix}`;
  }

  if (number < 0) {
    color = "danger";
    Icon = TrendingDown;
    text = `${number}${suffix}`;
  }

  return (
    <AppBadge
      color={color}
      icon={<Icon size={14} />}
    >
      {text}
    </AppBadge>
  );
}