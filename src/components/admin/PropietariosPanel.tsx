import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminPanels.css';

interface Propietario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaRegistro: string;
  estado: 'activo' | 'inactivo' | 'pendiente';
  terrazasCount: number;
  calificacionPromedio: number;
  totalGanado: number;
}

const PropietariosPanel: React.FC = () => {
  const navigate = useNavigate();
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: 'todos',
    search: ''
  });

  useEffect(() => {
    fetchPropietarios();
  }, []);

  const fetchPropietarios = async () => {
    try {
      const response = await fetch('/api/propietarios');
      if (!response.ok) throw new Error('Error fetching propietarios');
      const data = await response.json();
      setPropietarios(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching propietarios:', error);
      // Datos de ejemplo como fallback
      setTimeout(() => {
        setPropietarios([
          {
            id: '1',
            nombre: 'Juan Pérez',
            email: 'juan@email.com',
            telefono: '+1234567890',
            fechaRegistro: '2024-01-15',
            estado: 'activo',
            terrazasCount: 3,
            calificacionPromedio: 4.7,
            totalGanado: 12500
          },
          {
            id: '2',
            nombre: 'María García',
            email: 'maria@email.com',
            telefono: '+1234567891',
            fechaRegistro: '2024-01-10',
            estado: 'activo',
            terrazasCount: 2,
            calificacionPromedio: 4.9,
            totalGanado: 8900
          },
          {
            id: '3',
            nombre: 'Carlos López',
            email: 'carlos@email.com',
            telefono: '+1234567892',
            fechaRegistro: '2024-01-20',
            estado: 'pendiente',
            terrazasCount: 1,
            calificacionPromedio: 4.2,
            totalGanado: 0
          },
          {
            id: '4',
            nombre: 'Ana Martínez',
            email: 'ana@email.com',
            telefono: '+1234567893',
            fechaRegistro: '2023-12-15',
            estado: 'inactivo',
            terrazasCount: 0,
            calificacionPromedio: 4.5,
            totalGanado: 0
          },
          {
            id: '5',
            nombre: 'Roberto Fernández',
            email: 'roberto@email.com',
            telefono: '+1234567894',
            fechaRegistro: '2024-01-05',
            estado: 'activo',
            terrazasCount: 4,
            calificacionPromedio: 4.8,
            totalGanado: 21500
          }
        ]);
        setLoading(false);
      }, 1000);
    }
  };

  const filteredPropietarios = propietarios.filter(propietario => {
    if (filters.estado !== 'todos' && propietario.estado !== filters.estado) return false;
    if (filters.search && !propietario.nombre.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleEditPropietario = (id: string) => {
    navigate(`/admin/propietarios/editar/${id}`);
  };

  const handleViewTerrazas = (propietarioId: string) => {
    navigate(`/admin/terrazas?propietario=${propietarioId}`);
  };

  const handleToggleStatus = async (id: string, nuevoEstado: 'activo' | 'inactivo') => {
    try {
      const response = await fetch(`/api/propietarios/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) throw new Error('Error updating status');

      setPropietarios(prev => 
        prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p)
      );
      
      alert(`Estado actualizado a ${nuevoEstado}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const getStats = () => {
    const total = propietarios.length;
    const activos = propietarios.filter(p => p.estado === 'activo').length;
    const pendientes = propietarios.filter(p => p.estado === 'pendiente').length;
    const totalTerrazas = propietarios.reduce((sum, p) => sum + p.terrazasCount, 0);
    const ingresosTotales = propietarios.reduce((sum, p) => sum + p.totalGanado, 0);

    return { total, activos, pendientes, totalTerrazas, ingresosTotales };
  };

  const { total, activos, pendientes, totalTerrazas, ingresosTotales } = getStats();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando propietarios...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <header className="panel-header">
        <div className="panel-title">
          <h1>Gestión de Propietarios</h1>
          <p>Administra todos los propietarios registrados en la plataforma</p>
        </div>
        <button className="primary-button">
          <span className="material-symbols-outlined">person_add</span>
          Nuevo Propietario
        </button>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Propietarios</p>
          <p className="stat-value">{total}</p>
          <p className="stat-trend positive">+8%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Propietarios Activos</p>
          <p className="stat-value">{activos}</p>
          <p className="stat-trend positive">+15%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Solicitudes Pendientes</p>
          <p className="stat-value">{pendientes}</p>
          <p className="stat-trend negative">-3%</p>
        </div>
        <div className="stat-card highlight">
          <p className="stat-label">Ingresos Totales</p>
          <p className="stat-value">${ingresosTotales.toLocaleString('es-ES')}</p>
          <p className="stat-trend positive">+22%</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-toolbar">
        <div className="filters-group">
          <div className="filter-select-wrapper">
            <select
              value={filters.estado}
              onChange={(e) => setFilters({...filters, estado: e.target.value})}
              className="filter-select"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="pendiente">Pendientes</option>
            </select>
          </div>
        </div>
        <div className="search-wrapper">
          <span className="material-symbols-outlined">search</span>
          <input
            type="search"
            placeholder="Buscar propietario..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="search-input"
          />
        </div>
      </div>

      {/* Tabla de Propietarios */}
      <div className="data-table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Propietario</th>
                <th>Contacto</th>
                <th>Fecha Registro</th>
                <th>Terrazas</th>
                <th>Calificación</th>
                <th>Total Ganado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPropietarios.map((propietario) => (
                <tr key={propietario.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar-small">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <div className="font-medium">{propietario.nombre}</div>
                        <div className="user-id">ID: {propietario.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{propietario.email}</div>
                      <div className="text-sm text-gray-500">{propietario.telefono}</div>
                    </div>
                  </td>
                  <td>
                    {new Date(propietario.fechaRegistro).toLocaleDateString('es-ES')}
                  </td>
                  <td>
                    <div className="terrazas-count">
                      <span className="material-symbols-outlined">deck</span>
                      {propietario.terrazasCount}
                    </div>
                  </td>
                  <td>
                    <div className="rating">
                      <span className="material-symbols-outlined">star</span>
                      {propietario.calificacionPromedio}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-success-green">
                      ${propietario.totalGanado.toLocaleString('es-ES')}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${propietario.estado}`}>
                      {propietario.estado === 'activo' ? 'Activo' : 
                       propietario.estado === 'inactivo' ? 'Inactivo' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-secondary small"
                        onClick={() => handleEditPropietario(propietario.id)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        className="btn-success small"
                        onClick={() => handleViewTerrazas(propietario.id)}
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      {propietario.estado === 'activo' ? (
                        <button 
                          className="btn-danger small"
                          onClick={() => handleToggleStatus(propietario.id, 'inactivo')}
                        >
                          <span className="material-symbols-outlined">block</span>
                        </button>
                      ) : (
                        <button 
                          className="btn-success small"
                          onClick={() => handleToggleStatus(propietario.id, 'activo')}
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPropietarios.length === 0 && (
          <div className="empty-state">
            <span className="material-symbols-outlined">group</span>
            <p>No se encontraron propietarios</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropietariosPanel;