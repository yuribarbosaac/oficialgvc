import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardSkeleton } from './ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: string;
}

export function ProtectedRoute({ children, allowedRoles, requiredRole }: ProtectedRouteProps) {
  const { user, loading, userData } = useAuth();
  const location = useLocation();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location, message: 'Faça login para continuar' }} replace />;
  }

  const roles = allowedRoles || (requiredRole ? [requiredRole] : undefined);
  
  if (roles && userData && !roles.includes(userData.perfil)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;