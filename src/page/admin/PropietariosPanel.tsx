import React from "react";
import "../css/AdminPanels.css";

const PropietariosPanel: React.FC = () => {
  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Gestión de Propietarios</h1>
          <p>Administra los propietarios registrados en la plataforma</p>
        </div>
        <div className="panel-actions">
          <button className="btn-primary">
            <span className="material-symbols-outlined">add</span>
            Agregar Propietario
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="filters-section">
          <input 
            type="text" 
            placeholder="Buscar propietario..." 
            className="search-input"
          />
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Terrazas</th>
                <th>Fecha Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Juan Pérez</td>
                <td>juan@email.com</td>
                <td>+1 234 567 890</td>
                <td>2 terrazas</td>
                <td>2024-01-01</td>
                <td><span className="status active">Activo</span></td>
                <td>
                  <button className="btn-icon" title="Editar">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="btn-icon" title="Contactar">
                    <span className="material-symbols-outlined">mail</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td>María García</td>
                <td>maria@email.com</td>
                <td>+1 234 567 891</td>
                <td>1 terraza</td>
                <td>2024-01-05</td>
                <td><span className="status active">Activo</span></td>
                <td>
                  <button className="btn-icon" title="Editar">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="btn-icon" title="Contactar">
                    <span className="material-symbols-outlined">mail</span>
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

export default PropietariosPanel;