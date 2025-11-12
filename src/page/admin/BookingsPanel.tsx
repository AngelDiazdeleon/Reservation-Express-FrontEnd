import React from "react";
import "../css/AdminPanels.css";

const BookingsPanel: React.FC = () => {
  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Gestión de Reservas</h1>
          <p>Administra y visualiza todas las reservas del sistema</p>
        </div>
        <div className="panel-actions">
          <button className="btn-primary">
            <span className="material-symbols-outlined">add</span>
            Nueva Reserva
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="filters-section">
          <div className="filter-group">
            <label>Filtrar por estado:</label>
            <select>
              <option value="all">Todas las reservas</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Fecha:</label>
            <input type="date" />
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Terrazas</th>
                <th>Fecha</th>
                <th>Horas</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#001</td>
                <td>María García</td>
                <td>Terraza del Sol</td>
                <td>2024-01-15</td>
                <td>14:00 - 16:00</td>
                <td>$120.00</td>
                <td><span className="status confirmed">Confirmada</span></td>
                <td>
                  <button className="btn-icon" title="Editar">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="btn-icon" title="Cancelar">
                    <span className="material-symbols-outlined">cancel</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td>#002</td>
                <td>Carlos López</td>
                <td>El Mirador</td>
                <td>2024-01-16</td>
                <td>18:00 - 20:00</td>
                <td>$200.00</td>
                <td><span className="status pending">Pendiente</span></td>
                <td>
                  <button className="btn-icon" title="Confirmar">
                    <span className="material-symbols-outlined">check</span>
                  </button>
                  <button className="btn-icon" title="Rechazar">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsPanel;