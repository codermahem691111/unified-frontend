/** Change this to your product name; it is shown on the sign-in screens and the sidebar. */
export const APP_NAME = 'ERP Platform';

/** ISO currency code used to display money, e.g. 'BDT', 'USD', 'EUR'. */
export const CURRENCY_CODE = 'BDT';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://uniflow-backend-5wtc.onrender.com/api';
