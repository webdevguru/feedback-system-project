import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import EmployeeDashboard from './components/EmployeeDashboard';
import Layout from './components/Layout';
import Login from './components/Login';
import ManagerDashboard from './components/ManagerDashboard';
import RegisterManager from './components/RegisterManager';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  
  if (!user) {
    return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register-manager" element={<RegisterManager />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>;
  }
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={
          user.role === 'manager' ? 
            <Navigate to="/manager-dashboard" /> : 
            <Navigate to="/employee-dashboard" />
        } />
        <Route path="/manager-dashboard" element={
          <PrivateRoute>
            <ManagerDashboard />
          </PrivateRoute>
        } />
        <Route path="/employee-dashboard" element={
          <PrivateRoute>
            <EmployeeDashboard />
          </PrivateRoute>
        } />
        <Route path="/register-manager" element={<RegisterManager />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 