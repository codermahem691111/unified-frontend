import { Navigate, Outlet } from 'react-router-dom';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { useAuth } from '../hooks/useAuth';

/** Only lets signed-in users through; everyone else is sent to the auth page. */
export function ProtectedRoute() {
  const { company, isInitializing } = useAuth();

  if (isInitializing) return <FullScreenLoader />;

  return company ? <Outlet /> : <Navigate to="/auth" replace />;
}
