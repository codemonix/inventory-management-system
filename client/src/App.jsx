
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LogoutPage from './pages/LogoutPage.jsx';
import DashboardPage from './pages/DashboardPage';
import PrivateRoutes from './routes/PrivateRoutes.jsx';

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RedirectToCorrectPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={
            <PrivateRoutes>
              <LogoutPage />
            </PrivateRoutes>
          } />
          <Route
            path="/dashboard"
            element={
              <PrivateRoutes>
                <DashboardPage />
              </PrivateRoutes>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function RedirectToCorrectPage() {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}

export default App;


