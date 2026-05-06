// src/store/authStore.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le token/user au démarrage
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItem('otizi_token');
      const storedUser = await storage.getItem('otizi_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error loading auth:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (tokenValue, userData) => {
    await storage.setItem('otizi_token', tokenValue);
    await storage.setItem('otizi_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = async () => {
    await storage.deleteItem('otizi_token');
    await storage.deleteItem('otizi_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
