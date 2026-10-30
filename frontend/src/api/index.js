import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Menyematkan Bearer token otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inventory_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Penanganan error global & unauthorized (401)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('inventory_token');
      localStorage.removeItem('inventory_user');
      // Redirect ke login jika sesi habis dan bukan di halaman login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan pada jaringan server.';
    return Promise.reject(new Error(message));
  }
);

export default api;
