import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import CreateSortUrl from '../pages/CreateSortUrl';
import Analytics from '../pages/Analytics';
import RegisterPage from '../pages/RegisterPage';
import Loginpage from '../pages/Loginpage';

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Mainroute = () => {
  const user = getStoredUser();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Loginpage />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />

      <Route
        path="/create"
        element={<ProtectedRoute><CreateSortUrl /></ProtectedRoute>}
      />

      <Route
        path="/analytics/:sortid"
        element={<ProtectedRoute><Analytics /></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

export default Mainroute