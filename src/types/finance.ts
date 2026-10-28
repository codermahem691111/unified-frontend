export type FinanceType = 'income' | 'expense';

export type FinanceCategory = 'product_sale' | 'staff_salary' | 'product_purchase' | 'store_maintenance';

export const FINANCE_CATEGORIES: ReadonlyArray<{ value: FinanceCategory; label: string; type: FinanceType }> = [
  { value: 'product_sale', label: 'Product sale', type: 'income' },
  { value: 'staff_salary', label: 'Staff salary', type: 'expense' },
  { value: 'product_purchase', label: 'Product buying', type: 'expense' },
  { value: 'store_maintenance', label: 'Store maintenance', type: 'expense' },
];

export const EXPENSE_CATEGORIES = FINANCE_CATEGORIES.filter((category) => category.type === 'expense');

export function categoryLabel(category: FinanceCategory): string {
  return FINANCE_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

export interface FinanceEntry {
  id: string;
  type: FinanceType;
  category: FinanceCategory;
  amount: number;
  /** YYYY-MM-DD */
  entryDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceEntryPayload {
  category: FinanceCategory;
  amount: number;
  entryDate: string;
  description: string | null;
}

export interface MonthlyFinance {
  /** YYYY-MM */
  month: string;
  income: number;
  expense: number;
  profit: number;
  staffSalary: number;
  productPurchase: number;
  storeMaintenance: number;
}

export interface FinanceTotals {
  income: number;
  expense: number;
  profit: number;
  staffSalary: number;
  productPurchase: number;
  storeMaintenance: number;
}

export interface FinanceSummary {
  months: MonthlyFinance[];
  totals: FinanceTotals;
}
