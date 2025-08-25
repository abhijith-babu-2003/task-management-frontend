
import axios from 'axios';


export const API_URL = import.meta.env.VITE_API_URL+'/api' 

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      console.error('Network Error:', error);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    const { status, data } = error.response;
    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Your session has expired. Please log in again.'));
    }
    const errorMessage = data?.message || `Request failed with status ${status}`;
    return Promise.reject(new Error(errorMessage));
  }
);

export const columnApi = {
  createColumn: async (boardId, payload) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const data = await api.post(`/columns/boards/${boardId}/columns`, payload);
      return data.column; 
    } catch (error) {
      throw error;
    }
  },

  updateColumn: async (columnId, payload) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const data = await api.put(`/columns/${columnId}`, payload);
      return data.column;
    } catch (error) {
      throw error;
    }
  },

  deleteColumn: async (columnId) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await api.delete(`/columns/${columnId}`);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};