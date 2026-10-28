import { useState } from 'react';
import type { MonthlyFinance } from '../../types/finance';
import { formatCompact, formatMoney, formatMonth } from '../../utils/format';
import { buildAxis, columnPath } from './chartMath';

interface IncomeExpenseChartProps {
  months: MonthlyFinance[];
}

const WIDTH = 720;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 16, bottom: 46, left: 56 };
const MAX_BAR_WIDTH = 24;
const BAR_GAP = 2;

/**
 * Income and expenses as side-by-side columns for each month, with profit as a line.
 * Hover (or touch) a month for the exact figures; the same numbers are in the table below.
 */
export function IncomeExpenseChart({ months }: IncomeExpenseChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const values = months.flatMap((month) => [month.income, month.expense, month.profit]);
  const axis = buildAxis(Math.min(0, ...values), Math.max(0, ...values));
  const yOf = (value: number) => MARGIN.top + ((axis.top - value) / (axis.top - axis.bottom)) * innerHeight;
  const baseline = yOf(0);

  const bandWidth = innerWidth / Math.max(months.length, 1);
  const barWidth = Math.min(MAX_BAR_WIDTH, (bandWidth - 6 - BAR_GAP) / 2);
  const centerOf = (index: number) => MARGIN.left + bandWidth * index + bandWidth / 2;

  const profitPoints = months.map((month, index) => `${centerOf(index)},${yOf(month.profit)}`).join(' ');
  const active = activeIndex === null ? null : months[activeIndex];

  // Keep the tooltip inside the chart near the left and right edges.
  const tooltipLeft = activeIndex === null ? 0 : (centerOf(activeIndex) / WIDTH) * 100;
  const tooltipShift = activeIndex === null ? '-50%' : tooltipLeft < 20 ? '0%' : tooltipLeft > 80 ? '-100%' : '-50%';

  return (
    <div className="chart">
      <ul className="chart__legend" aria-label="Legend">
        <li>
          <span className="chart__swatch chart__swatch--income" aria-hidden="true" />
          Income
        </li>
        <li>
          <span className="chart__swatch chart__swatch--expense" aria-hidden="true" />
          Expenses
        </li>
        <li>
          <span className="chart__swatch chart__swatch--profit" aria-hidden="true" />
          Profit
        </li>
      </ul>

      <div className="chart__frame" onPointerLeave={() => setActiveIndex(null)}>
        <div className="chart__canvas">
        <svg
          className="chart__svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Monthly income, expenses and profit. The same figures are listed in the table below the chart."
        >
          {axis.ticks.map((tick) => (
            <g key={tick}>
              <line
                className={tick === 0 ? 'chart__baseline' : 'chart__grid'}
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={yOf(tick)}
                y2={yOf(tick)}
              />
              <text className="chart__axis-label" x={MARGIN.left - 8} y={yOf(tick)} textAnchor="end" dominantBaseline="middle">
                {formatCompact(tick)}
              </text>
            </g>
          ))}

          {months.map((month, index) => {
            const left = MARGIN.left + bandWidth * index;
            const center = centerOf(index);
            const showLabel = months.length <= 12 || index % 2 === 0;
            const showYear = index === 0 || month.month.endsWith('-01');

            return (
              <g key={month.month}>
                {activeIndex === index && (
                  <rect className="chart__band" x={left} y={MARGIN.top} width={bandWidth} height={innerHeight} />
                )}

                {month.income > 0 && (
                  <path
                    className="chart__bar chart__bar--income"
                    d={columnPath(center - BAR_GAP / 2 - barWidth, barWidth, yOf(month.income), baseline)}
                  />
                )}
                {month.expense > 0 && (
                  <path
                    className="chart__bar chart__bar--expense"
                    d={columnPath(center + BAR_GAP / 2, barWidth, yOf(month.expense), baseline)}
                  />
                )}

                {showLabel && (
                  <text className="chart__axis-label" x={center} y={HEIGHT - MARGIN.bottom + 18} textAnchor="middle">
                    {formatMonth(month.month, false)}
                    {showYear && (
                      <tspan x={center} dy={14}>
                        {month.month.slice(0, 4)}
                      </tspan>
                    )}
                  </text>
                )}
              </g>
            );
          })}

          {months.length > 1 && <polyline className="chart__line" points={profitPoints} />}
          {months.map((month, index) => (
            <circle key={month.month} className="chart__dot" cx={centerOf(index)} cy={yOf(month.profit)} r={4} />
          ))}

          {/* One wide invisible target per month, so hovering anywhere in the column works. */}
          {months.map((month, index) => (
            <rect
              key={`hit-${month.month}`}
              className="chart__hit"
              x={MARGIN.left + bandWidth * index}
              y={MARGIN.top}
              width={bandWidth}
              height={innerHeight}
              onPointerEnter={() => setActiveIndex(index)}
              onPointerDown={() => setActiveIndex(index)}
            />
          ))}
        </svg>

        {active && (
          <div
            className="chart__tooltip"
            role="status"
            style={{ left: `${tooltipLeft}%`, transform: `translateX(${tooltipShift})` }}
          >
            <p className="chart__tooltip-title">{formatMonth(active.month)}</p>
            <p className="chart__tooltip-row">
              <span className="chart__swatch chart__swatch--income" aria-hidden="true" />
              Income <strong>{formatMoney(active.income)}</strong>
            </p>
            <p className="chart__tooltip-row">
              <span className="chart__swatch chart__swatch--expense" aria-hidden="true" />
              Expenses <strong>{formatMoney(active.expense)}</strong>
            </p>
            <p className="chart__tooltip-row">
              <span className="chart__swatch chart__swatch--profit" aria-hidden="true" />
              Profit <strong>{formatMoney(active.profit)}</strong>
            </p>
          </div>
        )}
        </div>
      </div>

      <details className="chart__table">
        <summary>View the figures as a table</summary>
        <div className="table-wrap">
          <table className="table table--compact">
            <thead>
              <tr>
                <th>Month</th>
                <th className="table__number">Income</th>
                <th className="table__number">Expenses</th>
                <th className="table__number">Profit</th>
              </tr>
            </thead>
            <tbody>
              {[...months].reverse().map((month) => (
                <tr key={month.month}>
                  <td>{formatMonth(month.month)}</td>
                  <td className="table__number">{formatMoney(month.income)}</td>
                  <td className="table__number">{formatMoney(month.expense)}</td>
                  <td className="table__number">{formatMoney(month.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
