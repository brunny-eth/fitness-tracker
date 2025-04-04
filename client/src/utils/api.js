// src/utils/api.js
const BASE_URL = 'https://api.fitness-tracker.me';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};
  
const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
    
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
    
  if (response.status === 204) {
    return null;
  }
    
  return response.json();
};
  
export const api = {
  get: async (endpoint) => {
    // Use BASE_URL here
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  post: async (endpoint, data) => {
    try {
      console.log(`Making POST request to ${BASE_URL}${endpoint}`, data);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      return result;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  },
  
  put: async (endpoint, data) => {
    // Use BASE_URL here
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  delete: async (endpoint) => {
    // Use BASE_URL here
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};