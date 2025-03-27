// File: client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Updated to handle name and email for registration
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password
      });
      
      localStorage.setItem('token', response.token);
      
      // Fetch user profile after registration
      const userProfile = await api.get('/api/auth/me');
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      
      return userProfile;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.token);
      
      // Fetch user profile after login
      const userProfile = await api.get('/api/auth/me');
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      
      return userProfile;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};