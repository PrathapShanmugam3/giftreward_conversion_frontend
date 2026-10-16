import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Generic guard: pass the role-specific `useAuth` hook and the login path to
// redirect to. Shows nothing while the initial /auth/.../refresh call is
// in flight so we don't flash a login screen for an already-valid session.
export default function ProtectedRoute({ useAuth, loginPath }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to={loginPath} state={{ from: location }} replace />;

  return <Outlet />;
}
