import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('rbms_user');
    const storedToken = localStorage.getItem('rbms_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user data', err);
        localStorage.removeItem('rbms_user');
        localStorage.removeItem('rbms_token');
      }
    }
    setLoading(false);
  }, []);

  // Login action
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('rbms_token', token);
      localStorage.setItem('rbms_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Register action
  const registerUser = async (name, email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('rbms_token', token);
      localStorage.setItem('rbms_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Update profile action — syncs updated user into context + localStorage
  const updateProfile = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('rbms_user', JSON.stringify(merged));
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('rbms_token');
    localStorage.removeItem('rbms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register: registerUser, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
