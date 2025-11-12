import React from 'react';
import '../css/AdminPanels.css';

const Profile: React.FC = () => {
  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal y preferencias</p>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="profile-info">
              <h2>Usuario Cliente</h2>
              <p>cliente@ejemplo.com</p>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-item">
              <label>Nombre completo</label>
              <p>Usuario Ejemplo</p>
            </div>
            <div className="detail-item">
              <label>Teléfono</label>
              <p>+1234567890</p>
            </div>
            <div className="detail-item">
              <label>Fecha de registro</label>
              <p>15 Enero 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;