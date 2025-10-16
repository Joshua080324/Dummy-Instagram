import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://dariusjoshua.shop",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;
