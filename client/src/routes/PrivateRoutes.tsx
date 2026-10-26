import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLoading from '../components/AuthLoading';

const PrivateRoutes = () => {
  const { isLoggedIn, loading } = useAuth();
  // A stored token is only trusted once /auth/me has confirmed it
  if (loading) return <AuthLoading />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default PrivateRoutes;
