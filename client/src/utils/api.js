// src/utils/api.js

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };
  
  const handleResponse = async (response) => {
    if (response.status === 401) {
      // Clear auth data and reload to trigger login redirect
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
    get: async (url) => {
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    },
  
    post: async (url, data) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
  
    put: async (url, data) => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
  
    delete: async (url) => {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    }
  };