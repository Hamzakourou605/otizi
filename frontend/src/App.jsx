import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import socket from './services/socket';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminClients from './pages/AdminClients';
import AdminClientDetails from './pages/AdminClientDetails';
import AdminTransactions from './pages/AdminTransactions';
import AdminStatistics from './pages/AdminStatistics';
import AdminLogs from './pages/AdminLogs';
import ClientHome from './pages/ClientHome';
import ClientHistory from './pages/ClientHistory';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, user }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('join', { client_id: user.id });
    }
    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    socket.disconnect();
  };

  const homeRoute = user?.role === 'admin' ? '/admin' : '/client';

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* ── Public ── */}
        <Route path="/login"    element={!user ? <Login setUser={setUser} /> : <Navigate to={homeRoute} replace />} />
        <Route path="/register" element={!user ? <Register />              : <Navigate to={homeRoute} replace />} />

        {/* ── Protected (inside Layout) ── */}
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/"        element={<Navigate to={homeRoute} replace />} />
                  
                  {/* ADMIN ROUTES */}
                  <Route path="/admin"              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/client" replace />} />
                  <Route path="/admin/clients"      element={user?.role === 'admin' ? <AdminClients /> : <Navigate to="/client" replace />} />
                  <Route path="/admin/clients/:id"  element={user?.role === 'admin' ? <AdminClientDetails /> : <Navigate to="/client" replace />} />
                  <Route path="/admin/transactions" element={user?.role === 'admin' ? <AdminTransactions /> : <Navigate to="/client" replace />} />
                  <Route path="/admin/statistics"   element={user?.role === 'admin' ? <AdminStatistics /> : <Navigate to="/client" replace />} />
                  <Route path="/admin/logs"         element={user?.role === 'admin' ? <AdminLogs /> : <Navigate to="/client" replace />} />

                  {/* CLIENT ROUTES */}
                  <Route path="/client"         element={<ClientHome />} />
                  <Route path="/client/history" element={<ClientHistory />} />
                  <Route path="/profile"        element={<Profile user={user} onLogout={handleLogout} />} />
                  <Route path="*"               element={<Navigate to={homeRoute} replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
