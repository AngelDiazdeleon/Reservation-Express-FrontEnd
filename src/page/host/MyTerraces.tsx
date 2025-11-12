import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import '../css/MyTerraces.css';

interface Terrace {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  price: number;
  status: string;
  contactPhone?: string;
  contactEmail?: string;
  amenities?: string[];
  images?: any[];
}

interface PublicationRequest {
  _id: string;
  terraceData: {
    name: string;
    location: string;
    capacity: number;
    price: number;
  };
  status: string;
  photos: any[];
  documents: any[];
  userNotes?: string;
  adminNotes?: string;
  reviewedBy?: any;
  reviewedAt?: string;
  createdAt: string;
}

const MyTerraces: React.FC = () => {
  const [terraces, setTerraces] = useState<Terrace[]>([]);
  const [requests, setRequests] = useState<PublicationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const terracesRes = await axios.get('/terraces/my/terraces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const requestsRes = await axios.get('/publication-requests/my/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTerraces(terracesRes.data.data || []);
      setRequests(requestsRes.data.data || []);
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      setError('Error cargando datos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string; icon: string } } = {
      draft: { color: '#6c757d', text: 'Borrador', icon: '📝' },
      pending: { color: '#ffc107', text: 'Pendiente', icon: '⏳' },
      published: { color: '#28a745', text: 'Publicada', icon: '✅' },
      rejected: { color: '#dc3545', text: 'Rechazada', icon: '❌' },
      approved: { color: '#28a745', text: 'Aprobada', icon: '✅' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`status-badge status-${status}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const handleNewRequest = () => {
    navigate('/publish-terrace');
  };

  if (loading) return (
    <div className="myterraces-loading">
      <div className="loading-spinner"></div>
      <p>Cargando mis terrazas...</p>
    </div>
  );

  return (
    <div className="my-terraces-container">
      <div className="my-terraces-header">
        <h1>Mis Terrazas y Solicitudes</h1>
        <button onClick={handleNewRequest} className="new-request-btn">
          ➕ Nueva Solicitud
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <section className="terraces-section">
        <h2 className="section-title">🏠 Mis Terrazas Publicadas ({terraces.length})</h2>
        {terraces.length === 0 ? (
          <div className="empty-state">
            <p>No tienes terrazas publicadas aún</p>
            <p className="empty-subtitle">Envía una solicitud de publicación para comenzar</p>
          </div>
        ) : (
          <div className="terraces-grid">
            {terraces.map(terrace => (
              <div key={terrace._id} className="terrace-card">
                <div className="card-header">
                  <h3>{terrace.name}</h3>
                  {getStatusBadge(terrace.status)}
                </div>
                
                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-label">📍 Ubicación:</span>
                    <span>{terrace.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">👥 Capacidad:</span>
                    <span>{terrace.capacity} personas</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">💰 Precio:</span>
                    <span>${terrace.price}/hora</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📞 Contacto:</span>
                    <span>{terrace.contactPhone || 'No especificado'}</span>
                  </div>
                </div>

                {terrace.amenities && terrace.amenities.length > 0 && (
                  <div className="amenities-section">
                    <strong>🏆 Comodidades:</strong>
                    <div className="amenities-list">
                      {terrace.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card-actions">
                  <button className="action-btn edit-btn">✏️ Editar</button>
                  <button className="action-btn reservations-btn">📅 Reservas</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="requests-section">
        <h2 className="section-title">📋 Mis Solicitudes de Publicación ({requests.length})</h2>
        {requests.length === 0 ? (
          <div className="empty-state">
            <p>No tienes solicitudes de publicación</p>
            <button onClick={handleNewRequest} className="create-first-btn">
              Crear Primera Solicitud
            </button>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map(request => (
              <div key={request._id} className={`request-card status-${request.status}`}>
                <div className="request-header">
                  <h3>{request.terraceData.name}</h3>
                  {getStatusBadge(request.status)}
                </div>
                
                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">📅 Fecha envío:</span>
                    <span>{new Date(request.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📍 Ubicación:</span>
                    <span>{request.terraceData.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">👥 Capacidad:</span>
                    <span>{request.terraceData.capacity} personas</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">💰 Precio:</span>
                    <span>${request.terraceData.price}/hora</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📸 Fotos:</span>
                    <span>{request.photos?.length || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📄 Documentos:</span>
                    <span>{request.documents?.length || 0}</span>
                  </div>
                </div>

                {request.userNotes && (
                  <div className="user-notes">
                    <strong>💬 Mis notas:</strong>
                    <p>{request.userNotes}</p>
                  </div>
                )}

                {request.adminNotes && (
                  <div className="admin-notes">
                    <strong>💼 Comentarios del administrador:</strong>
                    <p>{request.adminNotes}</p>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="request-actions">
                    <button className="action-btn correct-btn">
                      ✏️ Corregir y Reenviar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyTerraces;