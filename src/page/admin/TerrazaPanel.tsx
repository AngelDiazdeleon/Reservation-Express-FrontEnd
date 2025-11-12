import React from "react";
import "../css/AdminPanels.css";

const TerrazasPanel: React.FC = () => {
  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Gestión de Terrazas</h1>
          <p>Administra todas las terrazas registradas en la plataforma</p>
        </div>
        <div className="panel-actions">
          <button className="btn-primary">
            <span className="material-symbols-outlined">add</span>
            Agregar Terraza
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="filters-section">
          <div className="filter-group">
            <label>Filtrar por estado:</label>
            <select>
              <option value="all">Todas las terrazas</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
          <input 
            type="text" 
            placeholder="Buscar terraza..." 
            className="search-input"
          />
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Propietario</th>
                <th>Ubicación</th>
                <th>Capacidad</th>
                <th>Precio/Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Terraza del Sol</td>
                <td>Juan Pérez</td>
                <td>Zona Centro</td>
                <td>50 personas</td>
                <td>$60.00</td>
                <td><span className="status active">Activa</span></td>
                <td>
                  <button className="btn-icon" title="Editar">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="btn-icon" title="Desactivar">
                    <span className="material-symbols-outlined">toggle_off</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td>El Mirador</td>
                <td>María García</td>
                <td>Zona Norte</td>
                <td>30 personas</td>
                <td>$80.00</td>
                <td><span className="status active">Activa</span></td>
                <td>
                  <button className="btn-icon" title="Editar">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="btn-icon" title="Desactivar">
                    <span className="material-symbols-outlined">toggle_off</span>
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

export default TerrazasPanel;