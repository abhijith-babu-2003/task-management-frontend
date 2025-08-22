// src/api/boardApi.js
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

export const boardsApi = {
  getBoards: async () => {
    try {
      return await api.get('/boards');
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  },

  getBoardById: async (boardId) => {
    try {
      return await api.get(`/boards/${boardId}`);
    } catch (error) {
      console.error(`Error fetching board ${boardId}:`, error);
      throw error;
    }
  },

  createBoard: async (boardData) => {
    try {
      return await api.post('/boards', boardData);
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  },

  updateBoard: async (boardId, boardData) => {
    try {
      return await api.put(`/boards/${boardId}`, boardData);
    } catch (error) {
      console.error(`Error updating board ${boardId}:`, error);
      throw error;
    }
  },

deleteBoard: async (boardId) => {
    try {
      return await api.delete(`/boards/${boardId}`);
    } catch (error) {
      console.error(`Error deleting board ${boardId}:`, error);
      throw error;
    }
  },

};