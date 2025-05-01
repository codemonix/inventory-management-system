
import React from 'react';
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

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RedirectToCorrectPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoutes />}>
            <Route path="/logout" element={<LogoutPage />} />
            <Route path='/dashboard' element={<Layout />}>
              <Route index element={<DashboardPage />} />
            </Route>
            <Route path='/items' element={<Layout />}>
              <Route index element={<ItemsPage />} />
            </Route>
            <Route path='/locations' element={<Layout />}>
              <Route index element={<LocationsPage />} />
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


