import React from 'react';
import '../css/AdminPanels.css';

const MyReservation: React.FC = () => {
  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Mis Reservas</h1>
          <p>Gestiona y revisa todas tus reservas activas</p>
        </div>
      </div>
      
      <div className="reservations-list">
        <div className="reservation-card">
          <div className="reservation-header">
            <h3>Terraza del Sol</h3>
            <span className="status-badge confirmed">Confirmada</span>
          </div>
          <div className="reservation-details">
            <div className="detail">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>15 Enero 2024 - 18:00 hrs</span>
            </div>
            <div className="detail">
              <span className="material-symbols-outlined">schedule</span>
              <span>4 horas</span>
            </div>
            <div className="detail">
              <span className="material-symbols-outlined">attach_money</span>
              <span>$4,000.00</span>
            </div>
          </div>
          <div className="reservation-actions">
            <button className="btn-secondary">Ver Detalles</button>
            <button className="btn-danger">Cancelar</button>
          </div>
        </div>
        
        <div className="reservation-card">
          <div className="reservation-header">
            <h3>El Mirador</h3>
            <span className="status-badge pending">Pendiente</span>
          </div>
          <div className="reservation-details">
            <div className="detail">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>20 Enero 2024 - 20:00 hrs</span>
            </div>
            <div className="detail">
              <span className="material-symbols-outlined">schedule</span>
              <span>3 horas</span>
            </div>
            <div className="detail">
              <span className="material-symbols-outlined">attach_money</span>
              <span>$3,000.00</span>
            </div>
          </div>
          <div className="reservation-actions">
            <button className="btn-secondary">Ver Detalles</button>
            <button className="btn-danger">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReservation;