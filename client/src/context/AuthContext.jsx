// client/src/context/AuthContext.jsx
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
    
    if (token) {
      // Fetch current user data if token exists
      const fetchUser = async () => {
        try {
          const userData = await api.get('/api/auth/me');
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

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
      
      // Fetch user data after successful login
      const userData = await api.get('/api/auth/me');
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserData = (newData) => {
    setUser(newData);
    localStorage.setItem('user', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUserData, 
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};