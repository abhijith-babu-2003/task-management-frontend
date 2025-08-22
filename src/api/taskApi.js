// taskApi.js
import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';

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

export const taskApi = {
  // Create a new task in a column
  createTask: async ({ columnId, data }) => {
    if (!columnId) {
      throw new Error('Invalid columnId');
    }
    try {
      const response = await api.post(`/tasks/columns/${columnId}/tasks`, data);
      return response;
    } catch (error) {
      console.error('Error in createTask API call:', error);
      throw error;
    }
  },

 
  getTasksByColumn: async (columnId) => {
    try {
      const data = await api.get(`/tasks/columns/${columnId}/tasks`);
      return data.tasks;
    } catch (error) {
      throw error;
    }
  },

  
  updateTask: async (taskId, payload) => {
    try {
      const data = await api.put(`/tasks/tasks/${taskId}`, payload);
      return data.task;
    } catch (error) {
      throw error;
    }
  },


  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/tasks/${taskId}`);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },


  moveTask: async (taskId, payload) => {
    try {
      const data = await api.put(`/tasks/tasks/${taskId}/move`, payload);
      return data.task;
    } catch (error) {
      throw error;
    }
  },


  reorderTasks: async (columnId, taskIds) => {
    try {
      await api.put(`/tasks/columns/${columnId}/tasks/reorder`, { taskIds });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};