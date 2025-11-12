import React from "react";
import "../css/AdminPanels.css";

const ComissionPanel: React.FC = () => {
  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Panel de Comisiones</h1>
          <p>Gestiona y visualiza las comisiones generadas</p>
        </div>
        <div className="panel-actions">
          <button className="btn-primary">
            <span className="material-symbols-outlined">download</span>
            Exportar Reporte
          </button>
        </div>
      </div>
      
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-value">$12,450.00</div>
          <div className="stat-label">Comisiones Totales</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">$3,250.00</div>
          <div className="stat-label">Este Mes</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">$850.00</div>
          <div className="stat-label">Pendientes</div>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Propietario</th>
                <th>Terrazas</th>
                <th>Total Reserva</th>
                <th>Comisión</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-01-10</td>
                <td>Juan Pérez</td>
                <td>Terraza del Sol</td>
                <td>$400.00</td>
                <td>$40.00</td>
                <td><span className="status paid">Pagada</span></td>
                <td>
                  <button className="btn-icon" title="Ver detalles">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td>2024-01-12</td>
                <td>Ana García</td>
                <td>El Mirador</td>
                <td>$600.00</td>
                <td>$60.00</td>
                <td><span className="status pending">Pendiente</span></td>
                <td>
                  <button className="btn-icon" title="Marcar como pagada">
                    <span className="material-symbols-outlined">payments</span>
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

export default ComissionPanel;