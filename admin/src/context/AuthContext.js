import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchAdmin();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAdmin = async () => {
    try {
      const res = await axios.get('/auth/me');
      if (res.data.role !== 'admin') {
        throw new Error('Not admin');
      }
      setAdmin(res.data);
    } catch {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, adminKey) => {
    const res = await axios.post('/admin/login', { email, password, adminKey });
    localStorage.setItem('adminToken', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setAdmin(res.data.admin);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};