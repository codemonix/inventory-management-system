
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LogoutPage from './pages/LogoutPage.jsx';
import DashboardPage from './pages/DashboardPage';
import PrivateRoutes from './routes/PrivateRoutes.jsx';
import Layout from './components/Layout.jsx';
import ItemsPage from './pages/ItemsPage.jsx';
import LocationsPage from './pages/LocationsPage.jsx';
import TransfersPage from './pages/TranfersPage.jsx';
import ManageLayout from './components/admin/ManageLayout.jsx';
import LogsPage from './pages/admin/LogsPage.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SetupPage from './pages/admin/SetupPage.jsx';


function RequireAdmin({ children }) {
  const { isAdmin, isManager } = useAuth();
  const isAdminOrManager = isAdmin || isManager;
  return isAdminOrManager ? children : <div>You do not have permission to view this page.</div>;
}

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path='/setup' element={<SetupPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route index element={<RedirectToCorrectPage />} />
          { /* Protected Routes */ }
          <Route element={<PrivateRoutes />}>
            <Route path="/logout" element={<LogoutPage />} />
            <Route path='/' element={<Layout />}>
              <Route path='dashboard' element={<DashboardPage />} />
              <Route path='items' element={<ItemsPage />} />
              <Route path='locations' element={<LocationsPage />} />
              <Route path='transfers' element={<TransfersPage />} />
            </Route>
            <Route path='/manage' element={
              <RequireAdmin>
                 <ManageLayout />
              </RequireAdmin>
              }>
              <Route index element={<Navigate to="users" replace />} />
              <Route path='users' element={<UserManagementPage />} />
              <Route path='logs' element={<LogsPage />} />
              <Route path='settings' element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function RedirectToCorrectPage() {
  const { isLoggedIn } = useAuth();
  console.log("RedirectToCorrectPage -> isLoggedIn", isLoggedIn);
  return isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

export default App;


