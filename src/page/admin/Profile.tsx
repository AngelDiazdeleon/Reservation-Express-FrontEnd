// src/page/admin/Profile.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Settings, Bell, Shield,
  Key, LogOut, Edit, Save, X, Calendar,
  DollarSign, Users, Building, BarChart,
  CheckCircle, AlertCircle, MessageSquare
} from "lucide-react";
import "../css/admincss/Profile.css";

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
}

const AdminProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('informacion');
  const [activeMenu, setActiveMenu] = useState('perfil');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    memberSince: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ name: string; email?: string; phone?: string; createdAt?: string; role?: string } | null>(null);

  // Estadísticas de administrador
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalTerrazas: 0,
    totalReservas: 0,
    totalComisiones: 0,
    pendingApprovals: 0,
    activeSessions: 0,
    systemUptime: '99.8%',
    storageUsed: '2.4/10GB'
  });

  // Notificaciones de administrador
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: 'Nueva solicitud de verificación pendiente',
      time: 'Hace 15 minutos',
      read: false,
      type: 'verificacion'
    },
    {
      id: 2,
      message: 'Usuario reportado: Revisar actividad sospechosa',
      time: 'Hace 2 horas',
      read: false,
      type: 'reporte'
    },
    {
      id: 3,
      message: 'Backup del sistema completado exitosamente',
      time: 'Hace 6 horas',
      read: true,
      type: 'sistema'
    },
    {
      id: 4,
      message: 'Pico de tráfico detectado - 500 usuarios concurrentes',
      time: 'Hace 1 día',
      read: true,
      type: 'monitoreo'
    }
  ]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Cargar datos del administrador
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const user = JSON.parse(storedUser);
          setUser(user);
          setUserData({
            name: user.name || 'Administrador',
            email: user.email || '',
            phone: user.phone || '',
            memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'Ene 2024'
          });

          // Cargar estadísticas del dashboard
          fetchAdminStats();
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading admin data:', error);
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  // Cargar estadísticas de administrador
  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminStats({
          totalUsers: data.totalUsuarios || 0,
          totalTerrazas: data.totalTermas || 0,
          totalReservas: data.reservasActivas || 0,
          totalComisiones: data.comisionesMes || 0,
          pendingApprovals: data.documentosPendientes || 0,
          activeSessions: 5,
          systemUptime: '99.8%',
          storageUsed: '2.4/10GB'
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

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

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Eliminar cuenta (solo super admin puede eliminarse)
  const handleDeleteAccount = async () => {
    const isSuperAdmin = user?.role === 'superadmin';
    
    if (!isSuperAdmin) {
      alert('Solo los Super Administradores pueden eliminar cuentas de administrador');
      return;
    }

    if (!window.confirm('⚠️ ¿ESTÁS ABSOLUTAMENTE SEGURO?\n\nEsta acción eliminará permanentemente tu cuenta de administrador.\nTendrás que contactar a otro Super Admin para recuperar el acceso.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/user/admin-profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ Cuenta de administrador eliminada correctamente');
        handleLogout();
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.message || 'No se pudo eliminar la cuenta'}`);
      }
    } catch (error) {
      console.error('Error deleting admin account:', error);
      alert('Error al eliminar la cuenta');
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const updateData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || ''
      };

      const response = await fetch('http://localhost:4000/api/user/admin-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setIsEditing(false);
        alert('✅ Perfil actualizado correctamente');
        
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message || 'No se pudo actualizar el perfil'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error de conexión al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'verificacion': return <CheckCircle size={18} />;
      case 'reporte': return <AlertCircle size={18} />;
      case 'sistema': return <Settings size={18} />;
      case 'monitoreo': return <BarChart size={18} />;
      default: return <Bell size={18} />;
    }
  };

  // Obtener inicial para el avatar
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  };

  if (loading) {
    return (
      <div className="admin-profile">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Cargando perfil de administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile">
      {/* Header */}
      <header className="admin-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <Shield size={28} />
              <h1>Admin Panel</h1>
            </div>
          </div>

          <nav className="nav-section">
            <div className="admin-nav-links">
              {/* Enlaces rápidos de administrador */}
            </div>

            <div className="user-section" ref={userMenuRef}>
              {/* Notificaciones de Admin */}
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
                            {getNotificationIcon(notification.type)}
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

              {user ? (
                <div
                  className="user-profile"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="admin-avatar">
                    <span>{getInitial()}</span>
                    <div className="admin-status"></div>
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">Administrador</span>
                  </div>

                  {userMenuOpen && (
                    <div className="user-dropdown admin-dropdown">
                      <button className="dropdown-item" onClick={() => navigate('/admin/profile')}>
                        <User size={16} />
                        <span>Mi Perfil</span>
                      </button>
                      <button className="dropdown-item" onClick={() => {
                        setActiveTab('configuracion');
                        setUserMenuOpen(false);
                      }}>
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
              ) : (
                <div className="auth-buttons">
                  <button className="login-btn" onClick={() => navigate('/login')}>Iniciar Sesión</button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content con Sidebar */}
      <div className="profile-main-with-sidebar">
        {/* Sidebar de Administrador */}
        <aside className="admin-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <Shield size={32} />
                <h2>Panel Admin</h2>
              </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="admin-quick-stats">
              <div className="stat-card">
                <Users size={20} />
                <div>
                  <span className="stat-value">{adminStats.totalUsers}</span>
                  <span className="stat-label">Usuarios</span>
                </div>
              </div>
              <div className="stat-card">
                <Building size={20} />
                <div>
                  <span className="stat-value">{adminStats.totalTerrazas}</span>
                  <span className="stat-label">Terrazas</span>
                </div>
              </div>
              <div className="stat-card">
                <DollarSign size={20} />
                <div>
                  <span className="stat-value">${adminStats.totalComisiones}</span>
                  <span className="stat-label">Comisiones</span>
                </div>
              </div>
              <div className="stat-card">
                <AlertCircle size={20} />
                <div>
                  <span className="stat-value">{adminStats.pendingApprovals}</span>
                  <span className="stat-label">Pendientes</span>
                </div>
              </div>
            </div>

            {/* Menú de Navegación */}
            <nav className="sidebar-nav">
              <button
                className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu('dashboard');
                  navigate('/admin/dashboard');
                }}
              >
                <BarChart size={18} />
                <span>Dashboard</span>
              </button>
              <button
                className={`nav-item ${activeMenu === 'usuarios' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu('usuarios');
                  navigate('/admin/usuarios');
                }}              >

                <Building size={18} />
                <span>Gestión de Terrazas</span>
              </button>
              <button
                className={`nav-item ${activeMenu === 'verificacion' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu('verificacion');
                  navigate('/admin/verificacion');
                }}
              >
  
                <Settings size={18} />
                <span>Configuración</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main-content">
          <div className="profile-container">
            {/* Profile Header */}
            {user ? (
              <div className="profile-header admin-profile-header">
                <div className="profile-info">
                  <div className="avatar-container admin-avatar-large">
                    <div className="profile-avatar admin-avatar-circle">
                      <span>{getInitial()}</span>
                      <div className="admin-badge-large">
                        <Shield size={14} />
                      </div>
                    </div>
                    <button className="edit-avatar-btn">
                      <Edit size={16} />
                    </button>
                  </div>
                  <div className="profile-greeting">
                    <div className="admin-title">
                      <h1>{user.name}</h1>
                      <span className="admin-role-badge">
                        <Shield size={14} />
                        {user.role || 'Administrador'}
                      </span>
                    </div>
                    <p>Sistema de Administración TerraceRent</p>
                    <p className="member-since">
                      <Calendar size={14} />
                      Miembro desde: {userData.memberSince}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="login-btn" onClick={() => navigate('/login')}>Iniciar Sesión</button>
              </div>
            )}

            {/* Tabs de Administrador */}
            {user && (
              <div className="profile-tabs admin-tabs">
                <button
                  className={`tab ${activeTab === 'informacion' ? 'active' : ''}`}
                  onClick={() => setActiveTab('informacion')}
                >
                  <User size={16} />
                  <span>Información Personal</span>
                </button>
                <button
                  className={`tab ${activeTab === 'seguridad' ? 'active' : ''}`}
                  onClick={() => setActiveTab('seguridad')}
                >
                  <Key size={16} />
                  <span>Seguridad</span>
                </button>
                <button
                  className={`tab ${activeTab === 'configuracion' ? 'active' : ''}`}
                  onClick={() => setActiveTab('configuracion')}
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
              </div>
            )}

            {/* Content */}
            {user && (
              <div className="profile-content">
                {activeTab === 'informacion' && (
                  <div className="info-section admin-info-section">
                    <div className="section-header">
                      <h2>Información del Administrador</h2>
                      <button className="edit-btn admin-edit-btn" onClick={handleEdit}>
                        {isEditing ? (
                          <>
                            <X size={16} />
                            <span>Cancelar</span>
                          </>
                        ) : (
                          <>
                            <Edit size={16} />
                            <span>Editar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="form-grid admin-form-grid">
                      <div className="form-field admin-form-field">
                        <label htmlFor="name">
                          <User size={14} />
                          <span>Nombre Completo</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={userData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="admin-input"
                        />
                      </div>
                      <div className="form-field admin-form-field">
                        <label htmlFor="email">
                          <Mail size={14} />
                          <span>Correo electrónico</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="admin-input"
                        />
                      </div>
                      <div className="form-field admin-form-field">
                        <label htmlFor="phone">
                          <Phone size={14} />
                          <span>Número de teléfono</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={userData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="+52 55 1234 5678"
                          maxLength={15}
                          className="admin-input"
                        />
                      </div>
                      <div className="form-field admin-form-field">
                        <label>
                          <Shield size={14} />
                          <span>Rol en el Sistema</span>
                        </label>
                        <div className="role-display">
                          {user.role || 'Administrador'}
                          <span className="role-type-badge">SISTEMA</span>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="form-actions admin-form-actions">
                        <button
                          className="save-btn admin-save-btn"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <div className="loading-spinner-small"></div>
                              <span>Guardando...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Guardar Cambios</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'seguridad' && (
                  <div className="settings-section admin-security-section">
                    <h2>Seguridad del Administrador</h2>

                    <div className="settings-options">
                      {/* Cambiar Contraseña */}
                      <div className="setting-item admin-setting-item">
                        <div className="setting-info">
                          <div className="setting-icon">
                            <Key size={20} />
                          </div>
                          <div>
                            <h3>Cambiar Contraseña</h3>
                            <p>Actualiza tu contraseña regularmente para mayor seguridad</p>
                          </div>
                        </div>
                        <button className="setting-btn admin-action-btn">
                          <span>Cambiar</span>
                        </button>
                      </div>

                      {/* Autenticación de Dos Factores */}
                      <div className="setting-item admin-setting-item">
                        <div className="setting-info">
                          <div className="setting-icon">
                            <Shield size={20} />
                          </div>
                          <div>
                            <h3>Autenticación de Dos Factores</h3>
                            <p>Agrega una capa adicional de seguridad a tu cuenta</p>
                          </div>
                        </div>
                        <button className="setting-btn admin-action-btn">
                          <span>Activar 2FA</span>
                        </button>
                      </div>

                      {/* Sesiones Activas */}
                      <div className="setting-item admin-setting-item">
                        <div className="setting-info">
                          <div className="setting-icon">
                            <Users size={20} />
                          </div>
                          <div>
                            <h3>Sesiones Activas</h3>
                            <p>Gestiona y revisa todas las sesiones activas</p>
                          </div>
                        </div>
                        <button className="setting-btn admin-action-btn">
                          <span>Ver Sesiones</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'configuracion' && (
                  <div className="settings-section admin-config-section">
                    <h2>Configuración del Sistema</h2>

                    <div className="settings-options">
                      {/* Configuración de Notificaciones */}
                      <div className="setting-item admin-setting-item">
                        <div className="setting-info">
                          <div className="setting-icon">
                            <Bell size={20} />
                          </div>
                          <div>
                            <h3>Notificaciones del Sistema</h3>
                            <p>Configura qué notificaciones recibir como administrador</p>
                          </div>
                        </div>
                        <div className="setting-toggle-container">
                          <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>

                      {/* Modo Administrador */}
                      <div className="setting-item admin-setting-item">
                        <div className="setting-info">
                          <div className="setting-icon">
                            <Settings size={20} />
                          </div>
                          <div>
                            <h3>Modo Administrador Avanzado</h3>
                            <p>Activa funciones avanzadas de administración</p>
                          </div>
                        </div>
                        <div className="setting-toggle-container">
                          <label className="toggle-switch">
                            <input type="checkbox" />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>

                      {/* Separador */}
                      <div className="settings-divider admin-divider"></div>

                      {/* Opción Peligrosa - Eliminar Cuenta */}
                      <div className="setting-item admin-setting-item danger">
                        <div className="setting-info">
                          <div className="setting-icon">
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <h3>Eliminar Cuenta de Administrador</h3>
                            <p>Elimina permanentemente tu cuenta del sistema</p>
                            <small className="warning-text">
                              ⚠️ Solo Super Administradores pueden realizar esta acción
                            </small>
                          </div>
                        </div>
                        <button
                          className="delete-account-btn admin-danger-btn"
                          onClick={handleDeleteAccount}
                          disabled={user.role !== 'superadmin'}
                        >
                          <span>Eliminar Cuenta</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;