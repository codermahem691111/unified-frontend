import { Navigate, Outlet } from 'react-router-dom';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { useAuth } from '../hooks/useAuth';

/** The login/register page is hidden from users who are already signed in. */
export function PublicOnlyRoute() {
  const { company, isInitializing } = useAuth();

  if (isInitializing) return <FullScreenLoader />;

  return company ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
