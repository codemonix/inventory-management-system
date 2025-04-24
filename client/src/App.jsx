
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// import ItemsPage from './pages/ItemsPage.jsx';
// import TransfersPage from './pages/TransfersPage.jsx';
import LogoutPage from './pages/LogoutPage.jsx';
import Layout from './components/Layout.jsx';
import { getToken } from './utils/auth.js';
// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!getToken());

  return (
    <Router>
      <Routes>
        <Route path='/login'
          element={isLoggedIn ? <Navigate to="/dashboard"/> : <LoginPage />}
        />
        {/* potected routes */}
        <Route element={<Layout />}>
          <Route path='/dashboard' 
            element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />}
          />
{/*           
          <Route path='/items'
            element={isLoggedIn ? <ItemsPage /> : <Navigate to="/login" />}
          />
          <Route path='/transfers'
            element={isLoggedIn ? <TransfersPage /> : <Navigate to="/login" />}
          /> */}
          <Route path='/logout'
            element={isLoggedIn ? <LogoutPage /> : <Navigate to="/login" />}
          />
          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
          />
        </Route>
      </Routes>
    </Router>
  );
}


