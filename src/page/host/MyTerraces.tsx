import React, { useState, useRef, useEffect } from 'react';
import "../css/hostcss/MyTerrace.css";
import api from "../../api";

// Interfaces TypeScript
interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface User {
  name: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
}

interface Terraza {
  id: number;
  nombre: string;
  capacidad: number;
  ciudad: string;
  estado: string;
  imagen: string;
}

const MisTerrazas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todas');
  const [activeMenu, setActiveMenu] = useState('terrazas');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    memberSince: ''
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Datos de ejemplo para las terrazas
  const [terrazas] = useState<Terraza[]>([
    {
      id: 1,
      nombre: "Terraza El Mirador",
      capacidad: 50,
      ciudad: "Madrid",
      estado: "publicada",
      imagen: "https://images.unsplash.com/photo-1549294413-26f195200c16?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      nombre: "Terraza Jardín Secreto",
      capacidad: 30,
      ciudad: "Barcelona",
      estado: "revision",
      imagen: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      nombre: "Rooftop Urbano Central",
      capacidad: 75,
      ciudad: "Valencia",
      estado: "borrador",
      imagen: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 4,
      nombre: "Oasis Costero",
      capacidad: 100,
      ciudad: "Málaga",
      estado: "publicada",
      imagen: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ]);

  // Notificaciones de ejemplo
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: 1, 
      type: 'reserva', 
      message: 'Nueva reserva para Terraza El Mirador', 
      time: 'Hace 2 horas',
      read: false
    },
    { 
      id: 2, 
      type: 'mensaje', 
      message: 'Tienes un nuevo mensaje', 
      time: 'Hace 5 horas',
      read: false
    },
    { 
      id: 3, 
      type: 'sistema', 
      message: 'Tu terraza ha sido publicada', 
      time: 'Ayer',
      read: true
    }
  ]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short' 
          }) : 'Jan 2023'
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

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setNotificationsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reserva': return 'event_available';
      case 'mensaje': return 'chat';
      case 'sistema': return 'info';
      default: return 'notifications';
    }
  };

  // Obtener inicial para el avatar
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'publicada':
        return { text: 'Publicada', class: 'estado-publicada' };
      case 'revision':
        return { text: 'En revisión', class: 'estado-revision' };
      case 'borrador':
        return { text: 'Borrador', class: 'estado-borrador' };
      default:
        return { text: 'Desconocido', class: 'estado-desconocido' };
    }
  };

  const filteredTerrazas = terrazas.filter(terraza =>
    terraza.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeFilter === 'todas' || terraza.estado === activeFilter)
  );

  if (loading) {
    return (
      <div className="mis-terrazas">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="mis-terrazas">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <span className="material-symbols-outlined">terrace</span>
              <h1>TerrazaApp</h1>
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
                  <span className="material-symbols-outlined">🔔</span>
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </button>
                
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
                      <a className="dropdown-item" href="/host/profile">
                        <span className="material-symbols-outlined">person</span>
                        Mi Perfil
                      </a>
                      <a 
                        className="dropdown-item" 
                        href="/host/configuracion"
                      >
                        <span className="material-symbols-outlined">settings</span>
                        Configuración
                      </a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item" onClick={handleLogout}>
                        <span className="material-symbols-outlined">logout</span>
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

      {/* Main Content con Sidebar */}
      <div className="profile-main-with-sidebar">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
                <h2>TerraceRent</h2>
              </div>
            </div>
            
            {/* Menú de Navegación */}
            <nav className="sidebar-nav">
              <a 
                className={`nav-item ${activeMenu === 'inicio' ? 'active' : ''}`}
                href="/host/dashboard"
                onClick={() => setActiveMenu('inicio')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Inicio</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'terrazas' ? 'active' : ''}`}
                href="/host/MyTerraces"
                onClick={() => setActiveMenu('terrazas')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Mis Terrazas</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'reservaciones' ? 'active' : ''}`}
                href="/host/reservations"
                onClick={() => setActiveMenu('reservaciones')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Reservaciones</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'nueva-terraza' ? 'active' : ''}`}
                href="/host/DocumentVerification"
                onClick={() => setActiveMenu('nueva-terraza')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Subir permisos</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main-content">
          <div className="profile-container">
            {/* Profile Header */}
            {user && (
              <div className="profile-header">
                <div className="profile-info">
                  <div className="avatar-container">
                    <div className="profile-avatar">
                      <span>{getInitial()}</span>
                    </div>
                  </div>
                  <div className="profile-greeting">
                    <h1>¡Hola, {user.name}!</h1>
                    <p>Bienvenido de nuevo a tu perfil de anfitrión</p>
                    <p className="member-since">Miembro desde: {userData.memberSince}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Content */}
            <div className="content-container">
              {/* Page Heading */}
              <div className="page-heading">
                <h2>Mis Terrazas</h2>
              </div>

              {/* SearchBar & Chips */}
              <div className="search-filter-section">
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input 
                      type="text"
                      className="search-input"
                      placeholder="Buscar terraza por nombre"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-chips">
                  <button 
                    className={`filter-chip ${activeFilter === 'todas' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('todas')}
                  >
                    Todas
                  </button>
                  <button 
                    className={`filter-chip ${activeFilter === 'publicada' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('publicada')}
                  >
                    Publicada
                  </button>
                  <button 
                    className={`filter-chip ${activeFilter === 'revision' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('revision')}
                  >
                    En revisión
                  </button>
                  <button 
                    className={`filter-chip ${activeFilter === 'borrador' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('borrador')}
                  >
                    Borrador
                  </button>
                </div>
              </div>

              {/* Terraza Grid */}
              <div className="terrazas-grid">
                {filteredTerrazas.map(terraza => {
                  const estadoBadge = getEstadoBadge(terraza.estado);
                  return (
                    <div key={terraza.id} className="terraza-card">
                      <div className="terraza-image-container">
                        <div 
                          className="terraza-image"
                          style={{ backgroundImage: `url(${terraza.imagen})` }}
                        ></div>
                        <span className={`estado-badge ${estadoBadge.class}`}>
                          {estadoBadge.text}
                        </span>
                      </div>
                      <div className="terraza-content">
                        <h3 className="terraza-nombre">{terraza.nombre}</h3>
                        <p className="terraza-info">Capacidad: {terraza.capacidad}, {terraza.ciudad}</p>
                        <div className="terraza-actions">
                          <button className="action-btn" title="Editar terraza">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="action-btn" title="Ver reservas">
                            <span className="material-symbols-outlined">calendar_month</span>
                          </button>
                          <button className="action-btn delete-btn" title="Eliminar terraza">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredTerrazas.length === 0 && (
                <div className="empty-state">
                  <span className="material-symbols-outlined">deck</span>
                  <h3>No se encontraron terrazas</h3>
                  <p>No hay terrazas que coincidan con tu búsqueda</p>
                  <button className="btn-primary">
                    <span className="material-symbols-outlined">add</span>
                    Añadir mi primera terraza
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MisTerrazas;