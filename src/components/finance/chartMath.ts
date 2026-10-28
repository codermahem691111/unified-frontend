/** Rounds a positive number up to 1, 2, 5 or 10 times a power of ten (a "nice" axis step). */
function niceStep(rough: number): number {
  if (!Number.isFinite(rough) || rough <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / magnitude;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * magnitude;
}

export interface AxisScale {
  bottom: number;
  top: number;
  ticks: number[];
}

/** Axis from at most `0` down to the lowest value and up to the highest, always including 0 as a tick. */
export function buildAxis(lowest: number, highest: number, targetTicks = 4): AxisScale {
  const min = Math.min(0, lowest);
  const max = Math.max(0, highest);
  const step = niceStep((max - min) / targetTicks);

  const bottom = Math.floor(min / step) * step;
  // When there is no data at all, show a few steps above zero so the empty chart still has a scale.
  const hasNothingAboveZero = max === 0;
  const top = hasNothingAboveZero ? (min === 0 ? step * targetTicks : 0) : Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let value = bottom; value <= top + step / 2; value += step) {
    ticks.push(Math.round(value * 100) / 100);
  }
  return { bottom, top, ticks };
}

/**
 * A column that grows up from `baseY`, with a 4px rounded top and a square bottom
 * (square where it sits on the baseline, rounded at the end that carries the value).
 */
export function columnPath(x: number, width: number, topY: number, baseY: number): string {
  const height = baseY - topY;
  const radius = Math.max(0, Math.min(4, width / 2, height));

  return [
    `M ${x} ${baseY}`,
    `V ${topY + radius}`,
    `Q ${x} ${topY} ${x + radius} ${topY}`,
    `H ${x + width - radius}`,
    `Q ${x + width} ${topY} ${x + width} ${topY + radius}`,
    `V ${baseY}`,
    'Z',
  ].join(' ');
}
