import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import '../css/hostcss/MyTerrace.css';

interface TerrazaDetails {
  _id: string;
  terraceData: {
    name: string;
    description: string;
    capacity: number;
    location: string;
    price: number;
    contactPhone: string;
    contactEmail: string;
    amenities: string[];
    rules: string;
  };
  photos: Array<{
    filename: string;
    originalName: string;
  }>;
  status: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
}

const TerrazaDetalles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [terraza, setTerraza] = useState<TerrazaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    loadTerrazaDetails();
  }, [id]);

  const loadTerrazaDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/publication-requests/${id}`);
      
      if (response.data.success) {
        setTerraza(response.data.data);
      } else {
        alert('Error cargando detalles: ' + response.data.message);
        navigate('/host/MyTerraces');
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
      alert('Error al cargar los detalles de la terraza');
      navigate('/host/MyTerraces');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filename: string) => {
    return `http://localhost:4000/api/terrace-images/${filename}`;
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'approved':
        return { text: 'Publicada', class: 'estado-publicada' };
      case 'pending':
        return { text: 'En revisión', class: 'estado-revision' };
      case 'rejected':
        return { text: 'Rechazada', class: 'estado-borrador' };
      default:
        return { text: 'Desconocido', class: 'estado-desconocido' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando detalles...</p>
      </div>
    );
  }

  if (!terraza) {
    return (
      <div className="error-container">
        <h2>Terraza no encontrada</h2>
        <button onClick={() => navigate('/host/MyTerraces')}>
          Volver a mis terrazas
        </button>
      </div>
    );
  }

  const estadoBadge = getEstadoBadge(terraza.status);

  return (
    <div className="terraza-details-container">
      <div className="details-header">
        <button onClick={() => navigate('/host/MyTerraces')} className="back-button">
          ← Volver
        </button>
        <h1>{terraza.terraceData.name}</h1>
        <span className={`estado-badge-details ${estadoBadge.class}`}>
          {estadoBadge.text}
        </span>
      </div>

      {/* Galería de imágenes */}
      <div className="image-gallery">
        <div className="main-image">
          <img
            src={getImageUrl(terraza.photos[activeImage]?.filename)}
            alt={`${terraza.terraceData.name} - Imagen ${activeImage + 1}`}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1000&q=80';
            }}
          />
        </div>
        
        {terraza.photos.length > 1 && (
          <div className="thumbnail-container">
            {terraza.photos.map((photo, index) => (
              <div
                key={index}
                className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={getImageUrl(photo.filename)}
                  alt={`Miniatura ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información principal */}
      <div className="details-content">
        <div className="details-grid">
          <div className="details-section">
            <h2>Descripción</h2>
            <p>{terraza.terraceData.description}</p>
          </div>

          <div className="details-section">
            <h2>Información General</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Ubicación:</span>
                <span className="info-value">{terraza.terraceData.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Capacidad:</span>
                <span className="info-value">{terraza.terraceData.capacity} personas</span>
              </div>
              <div className="info-item">
                <span className="info-label">Precio por hora:</span>
                <span className="info-value">${terraza.terraceData.price}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contacto:</span>
                <span className="info-value">{terraza.terraceData.contactPhone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{terraza.terraceData.contactEmail}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Fecha de creación:</span>
                <span className="info-value">{formatDate(terraza.createdAt)}</span>
              </div>
            </div>
          </div>

          {terraza.terraceData.amenities.length > 0 && (
            <div className="details-section">
              <h2>Comodidades</h2>
              <div className="amenities-list">
                {terraza.terraceData.amenities.map((amenity, index) => (
                  <span key={index} className="amenity-tag-details">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {terraza.terraceData.rules && (
            <div className="details-section">
              <h2>Reglas</h2>
              <p>{terraza.terraceData.rules}</p>
            </div>
          )}

          {terraza.status !== 'pending' && terraza.adminNotes && (
            <div className="details-section admin-notes">
              <h2>Notas del Administrador</h2>
              <div className="notes-content">
                <p>{terraza.adminNotes}</p>
                {terraza.reviewedAt && (
                  <p className="review-date">
                    Revisado el: {formatDate(terraza.reviewedAt)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="details-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate('/host/MyTerraces')}
          >
            ← Volver a mis terrazas
          </button>

          <button
            className="btn-danger"
            onClick={() => {
              if (window.confirm('¿Estás seguro de eliminar esta terraza?')) {
                // Llamar a la API para eliminar
                api.delete(`/publication-requests/${terraza._id}`)
                  .then(() => {
                    alert('Terraza eliminada exitosamente');
                    navigate('/host/MyTerraces');
                  })
                  .catch(error => {
                    alert('Error al eliminar: ' + (error.response?.data?.message || error.message));
                  });
              }
            }}
          >
            <span className="material-symbols-outlined">delete</span>
            Eliminar Terraza
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerrazaDetalles;