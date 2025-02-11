// src/utils/api.js

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };
  
  export const api = {
    get: async (url) => {
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }
      return response.json();
    },
  
    post: async (url, data) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }
      return response.json();
    },
  
    put: async (url, data) => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }
      return response.json();
    },
  
    delete: async (url) => {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }
      return response;
    }
  };