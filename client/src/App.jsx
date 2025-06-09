
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
import AdminLayout from './components/AdminLayout.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';
import LogsPage from './pages/admin/LogsPage.jsx';

function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/dashboard"  replace />;
}

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RedirectToCorrectPage />} />
          <Route path="/login" element={<LoginPage />} />
          { /* Protected Routes */ }
          <Route element={<PrivateRoutes />}>
            <Route path="/logout" element={<LogoutPage />} />
            <Route path='/' element={<Layout />}>
              <Route path='dashboard' element={<DashboardPage />} />
              <Route path='items' element={<ItemsPage />} />
              <Route path='locations' element={<LocationsPage />} />
              <Route path='transfers' element={<TransfersPage />} />
            </Route>
            <Route path='/admin/*' element={
              <RequireAdmin>
                 <AdminLayout />
              </RequireAdmin>
            } >
              <Route index element={<Navigate to="users" replace />} />
              <Route path='users' element={<UsersPage />} />
              <Route path='logs' element={<LogsPage />} />
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


