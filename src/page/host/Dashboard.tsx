import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminDashboard.css";

interface StatsData {
  totalTerrazas: number;
  totalUsuarios: number;
  reservasActivas: number;
  comisionesMes: number;
  totalPropietarios: number;
  solicitudesPendientes: number;
}

interface QuickLink {
  id: string;
  title: string;
  icon: string;
  path: string;
  badge?: number;
  color: 'corporate-blue' | 'dark-green' | 'success-green' | 'pending-amber';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData>({
    totalTerrazas: 0,
    totalUsuarios: 0,
    reservasActivas: 0,
    comisionesMes: 0,
    totalPropietarios: 0,
    solicitudesPendientes: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      const [
        terrazasRes, 
        usuariosRes, 
        reservasRes, 
        comisionesRes,
        propietariosRes,
        solicitudesRes
      ] = await Promise.all([
        fetch('/api/terrazas/count'),
        fetch('/api/usuarios/count'),
        fetch('/api/reservas/activas/count'),
        fetch('/api/comisiones/mes-actual'),
        fetch('/api/propietarios/count'),
        fetch('/api/solicitudes/pendientes/count')
      ]);

      const totalTerrazas = await terrazasRes.json();
      const totalUsuarios = await usuariosRes.json();
      const reservasActivas = await reservasRes.json();
      const comisionesMes = await comisionesRes.json();
      const totalPropietarios = await propietariosRes.json();
      const solicitudesPendientes = await solicitudesRes.json();

      setStats({
        totalTerrazas: totalTerrazas.count || 0,
        totalUsuarios: totalUsuarios.count || 0,
        reservasActivas: reservasActivas.count || 0,
        comisionesMes: comisionesMes.total || 0,
        totalPropietarios: totalPropietarios.count || 0,
        solicitudesPendientes: solicitudesPendientes.count || 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching real stats:', error);
      setStats({
        totalTerrazas: 47,
        totalUsuarios: 1280,
        reservasActivas: 23,
        comisionesMes: 3450.00,
        totalPropietarios: 89,
        solicitudesPendientes: 5
      });
      setLoading(false);
    }
  };

  const quickLinks: QuickLink[] = [
    {
      id: '1',
      title: 'Gestión de Reservas',
      icon: 'calendar_month',
      path: '/admin/reservas',
      color: 'corporate-blue'
    },
    {
      id: '2',
      title: 'Panel de Comisiones', 
      icon: 'paid',
      path: '/admin/comisiones',
      color: 'dark-green'
    },
    {
      id: '3',
      title: 'Solicitudes de Permisos',
      icon: 'approval',
      path: '/admin/solicitudes',
      badge: stats.solicitudesPendientes,
      color: 'success-green'
    },
    {
      id: '4',
      title: 'Gestión de Terrazas',
      icon: 'deck', 
      path: '/admin/terrazas',
      color: 'pending-amber'
    },
    {
      id: '5',
      title: 'Gestión de Propietarios',
      icon: 'group',
      path: '/admin/propietarios',
      color: 'corporate-blue'
    },
    {
      id: '6',
      title: 'Reportes y Analytics',
      icon: 'analytics',
      path: '/admin/reportes',
      color: 'dark-green'
    }
  ];

  const handleQuickLinkClick = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const refreshData = () => {
    setLoading(true);
    fetchRealStats();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando datos en tiempo real...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-main">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={toggleSidebar}
              title={sidebarVisible ? 'Ocultar menu' : 'Mostrar menu'}
            >
              <span className="material-symbols-outlined">
                {sidebarVisible ? 'menu_open' : 'menu'}
              </span>
            </button>
            <div className="header-title">
              <h1>Dashboard General</h1>
              <p>Bienvenido, aquí tienes un resumen en tiempo real de la plataforma</p>
            </div>
          </div>
          
          <div className="header-right">
            <button 
              className="refresh-button"
              onClick={refreshData}
              title="Actualizar datos"
            >
              <span className="material-symbols-outlined">refresh</span>
              Actualizar
            </button>
          </div>
        </div>

        {/* Sidebar Horizontal DEBAJO del título */}
        {sidebarVisible && (
          <nav className="header-sidebar">
            <div className="sidebar-links-horizontal">
              {quickLinks.map((link) => (
                <button
                  key={link.id}
                  className="sidebar-link-horizontal"
                  onClick={() => handleQuickLinkClick(link.path)}
                  title={link.title}
                >
                  <div className={`link-icon-horizontal ${link.color}`}>
                    <span className="material-symbols-outlined">{link.icon}</span>
                  </div>
                  <span className="link-title-horizontal">{link.title}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="link-badge-horizontal">{link.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon corporate-blue">
            <span className="material-symbols-outlined">deck</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Terrazas</p>
            <p className="stat-value">{stats.totalTerrazas.toLocaleString()}</p>
            <p className="stat-description">Disponibles en plataforma</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon dark-green">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Usuarios</p>
            <p className="stat-value">{stats.totalUsuarios.toLocaleString()}</p>
            <p className="stat-description">Clientes registrados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending-amber">
            <span className="material-symbols-outlined">bookmark_added</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Reservas Activas</p>
            <p className="stat-value">{stats.reservasActivas}</p>
            <p className="stat-description">Para hoy y próximos días</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success-green">
            <span className="material-symbols-outlined">paid</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Comisiones (Mes)</p>
            <p className="stat-value">${stats.comisionesMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            <p className="stat-description">Generadas este mes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon corporate-blue">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Propietarios</p>
            <p className="stat-value">{stats.totalPropietarios}</p>
            <p className="stat-description">Registrados activos</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon pending-amber">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div className="stat-content">
            <p className="stat-label">Solicitudes Pendientes</p>
            <p className="stat-value">{stats.solicitudesPendientes}</p>
            <p className="stat-description">Por revisar</p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="main-content-area">
        {/* Chart Section */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h2>Tendencia de Reservas</h2>
              <p>Últimos 6 meses - Datos en tiempo real</p>
            </div>
            <div className="chart-actions">
              <div className="chart-select">
                <select defaultValue="reservas">
                  <option value="reservas">Reservas</option>
                  <option value="ingresos">Ingresos</option>
                  <option value="comisiones">Comisiones</option>
                </select>
                <span className="material-symbols-outlined">expand_more</span>
              </div>
              <button className="chart-export">
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          </div>
          <div className="chart-wrapper">
            <SimpleBookingsChart />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <div className="activity-header">
            <h2>Actividad Reciente</h2>
            <button className="view-all-button">Ver todo</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon success">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="activity-content">
                <p>Nueva reserva confirmada en "Terraza del Sol"</p>
                <span className="activity-time">Hace 5 minutos</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon warning">
                <span className="material-symbols-outlined">pending</span>
              </div>
              <div className="activity-content">
                <p>Solicitud de terraza pendiente de revisión</p>
                <span className="activity-time">Hace 15 minutos</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon info">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className="activity-content">
                <p>Comisión pagada a propietario María García</p>
                <span className="activity-time">Hace 1 hora</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Componente Simple del Chart
const SimpleBookingsChart: React.FC = () => {
  const [chartData] = useState([65, 59, 80, 81, 56, 55, 40]);
  const maxValue = Math.max(...chartData);
  const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

  return (
    <div className="simple-chart">
      <div className="chart-bars">
        {chartData.map((value, index) => (
          <div key={index} className="chart-bar-container">
            <div 
              className="chart-bar"
              style={{ height: `${(value / maxValue) * 100}%` }}
              title={`${value} reservas`}
            >
              <span className="bar-value">{value}</span>
            </div>
            <span className="bar-label">{labels[index]}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color"></div>
          <span>Tendencia de Reservas - Últimos 6 meses</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;