import axios from 'axios';

// Configurar API base
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🔗 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:4000/api');

// Función para setear token de autenticación
export function setAuth(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}

// Setear el token inicial si existe
const savedToken = localStorage.getItem('token');
if (savedToken) {
  setAuth(savedToken);
}

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      console.log('🔒 Sesión expirada, redirigiendo a login...');
      localStorage.removeItem('token');
      setAuth(null);
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      console.log('🚫 Acceso denegado');
      alert('No tienes permisos para acceder a esta página');
      window.location.href = '/admin/dashboard';
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
    
    // Debug logging
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Exportar funciones específicas para publicaciones (admin)
export const publicationApi = {
  // Admin
  getPendingTerraces: () => api.get('/publication-requests/pending-terraces'),
  approveTerrace: (id: string, data: any) => api.patch(`/publication-requests/${id}/approve`, data),
  rejectTerrace: (id: string, data: any) => api.patch(`/publication-requests/${id}/reject`, data),
  getUserDocuments: (userId: string) => api.get(`/publication-requests/user-documents/${userId}`),
  
  // User
  createPublication: (data: any) => api.post('/publication-requests/create', data),
  getMyRequests: () => api.get('/publication-requests/my-requests'),
  
  // Public
  getApprovedTerraces: () => api.get('/publication-requests/approved'),
  getTerrazaById: (id: string) => api.get(`/publication-requests/terraza/${id}`),
  
  // Admin list
  getAllPublications: () => api.get('/publication-requests'),
  getPublicationById: (id: string) => api.get(`/publication-requests/${id}`),
};

// Exportar funciones específicas para documentos
export const documentApi = {
  downloadDocument: (documentId: string) => 
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/document-verification/download/${documentId}`, '_blank'),
  
  getDocumentUrl: (documentId: string) => 
    `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/document-verification/download/${documentId}`,
  
  viewDocument: (documentId: string) => 
    `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/document-verification/view/${documentId}`,
};

// Exportar funciones para imágenes de terrazas
export const imageApi = {
  getTerraceImageUrl: (filename: string) => 
    `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/terrace-images/${filename}`,
  
  getUploadUrl: (filename: string) => 
    `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/uploads/images/${filename}`,
};

// Exportar funciones específicas para reservas
export const reservationApi = {
  createReservation: (data: any) => api.post('/reservations/create', data),
  getMyReservations: () => api.get('/reservations/my-reservations'),
  cancelReservation: (id: string) => api.put(`/reservations/${id}/cancel`),
};

// Exportar funciones para usuario
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
};

export default api;