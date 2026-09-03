export function calculateVolumeChange(volumes: number[]): number | null {
  if (volumes.length < 20) {
    return null;
  }

  const recent = average(volumes.slice(-10));
  const previous = average(volumes.slice(-20, -10));

  if (previous === 0) {
    return null;
  }

  return ((recent - previous) / previous) * 100;
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
