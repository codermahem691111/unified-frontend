import type { FinanceTotals } from '../../types/finance';
import { formatMoney } from '../../utils/format';

interface ExpenseBreakdownProps {
  totals: FinanceTotals;
}

/** Where the money went: the three expense categories as a share of all expenses. */
export function ExpenseBreakdown({ totals }: ExpenseBreakdownProps) {
  const rows = [
    { label: 'Staff salary', amount: totals.staffSalary },
    { label: 'Product buying', amount: totals.productPurchase },
    { label: 'Store maintenance', amount: totals.storeMaintenance },
  ];

  if (totals.expense <= 0) {
    return <p className="muted">No expenses recorded in this period.</p>;
  }

  return (
    <ul className="breakdown">
      {rows.map((row) => {
        const share = (row.amount / totals.expense) * 100;
        return (
          <li key={row.label} className="breakdown__row">
            <div className="breakdown__top">
              <span>{row.label}</span>
              <span>
                <strong>{formatMoney(row.amount)}</strong> <span className="muted">· {Math.round(share)}%</span>
              </span>
            </div>
            <div className="breakdown__track" role="presentation">
              <div className="breakdown__bar" style={{ width: `${Math.max(share, row.amount > 0 ? 1.5 : 0)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
