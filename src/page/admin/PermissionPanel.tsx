import React, { useState } from "react";
import "../css/AdminPanels.css";

interface Solicitud {
  id: number;
  nombre: string;
  propietario: string;
  fecha: string;
  estado: string;
}

const PermissionPanel: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
    { id: 1, nombre: "Terraza del Sol", propietario: "Juan Pérez", fecha: "2024-01-10", estado: "pendiente" },
    { id: 2, nombre: "El Mirador", propietario: "María García", fecha: "2024-01-12", estado: "pendiente" },
    { id: 3, nombre: "Jardín Secreto", propietario: "Carlos López", fecha: "2024-01-08", estado: "pendiente" }
  ]);

  const aprobarSolicitud = (id: number) => {
    setSolicitudes(solicitudes.map(sol => 
      sol.id === id ? { ...sol, estado: "aprobada" } : sol
    ));
  };

  const rechazarSolicitud = (id: number) => {
    setSolicitudes(solicitudes.map(sol => 
      sol.id === id ? { ...sol, estado: "rechazada" } : sol
    ));
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title">
          <h1>Solicitudes de Permisos</h1>
          <p>Revisa y gestiona las solicitudes de nuevas terrazas</p>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de la Terraza</th>
                <th>Propietario</th>
                <th>Fecha de Solicitud</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>#{solicitud.id}</td>
                  <td>{solicitud.nombre}</td>
                  <td>{solicitud.propietario}</td>
                  <td>{solicitud.fecha}</td>
                  <td>
                    <span className={`status ${solicitud.estado}`}>
                      {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                    </span>
                  </td>
                  <td>
                    {solicitud.estado === "pendiente" && (
                      <>
                        <button 
                          className="btn-success" 
                          onClick={() => aprobarSolicitud(solicitud.id)}
                        >
                          Aprobar
                        </button>
                        <button 
                          className="btn-danger" 
                          onClick={() => rechazarSolicitud(solicitud.id)}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    <button className="btn-icon" title="Ver detalles">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionPanel;