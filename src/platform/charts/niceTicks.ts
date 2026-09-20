/** A handful of round numbers from zero up to the top of a scale. */
export function niceTicks(top: number): number[] {
  if (top <= 0) return [0];
  const step = 10 ** Math.floor(Math.log10(top));
  const unit = top / step >= 5 ? step : top / step >= 2 ? step / 2 : step / 5;
  const ticks: number[] = [];
  for (let tick = 0; tick <= top; tick += unit) ticks.push(Math.round(tick * 100) / 100);
  return ticks;
}
