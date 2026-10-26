import { ReactNode, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import PrivateRoutes from './routes/PrivateRoutes';
import Layout from './components/Layout';
import AuthLoading from './components/AuthLoading';
import { logDebug } from './utils/logger';

// Pages are code-split and loaded on first visit (the login page stays in the main bundle)
const LogoutPage = lazy(() => import('./pages/LogoutPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ItemsPage = lazy(() => import('./pages/ItemsPage'));
const LocationsPage = lazy(() => import('./pages/LocationsPage'));
const TransfersPage = lazy(() => import('./pages/TransfersPage'));
const ManageLayout = lazy(() => import('./components/admin/ManageLayout'));
const LogsPage = lazy(() => import('./pages/admin/LogsPage'));
const SystemPage = lazy(() => import('./pages/admin/SystemPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SetupPage = lazy(() => import('./pages/admin/SetupPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RequireRole({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { isAdmin, isManager, loading } = useAuth();
  // Wait for /auth/me before deciding, otherwise a refresh flashes "no permission"
  if (loading) return <AuthLoading />;
  const allowed = adminOnly ? isAdmin : isAdmin || isManager;
  return allowed ? children : <div>You do not have permission to view this page.</div>;
}

function RedirectToCorrectPage() {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <AuthLoading />;
  logDebug('RedirectToCorrectPage -> isLoggedIn', isLoggedIn);
  return isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<AuthLoading />}>
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route index element={<RedirectToCorrectPage />} />

          <Route element={<PrivateRoutes />}>
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="transfers" element={<TransfersPage />} />
            </Route>

            <Route
              path="/manage"
              element={
                <RequireRole>
                  <ManageLayout />
                </RequireRole>
              }
            >
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route
                path="system"
                element={
                  <RequireRole adminOnly>
                    <SystemPage />
                  </RequireRole>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;

