import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthProvider } from './context/AuthProvider';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmailVerifiedPage } from './pages/EmailVerifiedPage';
import { FinancePage } from './pages/FinancePage';
import { PeoplePage } from './pages/PeoplePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          <Route path="/email-verified" element={<EmailVerifiedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/finance" element={<FinancePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
