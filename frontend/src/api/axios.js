import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: tambahkan Authorization: Bearer <token> di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: handle 401 → redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Jangan redirect jika error dari login endpoint
      const url = error.config?.url || '';
      if (!url.includes('/api/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
