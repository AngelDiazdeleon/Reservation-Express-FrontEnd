// api.tsx
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

console.log('🔗 API URL:', import.meta.env.VITE_API_URL);

export function setAuth(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Setear el token inicial si existe
setAuth(localStorage.getItem('token'));

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      setAuth(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interceptor para agregar el token automáticamente a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Exportar funciones específicas para reservas
export const reservationApi = {
  createReservation: (data: any) => api.post('/reservations/create', data),
  getMyReservations: () => api.get('/reservations/my-reservations'),
  cancelReservation: (id: string) => api.put(`/reservations/${id}/cancel`),
};

export default api;