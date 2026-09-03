import { formatNumber } from "./format-number";

export function formatPrice(value: number) {
  return formatNumber(value, 2);
}

export function formatPercent(value: number) {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${formatNumber(value, 2)}%`;
}
