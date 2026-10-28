# ERP frontend (React + TypeScript + Vite)

Plain CSS, axios for API calls. Works with the NestJS backend (`erp-backend`).

## Run
```bash
yarn install
cp .env.example .env     # VITE_API_URL=http://localhost:3000/api
yarn dev                 # http://localhost:5173
```
Start the backend first (see its README).

## Pages
| Route | What it does |
| --- | --- |
| `/auth` | Sign in / Register tabs. After registering it asks the owner to check their email. |
| `/email-verified` | Where the link in the verification email lands. |
| `/dashboard` | Overview: the three services and the company details. |
| `/people` | Customers, staff and suppliers: filter by type, search, add, edit, delete. |
| `/products` | Products with details, selling and buying price, margin and image: search, add, edit, delete. |
| `/finance` | Income and three expense types, totals, a monthly income/expense/profit graph, expense breakdown, and the list of transactions with add, edit, delete. |

Everything after sign-in sits behind `ProtectedRoute` inside `AppShell` (sidebar navigation).
You only ever see your own company's data: the API returns nothing else.

## Settings
`src/config/env.ts`: `APP_NAME` (product name shown on screen) and `CURRENCY_CODE` (for example `BDT`, `USD`).

## Structure
```
src/
├── api/         axios client (token + automatic refresh), one API class per service, ApiError
├── context/     AuthProvider / AuthContext
├── hooks/       useAuth, usePagedList (paging + search + filters), useDebouncedValue
├── components/  forms, Modal (native <dialog>), ConfirmDialog, Pagination, layout/, people/, products/, finance/ (chart is plain SVG, no chart library)
├── pages/       AuthPage, DashboardPage, PeoplePage, ProductsPage, FinancePage, EmailVerifiedPage
├── routes/      ProtectedRoute, PublicOnlyRoute
├── styles/      global.css, auth.css, dashboard.css, app.css, finance.css
├── types/       shared types
└── utils/       validation (mirrors the backend rules), money/date formatting
```
