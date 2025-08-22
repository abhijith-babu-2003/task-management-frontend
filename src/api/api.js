import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL+'/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to login" };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/users/register", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to register" };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/users/current");
    return response.data
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch user data" };
  }
};