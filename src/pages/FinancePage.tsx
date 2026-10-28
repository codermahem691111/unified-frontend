import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/apiError';
import { financeApi } from '../api/financeApi';
import { Alert } from '../components/Alert';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { EntryForm } from '../components/finance/EntryForm';
import { ExpenseBreakdown } from '../components/finance/ExpenseBreakdown';
import { IncomeExpenseChart } from '../components/finance/IncomeExpenseChart';
import { StatCard } from '../components/finance/StatCard';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { SearchInput } from '../components/SearchInput';
import { usePagedList } from '../hooks/usePagedList';
import type { FinanceCategory, FinanceEntry, FinanceEntryPayload, FinanceSummary, FinanceType } from '../types/finance';
import { categoryLabel, FINANCE_CATEGORIES } from '../types/finance';
import { formatDate, formatMoney } from '../utils/format';

const PERIOD_OPTIONS = [3, 6, 12, 24];

type CategoryFilter = FinanceCategory | 'all';

interface EntryTarget {
  kind: FinanceType;
  entry: FinanceEntry | null;
}

export function FinancePage() {
  const [months, setMonths] = useState(12);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryReloads, setSummaryReloads] = useState(0);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [entryTarget, setEntryTarget] = useState<EntryTarget | null>(null);
  const [deleting, setDeleting] = useState<FinanceEntry | null>(null);

  const list = usePagedList<FinanceEntry, { category?: FinanceCategory }>({
    fetcher: (params) => financeApi.list(params),
    filters: { category: categoryFilter === 'all' ? undefined : categoryFilter },
  });

  useEffect(() => {
    let isCancelled = false;
    setIsSummaryLoading(true);

    financeApi
      .summary(months)
      .then((result) => {
        if (isCancelled) return;
        setSummary(result);
        setSummaryError(null);
      })
      .catch((caught: unknown) => {
        if (!isCancelled) setSummaryError(ApiError.from(caught).message);
      })
      .finally(() => {
        if (!isCancelled) setIsSummaryLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [months, summaryReloads]);

  /** After any change, both the numbers/graph and the list must be refreshed. */
  const reloadList = list.reload;
  const reloadAll = useCallback(() => {
    setSummaryReloads((count) => count + 1);
    reloadList();
  }, [reloadList]);

  const handleSubmit = async (payload: FinanceEntryPayload) => {
    if (entryTarget?.entry) {
      await financeApi.update(entryTarget.entry.id, payload);
    } else {
      await financeApi.create(payload);
    }
    setEntryTarget(null);
    reloadAll();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await financeApi.remove(deleting.id);
    reloadAll();
  };

  const totals = summary?.totals;
  const hasNoEntriesAtAll = !list.isLoading && list.total === 0 && !list.isSearching && categoryFilter === 'all';
  const periodLabel = `last ${months} months`;

  return (
    <>
      <PageHeader
        title="Finance"
        subtitle="Record what you earn and spend, and watch how your business grows."
        actions={
          <>
            <button type="button" className="btn btn--primary" onClick={() => setEntryTarget({ kind: 'income', entry: null })}>
              Add income
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setEntryTarget({ kind: 'expense', entry: null })}>
              Add expense
            </button>
          </>
        }
      />

      <section className="card card--padded" aria-busy={isSummaryLoading}>
        <div className="card__head">
          <h2 className="card__title">Overview</h2>
          <label className="inline-field">
            <span>Period</span>
            <select
              className="input input--compact"
              value={months}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setMonths(Number(event.target.value))}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Last {option} months
                </option>
              ))}
            </select>
          </label>
        </div>

        {summaryError && <Alert variant="error">{summaryError}</Alert>}

        {totals && summary && (
          <>
            <div className="stat-grid">
              <StatCard label="Income" value={formatMoney(totals.income)} note={`From product sales, ${periodLabel}`} />
              <StatCard label="Expenses" value={formatMoney(totals.expense)} note={`Salaries, buying and maintenance, ${periodLabel}`} />
              <StatCard
                label={totals.profit < 0 ? 'Loss' : 'Profit'}
                value={formatMoney(totals.profit)}
                note="Income minus expenses"
              />
            </div>

            <div className="finance-grid">
              <div>
                <h3 className="card__subtitle">Income, expenses and profit by month</h3>
                <IncomeExpenseChart months={summary.months} />
              </div>
              <div>
                <h3 className="card__subtitle">Where the money went</h3>
                <ExpenseBreakdown totals={totals} />
              </div>
            </div>
          </>
        )}

        {!summary && isSummaryLoading && <p className="muted">Loading figures…</p>}
      </section>

      <div className="toolbar">
        <h2 className="toolbar__title">Transactions</h2>
        <div className="toolbar__group">
          <select
            className="input input--compact"
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategoryFilter(event.target.value as CategoryFilter)}
          >
            <option value="all">All categories</option>
            {FINANCE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <SearchInput value={list.searchText} onChange={list.setSearchText} placeholder="Search descriptions" />
        </div>
      </div>

      {list.error && <Alert variant="error">{list.error}</Alert>}

      <section className="card">
        {hasNoEntriesAtAll ? (
          <EmptyState title="No transactions yet" message="Add your first income or expense to start the graph." />
        ) : list.items.length === 0 && !list.isLoading ? (
          <EmptyState title="Nothing found" message="No transaction matches your search or filter." />
        ) : (
          <div className={`table-wrap${list.isLoading ? ' table-wrap--loading' : ''}`}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="table__number">Amount</th>
                  <th className="table__actions-head">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((entry) => (
                  <tr key={entry.id}>
                    <td data-label="Date">{formatDate(entry.entryDate)}</td>
                    <td data-label="Category">
                      <span className={`badge badge--${entry.type}`}>{categoryLabel(entry.category)}</span>
                    </td>
                    <td data-label="Description" className="table__details">
                      {entry.description ?? <span className="table__muted">—</span>}
                    </td>
                    <td data-label="Amount" className="table__number">
                      {entry.type === 'income' ? '+' : '−'}
                      {formatMoney(entry.amount)}
                    </td>
                    <td className="table__actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setEntryTarget({ kind: entry.type, entry })}
                      >
                        Edit
                      </button>
                      <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setDeleting(entry)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          pageSize={list.pageSize}
          onPageChange={list.setPage}
        />
      </section>

      <Modal
        title={entryTarget?.entry ? 'Edit transaction' : entryTarget?.kind === 'income' ? 'Add income' : 'Add expense'}
        isOpen={entryTarget !== null}
        onClose={() => setEntryTarget(null)}
      >
        {entryTarget && (
          <EntryForm
            kind={entryTarget.kind}
            entry={entryTarget.entry}
            onSubmit={handleSubmit}
            onCancel={() => setEntryTarget(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete transaction"
        message={
          deleting
            ? `Delete this ${categoryLabel(deleting.category).toLowerCase()} entry of ${formatMoney(deleting.amount)}? This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
