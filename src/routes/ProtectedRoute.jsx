import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/Loader';

// Generic guard: pass the role-specific `useAuth` hook and the login path to
// redirect to. Shows a loader while the initial /auth/.../refresh call is in
// flight so we don't flash a login screen for an already-valid session.
export default function ProtectedRoute({ useAuth, loginPath }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader />
      </div>
    );
  }
  if (!user) return <Navigate to={loginPath} state={{ from: location }} replace />;

  return <Outlet />;
}
