import React from "react";
import "../css/AdminPanels.css";

const ReportesPanel: React.FC = () => {
  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Reportes y Analytics</h1>
          <p>Reportes detallados y análisis de la plataforma</p>
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
          <div className="stat-value">$45,670.00</div>
          <div className="stat-label">Ingresos Totales</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">1,280</div>
          <div className="stat-label">Usuarios Registrados</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">347</div>
          <div className="stat-label">Reservas Totales</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">89%</div>
          <div className="stat-label">Tasa de Ocupación</div>
        </div>
      </div>
      
      <div className="reports-grid">
        <div className="report-card">
          <h3>Reservas por Mes</h3>
          <div className="report-placeholder">
            <span className="material-symbols-outlined">bar_chart</span>
            <p>Gráfico de reservas mensuales</p>
          </div>
        </div>
        
        <div className="report-card">
          <h3>Terrazas Populares</h3>
          <div className="report-placeholder">
            <span className="material-symbols-outlined">pie_chart</span>
            <p>Distribución de reservas por terraza</p>
          </div>
        </div>
        
        <div className="report-card">
          <h3>Ingresos</h3>
          <div className="report-placeholder">
            <span className="material-symbols-outlined">trending_up</span>
            <p>Evolución de ingresos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesPanel;