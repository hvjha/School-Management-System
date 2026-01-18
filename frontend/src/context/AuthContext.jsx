import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load from localStorage on initial render
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const nav = useNavigate();

  // Whenever user changes, update localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (payload) => {
    try {
      const res = await api.post('/api/auth/login', payload);
      setUser(res.data.user);
      toast.success('Logged in');

      if (res.data.user.role === 'superadmin') nav('/admin');
      else if (res.data.user.role === 'trainer') nav('/trainer');
      else nav('/student');

      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (payload) => {
    try {
      const res = await api.post('/api/auth/register', payload);
      setUser(res.data.user);
      toast.success('Registered & logged in');
      nav('/student');
      return res;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Register failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      /* ignore */
    } finally {
      setUser(null);
      nav('/');
      toast.success('Logged out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
