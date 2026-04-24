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

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('user');
      if (saved) setUser(JSON.parse(saved));
    }
    
    if (user) {
      socket.connect();
      socket.emit('join', { client_id: user.id });
    }
    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    socket.disconnect();
  };

  // Rendu des routes protégées
  const renderProtectedRoutes = () => {
    if (!user) return <Navigate to="/login" replace />;

    return (
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/clients/:id" element={<AdminClientDetails />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/statistics" element={<AdminStatistics />} />
          <Route path="/admin/logs" element={<AdminLogs />} />

          {/* Client */}
          <Route path="/client" element={<ClientHome />} />
          <Route path="/client/history" element={<ClientHistory />} />
          
          {/* Shared */}
          <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    );
  };

  const token = localStorage.getItem('token');
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-indigo-600 uppercase tracking-widest text-xs">Chargement Otizi...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<ProtectedRoute>{renderProtectedRoutes()}</ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
