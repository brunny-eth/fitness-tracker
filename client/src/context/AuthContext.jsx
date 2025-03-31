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

  // Simplified to just email and password
  const register = async (email, password) => {
    try {
      const response = await api.post('/api/auth/register', {
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
      
      setTimeout(async () => {
        try {
          const userProfile = await api.get('/api/auth/me');
          localStorage.setItem('user', JSON.stringify(userProfile));
          setUser(userProfile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }, 500);
      
      // Return a basic user object to prevent UI issues
      return { email };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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