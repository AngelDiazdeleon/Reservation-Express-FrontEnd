import React from 'react';
import { useParams } from 'react-router-dom';
import '../css/AdminPanels.css';

const TerraceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Detalles de la Terraza</h1>
          <p>Información completa de la terraza #{id}</p>
        </div>
      </div>
      
      <div className="terrace-details">
        <div className="terrace-image">
          <div className="image-placeholder">
            <span className="material-symbols-outlined">photo</span>
            <p>Imagen de la terraza</p>
          </div>
        </div>
        
        <div className="terrace-info">
          <h2>Terraza Ejemplo</h2>
          <p className="terrace-description">
            Hermosa terraza con vista panorámica, capacidad para 50 personas, 
            ideal para eventos sociales y corporativos.
          </p>
          
          <div className="terrace-features">
            <div className="feature">
              <span className="material-symbols-outlined">group</span>
              <span>Capacidad: 50 personas</span>
            </div>
            <div className="feature">
              <span className="material-symbols-outlined">attach_money</span>
              <span>Precio: $1000 por hora</span>
            </div>
            <div className="feature">
              <span className="material-symbols-outlined">location_on</span>
              <span>Ubicación: Zona Centro</span>
            </div>
          </div>
          
          <button className="primary-button">
            <span className="material-symbols-outlined">book_online</span>
            Reservar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerraceDetails;