import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Building, Calendar, DollarSign,
  BarChart, TrendingUp, CheckCircle, Clock, XCircle,
  Shield, Bell, LogOut, Home, Settings,
  FileText, FileCheck, ChevronLeft, Menu,
  User, ChevronRight, Eye, EyeOff
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import "../css/admincss/AdminDashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    role: ''
  });
  
  // Notificaciones
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'Nueva terraza pendiente de aprobación',
      time: 'Hace 15 minutos',
      read: false,
      type: 'terrazas'
    },
    {
      id: 2,
      message: 'Usuario reportado: Revisar actividad',
      time: 'Hace 2 horas',
      read: false,
      type: 'usuarios'
    },
    {
      id: 3,
      message: 'Backup del sistema completado',
      time: 'Hace 6 horas',
      read: true,
      type: 'sistema'
    }
  ]);

  // Estados para estadísticas
  const [stats, setStats] = useState({
    totalTerrazas: 0,
    totalUsuarios: 0,
    reservasActivas: 0,
    comisionesMes: 0,
    documentosPendientes: 0,
    solicitudesPendientes: 0,
    usuariosMesActual: 0,
    crecimientoUsuarios: 0
  });

  // Detalles expandibles
  const [detalles, setDetalles] = useState({
    terrazas: { total: 0, activas: 0, aprobadas: 0, pendientes: 0, rechazadas: 0, inactivas: 0 },
    usuarios: { total: 0, admins: 0, hosts: 0, clients: 0 },
    reservas: { total: 0, reservas: 0, visitas: 0, confirmadas: 0, activas: 0, pendientes: 0, canceladas: 0, completadas: 0 },
    comisiones: { totalMes: 0, pagadas: 0, pendientes: 0, retrasadas: 0 }
  });

  // Estados para mostrar/ocultar detalles
  const [showTerrazasDetails, setShowTerrazasDetails] = useState(false);
  const [showUsuariosDetails, setShowUsuariosDetails] = useState(false);
  const [showReservasDetails, setShowReservasDetails] = useState(false);
  const [showComisionesDetails, setShowComisionesDetails] = useState(false);

  // Datos para gráfico de usuarios
  const [userGrowthData, setUserGrowthData] = useState([
    { dia: 'Lun', usuarios: 0 },
    { dia: 'Mar', usuarios: 0 },
    { dia: 'Mié', usuarios: 0 },
    { dia: 'Jue', usuarios: 0 },
    { dia: 'Vie', usuarios: 0 },
    { dia: 'Sáb', usuarios: 0 },
    { dia: 'Dom', usuarios: 0 }
  ]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Cargar datos del usuario y dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('🔄 INICIANDO CARGA DE DATOS...');
        
        // Cargar datos del usuario
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser({
            name: user.name || 'Administrador',
            email: user.email || '',
            role: user.role || 'admin'
          });
        }

        // Cargar estadísticas del dashboard
        if (token) {
          console.log('🌐 Haciendo petición a /api/dashboard/stats');
          
          const response = await fetch("http://localhost:4000/api/dashboard/stats", {
            method: 'GET',
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          });
          
          console.log('📡 Status respuesta:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ DATOS RECIBIDOS DEL BACKEND:', data);
            
            // CORREGIDO: Cambiar "totalTermas" por "totalTerrazas"
            setStats({
              totalTerrazas: data.totalTerrazas || 0,
              totalUsuarios: data.totalUsuarios || 0,
              reservasActivas: data.reservasActivas || 0,
              comisionesMes: data.comisionesMes || 0,
              documentosPendientes: data.documentosPendientes || 0,
              solicitudesPendientes: data.solicitudesPendientes || 0,
              usuariosMesActual: data.usuariosMesActual || 0,
              crecimientoUsuarios: data.crecimientoUsuarios || 0
            });
            
            // Actualizar detalles
            if (data.terrazasDetalle) {
              setDetalles(prev => ({
                ...prev,
                terrazas: data.terrazasDetalle
              }));
            }
            
            if (data.usuariosDetalle) {
              setDetalles(prev => ({
                ...prev,
                usuarios: data.usuariosDetalle
              }));
            }
            
            if (data.reservasDetalle) {
              setDetalles(prev => ({
                ...prev,
                reservas: data.reservasDetalle
              }));
            }
            
            if (data.comisionesDetalle) {
              setDetalles(prev => ({
                ...prev,
                comisiones: data.comisionesDetalle
              }));
            }
            
            // Actualizar gráfico
            if (data.graficoUsuarios) {
              setUserGrowthData(data.graficoUsuarios);
            }
          } else {
            console.error('❌ Error HTTP:', response.status);
            const errorText = await response.text();
            console.error('Error texto:', errorText);
          }
        } else {
          console.error('❌ No hay token, redirigiendo a login');
          navigate("/login");
        }
      } catch (error) {
        console.error("💥 Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Formatear números
  const formatNumber = (num: number | string | null | undefined): string => {
    if (num == null || num === '') return '0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    return !isNaN(number as number) ? number.toLocaleString('es-ES') : '0';
  };

  // Formatear dinero
  const formatMoney = (num: number | string | null | undefined): string => {
    if (num == null || num === '') return '$0';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    return !isNaN(number as number) ? `$${number.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0';
  };

  // Marcar notificación como leída
  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  // Obtener inicial del nombre
  const getUserInitial = () => {
    return currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A';
  };

  if (loading) {
    return (
      <div className="admin-profile">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Cargando datos reales del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile">
      {/* HEADER */}
      <header className="admin-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <Shield size={28} />
              <h1>Admin Panel</h1>
            </div>
          </div>

          <nav className="nav-section">
            <div className="user-section" ref={userMenuRef}>
              {/* Notificaciones */}
              <div className="notification-container" ref={notificationsRef}>
                <button
                  className="icon-btn notification-btn"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="notification-dropdown admin-notifications">
                    <div className="notification-header">
                      <h3>Notificaciones del Sistema</h3>
                      {unreadNotifications > 0 && (
                        <button className="mark-all-read" onClick={markAllAsRead}>
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`notification-item ${notification.read ? '' : 'unread'}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="notification-icon admin-icon">
                            <Bell size={18} />
                          </div>
                          <div className="notification-content">
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Perfil de Usuario */}
              <div
                className="user-profile"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="admin-avatar">
                  <span>{getUserInitial()}</span>
                  <div className="admin-status"></div>
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.name}</span>
                  <span className="user-role">Administrador</span>
                </div>

                {userMenuOpen && (
                  <div className="user-dropdown admin-dropdown">
                    <button className="dropdown-item" onClick={() => navigate("/admin/profile")}>
                      <User size={16} />
                      <span>Mi Perfil</span>
                    </button>
                    <button className="dropdown-item" onClick={() => navigate("/admin/configuracion")}>
                      <Settings size={16} />
                      <span>Configuración</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT CON SIDEBAR */}
      <div className="profile-main-with-sidebar">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <Shield size={32} />
                <h2>Panel Admin</h2>
              </div>
            </div>

            {/* Estadísticas Rápidas en Sidebar */}
            <div className="admin-quick-stats">
              <div className="stat-card">
                <Users size={20} />
                <div>
                  <span className="stat-value">{formatNumber(stats.totalUsuarios)}</span>
                  <span className="stat-label">Usuarios</span>
                </div>
              </div>
              <div className="stat-card">
                <Building size={20} />
                <div>
                  <span className="stat-value">{formatNumber(stats.totalTerrazas)}</span>
                  <span className="stat-label">Terrazas</span>
                </div>
              </div>
              <div className="stat-card">
                <DollarSign size={20} />
                <div>
                  <span className="stat-value">{formatMoney(stats.comisionesMes)}</span>
                  <span className="stat-label">Comisiones</span>
                </div>
              </div>
              <div className="stat-card">
                <FileCheck size={20} />
                <div>
                  <span className="stat-value">{formatNumber(stats.solicitudesPendientes)}</span>
                  <span className="stat-label">Pendientes</span>
                </div>
              </div>
            </div>

            {/* Menú de Navegación Sidebar */}
            <nav className="sidebar-nav">
              <button
                className={`nav-item active`}
                onClick={() => navigate("/admin/dashboard")}
              >
                <BarChart size={18} />
                <span>Dashboard</span>
              </button>
              <button
                className="nav-item"
                onClick={() => navigate("/admin/RegisterAdmin")}
              >
                <Users size={18} />
                <span>Agregar Admin</span>
              </button>
              <button
                className="nav-item"
                onClick={() => navigate("/admin/PermissionMagement")}
              >
                <Building size={18} />
                <span>Gestión de Terrazas</span>
              </button>
              <button
                className="nav-item"
                onClick={() => navigate("")}
              >
                <Calendar size={18} />
                <span>Gestión de Reservas</span>
              </button>
              <button
                className="nav-item"
                onClick={() => navigate("/admin/comisiones")}
              >
                <DollarSign size={18} />
                <span>Comisiones</span>
              </button>
              <div className="sidebar-divider"></div>
              <button
                className="nav-item"
                onClick={() => navigate("/admin/configuracion")}
              >
                <Settings size={18} />
                <span>Configuración</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="profile-main-content">
          <div className="profile-container">
            {/* Bienvenida */}
            <div className="profile-header admin-profile-header">
              <div className="profile-info">
                <div className="avatar-container admin-avatar-large">
                  <div className="profile-avatar admin-avatar-circle">
                    <span>{getUserInitial()}</span>
                    <div className="admin-badge-large">
                      <Shield size={14} />
                    </div>
                  </div>
                </div>
                <div className="profile-greeting">
                  <div className="admin-title">
                    <h1>Bienvenido, {currentUser.name}</h1>
                    <span className="admin-role-badge">
                      <Shield size={14} />
                      Administrador
                    </span>
                  </div>
                  <p>Panel de control y estadísticas del sistema</p>
                  <small className="data-source">
                    📊 Datos en tiempo real desde MongoDB
                  </small>
                </div>
              </div>
            </div>

            {/* ESTADÍSTICAS PRINCIPALES CON DETALLES */}
            <div className="profile-content">
              <div className="stats-grid-detailed">
                {/* TARJETA DE TERRAZAS */}
                <div className="stat-card-detailed">
                  <div 
                    className="stat-card-header" 
                    onClick={() => navigate("/admin/terrazas")}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stat-icon blue">
                      <Building size={24} />
                    </div>
                    <div className="stat-main-info">
                      <h3>Terrazas</h3>
                      <p className="stat-total">{formatNumber(stats.totalTerrazas)}</p>
                      <span className="stat-subtitle">Total registradas</span>
                    </div>
                    <ChevronRight size={20} className="stat-arrow" />
                  </div>
                  
                  <button 
                    className="toggle-details-btn"
                    onClick={() => setShowTerrazasDetails(!showTerrazasDetails)}
                  >
                    {showTerrazasDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>Ver detalles</span>
                  </button>
                  
                  {showTerrazasDetails && (
                    <div className="stat-details">
                      <div className="detail-row positive">
                        <CheckCircle size={14} />
                        <span className="detail-label">Activas:</span>
                        <span className="detail-value">{formatNumber(detalles.terrazas.activas)}</span>
                      </div>
                      <div className="detail-row positive">
                        <CheckCircle size={14} />
                        <span className="detail-label">Aprobadas:</span>
                        <span className="detail-value">{formatNumber(detalles.terrazas.aprobadas)}</span>
                      </div>
                      <div className="detail-row warning">
                        <Clock size={14} />
                        <span className="detail-label">Pendientes:</span>
                        <span className="detail-value">{formatNumber(detalles.terrazas.pendientes)}</span>
                      </div>
                      <div className="detail-row negative">
                        <XCircle size={14} />
                        <span className="detail-label">Rechazadas:</span>
                        <span className="detail-value">{formatNumber(detalles.terrazas.rechazadas)}</span>
                      </div>
                      <div className="detail-row">
                        <Building size={14} />
                        <span className="detail-label">Inactivas:</span>
                        <span className="detail-value">{formatNumber(detalles.terrazas.inactivas)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* TARJETA DE USUARIOS */}
                <div className="stat-card-detailed">
                  <div 
                    className="stat-card-header"
                    onClick={() => navigate("/admin/usuarios")}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stat-icon green">
                      <Users size={24} />
                    </div>
                    <div className="stat-main-info">
                      <h3>Usuarios</h3>
                      <p className="stat-total">{formatNumber(stats.totalUsuarios)}</p>
                      <span className="stat-subtitle">Total registrados</span>
                    </div>
                    <ChevronRight size={20} className="stat-arrow" />
                  </div>
                  
                  <button 
                    className="toggle-details-btn"
                    onClick={() => setShowUsuariosDetails(!showUsuariosDetails)}
                  >
                    {showUsuariosDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>Ver detalles</span>
                  </button>
                  
                  {showUsuariosDetails && (
                    <div className="stat-details">
                      <div className="detail-row admin">
                        <Shield size={14} />
                        <span className="detail-label">Administradores:</span>
                        <span className="detail-value">{formatNumber(detalles.usuarios.admins)}</span>
                      </div>
                      <div className="detail-row host">
                        <Building size={14} />
                        <span className="detail-label">Hosts:</span>
                        <span className="detail-value">{formatNumber(detalles.usuarios.hosts)}</span>
                      </div>
                      <div className="detail-row client">
                        <User size={14} />
                        <span className="detail-label">Clientes:</span>
                        <span className="detail-value">{formatNumber(detalles.usuarios.clients)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* TARJETA DE RESERVAS */}
                <div className="stat-card-detailed">
                  <div 
                    className="stat-card-header"
                    onClick={() => navigate("/admin/reservas")}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stat-icon orange">
                      <Calendar size={24} />
                    </div>
                    <div className="stat-main-info">
                      <h3>Reservas</h3>
                      <p className="stat-total">{formatNumber(stats.reservasActivas)}</p>
                      <span className="stat-subtitle">Activas</span>
                    </div>
                    <ChevronRight size={20} className="stat-arrow" />
                  </div>
                  
                  <button 
                    className="toggle-details-btn"
                    onClick={() => setShowReservasDetails(!showReservasDetails)}
                  >
                    {showReservasDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>Ver detalles</span>
                  </button>
                  
                  {showReservasDetails && (
                    <div className="stat-details">
                      <div className="detail-row">
                        <Calendar size={14} />
                        <span className="detail-label">Total reservas:</span>
                        <span className="detail-value">{formatNumber(detalles.reservas.total)}</span>
                      </div>
                      <div className="detail-row">
                        <Calendar size={14} />
                        <span className="detail-label">Reservas:</span>
                        <span className="detail-value">{formatNumber(detalles.reservas.reservas)}</span>
                      </div>
                      <div className="detail-row">
                        <Calendar size={14} />
                        <span className="detail-label">Visitas:</span>
                        <span className="detail-value">{formatNumber(detalles.reservas.visitas)}</span>
                      </div>
                      <div className="detail-row positive">
                        <CheckCircle size={14} />
                        <span className="detail-label">Confirmadas:</span>
                        <span className="detail-value">{formatNumber(detalles.reservas.confirmadas)}</span>
                      </div>
                      <div className="detail-row warning">
                        <Clock size={14} />
                        <span className="detail-label">Pendientes:</span>
                        <span className="detail-value">{formatNumber(detalles.reservas.pendientes)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* TARJETA DE COMISIONES */}
                <div className="stat-card-detailed">
                  <div 
                    className="stat-card-header"
                    onClick={() => navigate("/admin/comisiones")}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stat-icon purple">
                      <DollarSign size={24} />
                    </div>
                    <div className="stat-main-info">
                      <h3>Comisiones</h3>
                      <p className="stat-total">{formatMoney(stats.comisionesMes)}</p>
                      <span className="stat-subtitle">Este mes</span>
                    </div>
                    <ChevronRight size={20} className="stat-arrow" />
                  </div>
                  
                  <button 
                    className="toggle-details-btn"
                    onClick={() => setShowComisionesDetails(!showComisionesDetails)}
                  >
                    {showComisionesDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>Ver detalles</span>
                  </button>
                  
                  {showComisionesDetails && (
                    <div className="stat-details">
                      <div className="detail-row positive">
                        <CheckCircle size={14} />
                        <span className="detail-label">Recolectadas:</span>
                        <span className="detail-value">{formatMoney(detalles.comisiones.pagadas)}</span>
                      </div>
                      <div className="detail-row warning">
                        <Clock size={14} />
                        <span className="detail-label">Pendientes:</span>
                        <span className="detail-value">{formatMoney(detalles.comisiones.pendientes)}</span>
                      </div>
                      <div className="detail-row negative">
                        <Clock size={14} />
                        <span className="detail-label">Reembolsadas:</span>
                        <span className="detail-value">{formatMoney(detalles.comisiones.retrasadas)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* GRÁFICO Y ESTADÍSTICAS RÁPIDAS */}
              <div className="dashboard-charts">
                {/* GRÁFICO DE CRECIMIENTO */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <h3>Crecimiento de Usuarios</h3>
                      <p className="chart-subtitle">Últimos 7 días</p>
                    </div>
                    <div className="chart-stats">
                      <div className="chart-stat">
                        <span className="stat-label">Total mes:</span>
                        <span className="stat-value">{formatNumber(stats.usuariosMesActual)}</span>
                      </div>
                      <div className={`chart-stat ${stats.crecimientoUsuarios >= 0 ? 'positive' : 'negative'}`}>
                        <TrendingUp size={14} />
                        <span className="stat-value">
                          {stats.crecimientoUsuarios >= 0 ? '+' : ''}
                          {stats.crecimientoUsuarios}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="dia" 
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value) => [`${value} usuarios`, 'Cantidad']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="usuarios" 
                          stroke="#62BEB2" 
                          fill="#e0f7f3"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ESTADÍSTICAS RÁPIDAS */}
                <div className="quick-stats-card">
                  <h3>Resumen Rápido</h3>
                  <div className="quick-stats">
                    <div className="quick-stat">
                      <div className="quick-stat-icon pending">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <span className="quick-stat-value">{formatNumber(stats.documentosPendientes)}</span>
                        <span className="quick-stat-label">Documentos por verificar</span>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-icon warning">
                        <FileText size={18} />
                      </div>
                      <div>
                        <span className="quick-stat-value">{formatNumber(stats.solicitudesPendientes)}</span>
                        <span className="quick-stat-label">Solicitudes nuevas</span>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-icon info">
                        <BarChart size={18} />
                      </div>
                      <div>
                        <span className="quick-stat-value">{formatNumber(stats.usuariosMesActual)}</span>
                        <span className="quick-stat-label">Usuarios este mes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFO DEL SISTEMA */}
              <div className="system-info">
                <div className="info-card">
                  <Shield size={24} />
                  <div>
                    <h4>Sistema Activo</h4>
                    <p>Todos los servicios funcionando correctamente</p>
                  </div>
                </div>
                <div className="info-card">
                  <User size={24} />
                  <div>
                    <h4>Sesión Activa</h4>
                    <p>Conectado como: <strong>{currentUser.name}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;