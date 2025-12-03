import React, { useState, useRef, useEffect } from "react";
import "../css/clientcss/Miperfil.css";
import api from "../../api";

const ClientProfile = () => {
  const [activeTab, setActiveTab] = useState('informacion');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{name: string} | null>(null);

  // Notificaciones de ejemplo
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      message: 'Tu reserva en "Terraza Panorámica" ha sido confirmada', 
      time: 'Hace 2 horas',
      read: false,
      type: 'reserva'
    },
    { 
      id: 2, 
      message: 'Nuevo mensaje del anfitrión de "Jardín Secreto"', 
      time: 'Hace 5 horas',
      read: false,
      type: 'mensaje'
    },
    { 
      id: 3, 
      message: 'Recordatorio: Tu evento es mañana a las 18:00', 
      time: 'Hace 1 día',
      read: true,
      type: 'recordatorio'
    },
    { 
      id: 4, 
      message: '¡Oferta especial! 20% de descuento en terrazas premium', 
      time: 'Hace 2 días',
      read: true,
      type: 'promocion'
    }
  ]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    } else {
      setLoading(false);
    }
  }, []);

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

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // Función para obtener el perfil completo del usuario
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/profile');
      const user = response.data.user;
      
      setUser(user);
      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar la cuenta
  const handleDeleteAccount = async () => {
    try {
      if (!window.confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción eliminará permanentemente tu cuenta y todos tus datos. No podrás recuperarlos.')) {
        return;
      }

      const response = await api.delete('/user/profile');
      
      alert('Tu cuenta ha sido eliminada correctamente');
      
      // Cerrar sesión y redirigir
      handleLogout();
      
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      alert('Error al eliminar la cuenta: ' + (error.response?.data?.message || 'Intenta nuevamente'));
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || ''
      };

      const response = await api.post('/user/profile', updateData, {
        timeout: 15000
      });
      
      setIsEditing(false);
      alert('¡Perfil actualizado correctamente!');
      
      await fetchUserProfile();
      
    } catch (error: any) {
      console.error('Error al guardar:', error);
      
      if (error.code === 'ECONNABORTED') {
        alert('⏰ Timeout: El servidor no respondió en 15 segundos');
      } else if (error.code === 'NETWORK_ERROR') {
        alert('🌐 Error de red: No se pudo conectar al servidor');
      } else if (error.response?.status === 409) {
        alert('📧 El email ya está en uso por otro usuario');
      } else if (error.response?.status === 401) {
        alert('🔐 No autorizado - Token inválido o expirado');
      } else if (error.response?.status === 400) {
        alert('📝 Datos inválidos: ' + (error.response.data?.message || 'Verifica los campos'));
      } else if (error.response) {
        alert(`❌ Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`);
      } else {
        alert('🌐 Error de conexión: ' + (error.message || 'Verifica que el backend esté corriendo'));
      }
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
      case 'reserva': return 'event_available';
      case 'mensaje': return 'message';
      case 'recordatorio': return 'notification_important';
      case 'promocion': return 'local_offer';
      default: return 'notifications';
    }
  };

  // Obtener inicial para el avatar
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <div className="client-profile">
        <div className="loading">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="client-profile">
      {/* Header - Mismo diseño que Home */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <span className="material-symbols-outlined">terrace</span>
              <h1>TerrazaApp</h1>
            </div>
          </div>
          
          <nav className="nav-section">
            <div className="nav-links">
              <a className="nav-link" href="/client/home">Explorar</a>
              <a className="nav-link" href="/client/MyReservation">Reservaciones</a>
            </div>
            
            <div className="user-section" ref={userMenuRef}>
              {/* Notificaciones */}
              <div className="notification-container" ref={notificationsRef}>
                
                {notificationsOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notificaciones</h3>
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
                          <div className="notification-icon">
                            <span className="material-symbols-outlined">
                              {getNotificationIcon(notification.type)}
                            </span>
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
                  <div className="avatar">
                    <span>{getInitial()}</span>
                  </div>
                  <span className="user-name">{user.name}</span>
                  
                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <a className="dropdown-item" href="/client/profile">
                        <span className="material-symbols-outlined"></span>
                        Mi Perfil
                      </a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item" onClick={handleLogout}>
                        <span className="material-symbols-outlined"></span>
                        Cerrar Sesión
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <a href="/login" className="login-btn">Iniciar Sesión</a>
                  <a href="/register" className="register-btn">Registrarse</a>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          {/* Profile Header */}
          {user ? (
            <div className="profile-header">
              <div className="profile-info">
                <div className="profile-greeting">
                  <h1>¡Hola, {user.name}!</h1>
                  <p>Bienvenido de nuevo a tu perfil</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <a href="/login" className="login-btn">Iniciar Sesión</a>
              <a href="/register" className="register-btn">Registrarse</a>
            </div>
          )}

          {/* Tabs */}
          {user && (
            <div className="profile-tabs">
              <button 
                className={`tab ${activeTab === 'informacion' ? 'active' : ''}`}
                onClick={() => setActiveTab('informacion')}
              >
                Información Personal
              </button>
              <button 
                className={`tab ${activeTab === 'configuracion' ? 'active' : ''}`}
                onClick={() => setActiveTab('configuracion')}
              >
                Configuración
              </button>
            </div>
          )}

          {/* Content */}
          {user && (
            <div className="profile-content">
              {activeTab === 'informacion' && (
                <div className="info-section">
                  <div className="section-header">
                    <h2>Información Personal</h2>
                    <button className="edit-btn" onClick={handleEdit}>
                      <span className="material-symbols-outlined"></span>
                      {isEditing ? 'Cancelar' : 'Editar'}
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="name">Nombre</label>
                      <input
                        type="text"
                        id="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="email">Correo electrónico</label>
                      <input
                        type="email"
                        id="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="phone">Número de teléfono</label>
                      <input
                        type="tel"
                        id="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Agrega tu número de teléfono"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button 
                        className="save-btn" 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <span className="material-symbols-outlined"></span>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reservas' && (
                <div className="reservations-section">
                  <h2>Mis Reservas</h2>
                  <div className="empty-state">
                    <span className="material-symbols-outlined">Mis reservaciones</span>
                    <p>No tienes reservas activas en este momento</p>
                  </div>
                </div>
              )}

              {activeTab === 'configuracion' && (
                <div className="settings-section">
                  <h2>Configuración</h2>
                  
                  <div className="settings-options">
                    {/* Opción de Notificaciones */}
                    <div className="setting-item">
                      <div className="setting-info">
                        <h3>Notificaciones</h3>
                        <p>Gestiona tus preferencias de notificaciones</p>
                      </div>
                      <button className="setting-toggle">
                        <span className="toggle-switch"></span>
                      </button>
                    </div>

                    {/* Opción de Privacidad */}
                    <div className="setting-item">
                      <div className="setting-info">
                        <h3>Privacidad</h3>
                        <p>Controla quién puede ver tu información</p>
                      </div>
                      <button className="setting-btn">
                        <span className="material-symbols-outlined"></span>
                      </button>
                    </div>

                    {/* Opción de Seguridad */}
                    <div className="setting-item">
                      <div className="setting-info">
                        <h3>Seguridad</h3>
                        <p>Cambia tu contraseña y configura la autenticación</p>
                      </div>
                      <button className="setting-btn">
                        <span className="material-symbols-outlined"></span>
                      </button>
                    </div>

                    {/* Separador */}
                    <div className="settings-divider"></div>

                    {/* Opción Peligrosa - Eliminar Cuenta */}
                    <div className="setting-item danger">
                      <div className="setting-info">
                        <h3>Eliminar Cuenta</h3>
                        <p>Elimina permanentemente tu cuenta y todos tus datos</p>
                      </div>
                      <button 
                        className="delete-account-btn"
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                            handleDeleteAccount();
                          }
                        }}
                      >
                        <span className="material-symbols-outlined"></span>
                        Eliminar
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
  );
};

export default ClientProfile;