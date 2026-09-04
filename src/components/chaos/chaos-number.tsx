export function ChaosNumber({ value, tone = "default" }: { value: string; tone?: "default" | "positive" | "negative" | "primary" }) {
  const className = {
    default: "text-foreground",
    positive: "text-positive",
    negative: "text-negative",
    primary: "text-primary",
  }[tone];

  return <span className={`cm-number cm-number--${tone} font-mono tabular ${className}`}>{value}</span>;
}
