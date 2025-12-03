// api.tsx
import axios from 'axios';
import {
  queue, putReservationLocal, removeReservationLocal,
  getReservationLocal, getAllReservationsLocal,
  setMapping, getMapping, getOutbox, generateLocalId
} from '../src/offline/db';

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

// Función para verificar conexión
const isOnline = () => {
  return navigator.onLine;
};

// Exportar funciones específicas para reservas CON soporte offline
export const reservationApi = {
  // Crear reserva con soporte offline
  // En api.tsx, mejora la función createReservation con más logs:
createReservation: async (data: any) => {
  const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}').id;
  const isOnline = navigator.onLine;
  
  console.log('🎯 Creando reserva...');
  console.log('📱 Usuario ID:', userId);
  console.log('📶 Conexión:', isOnline ? 'Online' : 'Offline');
  console.log('📋 Datos recibidos:', data);
  
  if (!isOnline) {
    const clienteId = generateLocalId();
    
    console.log('📴 Modo offline activado');
    console.log('🔑 ID local generado:', clienteId);
    
    // Crear objeto de reserva local
    const localReservation = {
      ...data,
      _id: clienteId,
      clienteId: userId,
      estado: 'pendiente',
      pending: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('💾 Preparando reserva local:', localReservation);
    
    try {
      // Guardar localmente
      console.log('💾 Guardando en IndexedDB...');
      await putReservationLocal(localReservation);
      console.log('✅ Guardado en IndexedDB');
      
      // Agregar a la cola de sincronización
      console.log('📬 Agregando al outbox...');
      await queue({
        id: 'create_' + clienteId,
        op: 'create',
        clienteId: clienteId,
        data: localReservation,
        ts: Date.now()
      });
      console.log('✅ Agregado al outbox');
      
      // Verificar que se guardó
      const { getOutbox, getAllReservationsLocal } = await import('./offline/db');
      const outbox = await getOutbox();
      const allReservations = await getAllReservationsLocal();
      
      console.log('📊 Estado después de guardar:');
      console.log('   - Outbox tiene', outbox.length, 'operaciones');
      console.log('   - Total de reservas locales:', allReservations.length);
      
      console.log('✅ Reserva guardada localmente (offline):', localReservation);
      
      return { 
        data: { 
          success: true, 
          offline: true,
          data: localReservation,
          message: data.esVisita 
            ? '✅ Solicitud de visita guardada localmente. Se sincronizará cuando haya conexión.' 
            : '✅ Reserva guardada localmente. Se sincronizará cuando haya conexión.'
        } 
      };
    } catch (error) {
      console.error('❌ Error guardando localmente:', error);
      throw error;
    }
  }
  
  // Si hay conexión, enviar al servidor
  console.log('🌐 Modo online, enviando al servidor...');
  return api.post('/reservations/create', data);
},

  // Obtener reservas con soporte offline
  getMyReservations: async () => {
    const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}').id;
    
    if (!isOnline()) {
      console.log('📱 Modo offline - cargando desde almacenamiento local');
      const localReservations = await getAllReservationsLocal();
      
      // Filtrar solo las reservas del usuario actual
      const userReservations = localReservations.filter(r => r.clienteId === userId);
      
      console.log(`✅ ${userReservations.length} reservas cargadas localmente`);
      
      return { 
        data: { 
          success: true, 
          offline: true,
          data: userReservations,
          message: 'Datos cargados desde almacenamiento local'
        } 
      };
    }
    
    // Si hay conexión, obtener del servidor
    return api.get('/reservations/my-reservations');
  },

  // Cancelar reserva con soporte offline
  cancelReservation: async (id: string) => {
    if (!isOnline()) {
      // Es una reserva local (offline)
      if (id.startsWith('local_')) {
        try {
          // Obtener la reserva local
          const reservation = await getReservationLocal(id);
          
          if (reservation) {
            // Actualizar estado localmente
            reservation.estado = 'cancelada';
            reservation.updatedAt = new Date().toISOString();
            reservation.pending = true; // Marcamos como pendiente para sincronización
            
            // Guardar cambios
            await putReservationLocal(reservation);
            
            // Agregar operación de actualización a la cola
            await queue({
              id: 'update_' + id,
              op: 'update',
              clienteId: id,
              data: { estado: 'cancelada' },
              ts: Date.now()
            });
            
            console.log('✅ Cancelación guardada localmente (offline):', id);
            
            return { 
              data: { 
                success: true, 
                offline: true,
                message: 'Cancelación guardada localmente. Se sincronizará cuando haya conexión.'
              } 
            };
          }
        } catch (error) {
          console.error('❌ Error cancelando reserva local:', error);
          throw error;
        }
      } else {
        // Es una reserva del servidor, verificar si tenemos mapeo
        const mapping = await getMapping(id);
        const serverId = mapping || id;
        
        // Agregar a la cola de sincronización
        await queue({
          id: 'delete_' + Date.now(),
          op: 'delete',
          serverId: serverId,
          clienteId: id,
          ts: Date.now()
        });
        
        // Actualizar localmente a cancelada
        const reservation = await getReservationLocal(id);
        if (reservation) {
          reservation.estado = 'cancelada';
          reservation.updatedAt = new Date().toISOString();
          reservation.pending = true;
          await putReservationLocal(reservation);
        }
        
        console.log('✅ Cancelación en cola para sincronización:', serverId);
        
        return { 
          data: { 
            success: true, 
            offline: true,
            message: 'Cancelación en cola para sincronización'
          } 
        };
      }
    }
    
    // Si hay conexión, cancelar en el servidor
    return api.put(`/reservations/${id}/cancel`);
  },

  // Nuevo método para sincronización masiva (backend)
  bulkSync: async (data: any) => {
  console.log('🚀 Enviando datos bulkSync al backend:', data);
  return api.post('/reservations/bulksync', data);
},

  // Método para forzar sincronización
  // En api.tsx, modifica la función syncOfflineData:
  syncOfflineData: async () => {
    try {
      // Importación dinámica correcta
      const syncModule = await import('../src/offline/sync');
      
      // Verifica que syncNow exista
      if (typeof syncModule.syncNow === 'function') {
        console.log('✅ Función syncNow encontrada, ejecutando...');
        return await syncModule.syncNow();
      } else {
        console.error('❌ syncNow no es una función:', syncModule);
        throw new Error('syncNow no está disponible');
      }
    } catch (error) {
      console.error('❌ Error importando sync module:', error);
      throw error;
    }
  },

  // Método para verificar estado offline
  getOfflineStatus: async () => {
    const pending = await getOutbox();
    const localReservations = await getAllReservationsLocal();
    const pendingReservations = localReservations.filter(r => r.pending === true);
    
    return {
      isOnline: isOnline(),
      pendingOperations: pending.length,
      pendingReservations: pendingReservations.length,
      totalLocalReservations: localReservations.length
    };
  }
};

<<<<<<< HEAD
// ------------------------------------------------------------
// Funciones específicas para host
export const hostApi = {
  // Obtener reservas para host
  getHostReservations: async () => {
    return api.get('/reservations/host/reservations');
  },

  // Aprobar reserva
  approveReservation: async (id: string) => {
    return api.put(`/reservations/${id}/approve`);
  },

  // Rechazar reserva
  rejectReservation: async (id: string) => {
    return api.put(`/reservations/${id}/reject`);
  },

  // Verificar conexión
  isOnline: () => {
    return navigator.onLine;
  }
};
=======
// Exportar funciones para usuario
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
};

>>>>>>> bef6e0b340d2dacfe854c794923df7388db5121a
export default api;