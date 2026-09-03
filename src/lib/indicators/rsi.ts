export function calculateRSI(values: number[], period = 14): number | null {
  if (values.length <= period) {
    return null;
  }

  let averageGain = 0;
  let averageLoss = 0;

  for (let index = 1; index <= period; index += 1) {
    const delta = values[index] - values[index - 1];

    if (delta >= 0) {
      averageGain += delta;
    } else {
      averageLoss += Math.abs(delta);
    }
  }

  averageGain /= period;
  averageLoss /= period;

  for (let index = period + 1; index < values.length; index += 1) {
    const delta = values[index] - values[index - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;

    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;
  }

  if (averageLoss === 0) {
    return averageGain === 0 ? 50 : 100;
  }

  return 100 - 100 / (1 + averageGain / averageLoss);
}
