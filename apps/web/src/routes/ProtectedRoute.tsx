import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';
import { Spinner } from '../components/ui/Spinner';
import { paths } from './paths';

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.auth.signIn} state={{ from: location }} replace />;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to={paths.dashboard.home} replace />;
  }

  return <Outlet />;
}
