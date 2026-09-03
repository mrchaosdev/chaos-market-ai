export function calculateEMA(values: number[], period: number): number[] {
  if (period <= 0 || values.length === 0) {
    return [];
  }

  const multiplier = 2 / (period + 1);
  const ema: number[] = [values[0]];

  for (let index = 1; index < values.length; index += 1) {
    ema.push((values[index] - ema[index - 1]) * multiplier + ema[index - 1]);
  }

  return ema;
}
