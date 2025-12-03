import React, { useState, useRef, useEffect } from 'react';
import '../css/hostcss/Dashboard.css';
import api from '../../api';

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

// Interface para las terrazas reales desde la API
interface Terraza {
  _id: string;
  terraceData: {
    name: string;
    description: string;
    capacity: number;
    location: string;
    price: number;
    contactPhone: string;
    contactEmail: string;
    amenities: string[];
    rules: string;
  };
  photos: Array<{
    fileId: string;
    filename: string;
    filePath: string;
    originalName: string;
    mimetype: string;
    fileType: string;
    size: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
}

function TerraceAdmin() {
  // Estados para el header
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    memberSince: ''
  });
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');
  const [activeMenu, setActiveMenu] = useState('inicio');
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'booking',
      message: 'Nueva reserva para The Urban Oasis',
      time: 'Hace 5 min',
      read: false
    },
    {
      id: 2,
      type: 'message',
      message: 'Tienes un nuevo mensaje',
      time: 'Hace 1 hora',
      read: false
    }
  ]);

  // Estado para las terrazas reales
  const [terrazas, setTerrazas] = useState<Terraza[]>([]);
  const [loadingTerrazas, setLoadingTerrazas] = useState(true);

  // Refs para manejar clicks fuera del dropdown
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cargar datos del usuario y terrazas al montar el componente
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
        
        // Cargar terrazas del usuario
        loadUserTerrazas();
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    } else {
      setLoading(false);
      setLoadingTerrazas(false);
    }
  }, []);

  // Función para cargar las terrazas del usuario desde la API
  const loadUserTerrazas = async () => {
    try {
      setLoadingTerrazas(true);
      console.log('📡 Cargando terrazas del usuario para dashboard...');
      
      const response = await api.get('/publication-requests/my/requests');
      
      if (response.data.success) {
        console.log('✅ Terrazas cargadas en dashboard:', response.data.data);
        setTerrazas(response.data.data);
      } else {
        console.error('❌ Error cargando terrazas:', response.data.message);
      }
    } catch (error: any) {
      console.error('💥 Error al cargar terrazas:', error);
      
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoadingTerrazas(false);
    }
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
        phone: user.phone || '',
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short' 
        }) : 'Jan 2023'
      });
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Manejar clicks fuera de los dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Funciones para notificaciones
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    setUnreadNotifications(0);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'booking': return 'event_available';
      case 'message': return 'message';
      default: return 'notifications';
    }
  };

  const getInitial = (): string => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // Obtener URL de la imagen (usando la primera foto)
  const getTerrazaImage = (terraza: Terraza) => {
    if (terraza.photos && terraza.photos.length > 0) {
      const primeraFoto = terraza.photos[0];
      const fileName = primeraFoto.filename;
      if (fileName) {
        return `http://localhost:4000/api/terrace-images/${fileName}`;
      }
    }
    
    // Imagen por defecto si no hay fotos
    return "https://images.unsplash.com/photo-1549294413-26f195200c16?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
  };

  // Cálculos para las estadísticas del dashboard basadas en datos reales
  const totalTerraces = terrazas.length;
  const publishedTerraces = terrazas.filter(terraza => terraza.status === 'approved').length;
  const pendingTerraces = terrazas.filter(terraza => terraza.status === 'pending').length;
  const rejectedTerraces = terrazas.filter(terraza => terraza.status === 'rejected').length;

  // Calcular ganancias estimadas (basado en terrazas aprobadas y precio)
  const estimatedEarnings = terrazas
    .filter(terraza => terraza.status === 'approved')
    .reduce((sum, terraza) => sum + (terraza.terraceData.price * 10), 0); // Estimación: precio * 10 reservas

  // Datos para las tarjetas de estadísticas - ahora con datos reales
  const statsData = [
    {
      title: 'Terrazas Listadas',
      value: totalTerraces.toString(),
      change: pendingTerraces > 0 ? `+${pendingTerraces} en revisión` : 'Todas procesadas',
      icon: '',
      color: 'primary'
    },
    {
      title: 'Terrazas Publicadas',
      value: publishedTerraces.toString(),
      change: publishedTerraces > 0 ? 'Activas' : 'Sin publicar',
      icon: '',
      color: 'secondary'
    },
    {
      title: 'Solicitudes Pendientes',
      value: pendingTerraces.toString(),
      change: pendingTerraces > 0 ? 'En revisión' : 'Sin pendientes',
      icon: '',
      color: 'accent'
    },
    // {
    //   title: 'Ganancias Estimadas',
    //   value: `$${estimatedEarnings.toLocaleString()}`,
    //   change: '+15.2% este mes',
    //   icon: '',
    //   color: 'secondary'
    // }
  ];

  // Obtener las terrazas aprobadas para mostrar en la tabla
  const approvedTerrazas = terrazas.filter(terraza => terraza.status === 'approved');

  if (loading) {
    return (
      <div className="tr-font-display tr-bg-background-light tr-text-text-light tr-min-h-screen tr-flex tr-items-center tr-justify-center">
        <div className="tr-text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="tr-font-display tr-bg-background-light tr-text-text-light">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <span className="material-symbols-outlined">Reservation</span>
              <h1>Express</h1>
            </div>
          </div>
          
          <nav className="nav-section">
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
                      <a className="dropdown-item" href="/host/profile">
                        <span className="material-symbols-outlined"></span>
                        Mi Perfil
                      </a>
                      <a 
                        className="dropdown-item" 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab('configuracion');
                          setUserMenuOpen(false);
                        }}
                      >
                        <span className="material-symbols-outlined"></span>
                        Configuración
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

      {/* Main Content */}
      <div className="tr-min-h-screen tr-flex">
        {/* SideNavBar */}
        <aside className="tr-w-64 tr-flex-shrink-0 tr-bg-card-light tr-p-4 tr-flex tr-flex-col tr-justify-between tr-border-r tr-border-border-light">
          <div>
            <div className="tr-flex tr-items-center tr-gap-3 tr-p-3 tr-mb-6">
              <div className="tr-size-8 tr-text-primary">
              </div>
              <h2 className="tr-text-xl tr-font-bold">Reservation Exprees</h2>
            </div>
            
            {/* Menú de Navegación con Estados Activos */}
            <nav className="tr-flex tr-flex-col tr-gap-2">
              <a 
                className={`tr-flex tr-items-center tr-gap-3 tr-px-3 tr-py-2 tr-rounded-lg ${
                  activeMenu === 'inicio' 
                    ? 'tr-bg-primary-10 tr-text-primary' 
                    : 'tr-hover-bg-primary-10 tr-hover-text-primary'
                }`} 
                href="#"
                onClick={() => setActiveMenu('inicio')}
              >
                <span className="material-symbols-outlined tr-text-lg"></span>
                <p className="tr-text-sm tr-font-medium">Inicio</p>
              </a>
              <a 
                className={`tr-flex tr-items-center tr-gap-3 tr-px-3 tr-py-2 tr-rounded-lg ${
                  activeMenu === 'terrazas' 
                    ? 'tr-bg-primary-10 tr-text-primary' 
                    : 'tr-hover-bg-primary-10 tr-hover-text-primary'
                }`} 
                href="/host/MyTerraces"
                onClick={() => setActiveMenu('terrazas')}
              >
                <span className="material-symbols-outlined tr-text-lg"></span>
                <p className="tr-text-sm tr-font-medium">Mis Terrazas</p>
              </a>
              <a 
                className={`tr-flex tr-items-center tr-gap-3 tr-px-3 tr-py-2 tr-rounded-lg ${
                  activeMenu === 'reservaciones' 
                    ? 'tr-bg-primary-10 tr-text-primary' 
                    : 'tr-hover-bg-primary-10 tr-hover-text-primary'
                }`} 
                href="/host/Reservation"
                onClick={() => setActiveMenu('reservaciones')}
                
              >
                <span className="material-symbols-outlined tr-text-lg"></span>
                <p className="tr-text-sm tr-font-medium">Reservaciones</p>
                
              </a>
              <a 
                className={`tr-flex tr-items-center tr-gap-3 tr-px-3 tr-py-2 tr-rounded-lg ${
                  activeMenu === 'nueva-terraza' 
                    ? 'tr-bg-primary-10 tr-text-primary' 
                    : 'tr-hover-bg-primary-10 tr-hover-text-primary'
                }`} 
                href="/host/DocumentVerification"
                onClick={() => setActiveMenu('nueva-terraza')}
              >
                <span className="material-symbols-outlined tr-text-lg"></span>
                <p className="tr-text-sm tr-font-medium">Subir Permisos</p>
              </a>
            </nav>
          </div>
          
          {/* Sección inferior del menú */}
          <div className="tr-flex tr-flex-col tr-gap-1">
            <a 
              className="tr-flex tr-items-center tr-gap-3 tr-px-3 tr-py-2 tr-rounded-lg tr-hover-bg-primary-10 tr-hover-text-primary tr-cursor-pointer" 
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined tr-text-lg"></span>
              {/* <p className="tr-text-sm tr-font-medium">Cerrar Sesión</p> */}
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <div className="tr-flex-1 tr-flex tr-flex-col">
          <main className="tr-flex-1 tr-overflow-y-auto tr-p-8">
            <div className="tr-max-w-7xl tr-mx-auto tr-space-y-8">
              {/* PageHeading */}
              <div className="tr-flex tr-flex-wrap tr-justify-between tr-items-center tr-gap-4">
                <div>
                  <p className="tr-text-3xl tr-font-bold tr-leading-tight tr-tracking-tight">
                    {user ? `¡Bienvenido de nuevo, ${user.name}!` : '¡Bienvenido a TerraceAdmin!'}
                  </p>
                  <p className="tr-text-text-muted-light tr-text-base tr-font-normal">
                    Aquí tienes un resumen de tu actividad.
                  </p>
                </div>
                <a href="/host/DocumentVerification">
                  <button className="tr-flex tr-items-center tr-justify-center tr-rounded-lg tr-h-10 tr-px-4 tr-bg-primary tr-text-white tr-text-sm tr-font-bold tr-shadow-sm tr-hover-bg-primary-dark">
                    <span className="material-symbols-outlined tr-mr-2"></span>
                    <span className="tr-truncate">Subir permisos</span>
                  </button>
                </a>
              </div>

              {/* Profile & Subscription */}
              <div className="tr-grid tr-grid-cols-1 tr-lg-grid-cols-3 tr-gap-6">
                <div className="tr-lg-col-span-2 tr-bg-card-light tr-p-6 tr-rounded-xl tr-border tr-border-border-light tr-flex tr-items-center tr-gap-6">
                  <div 
                    className="tr-bg-center tr-bg-no-repeat tr-aspect-square tr-bg-cover tr-rounded-full tr-size-24 tr-flex-shrink-0" 
                    
                  ></div>
                  <div className="tr-flex-grow">
                    <div className="tr-flex tr-justify-between tr-items-start">
                      <div>
                        <h1 className="tr-text-xl tr-font-bold">{userData.name || 'Usuario'}</h1>
                        <p className="tr-text-text-muted-light tr-text-sm">{userData.email || 'user@example.com'}</p>
                        {/* <p className="tr-text-text-muted-light tr-text-sm tr-mt-1">
                          Miembro desde: {userData.memberSince}
                        </p> */}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* <div className="tr-bg-card-light tr-p-6 tr-rounded-xl tr-border tr-border-border-light tr-flex tr-flex-col tr-justify-center">
                  <div className="tr-flex tr-items-center tr-gap-2">
                    <span className="material-symbols-outlined tr-text-secondary"></span>
                    <p className="tr-font-bold tr-text-lg">Miembro Pro</p>
                  </div>
                  <p className="tr-text-text-muted-light tr-text-sm tr-mt-1">
                    Renueva el: 31 Dic, 2024
                  </p>
                  <a href="/host/MembershipPlans">
                    <button className="tr-mt-4 tr-w-full tr-flex tr-items-center tr-justify-center tr-rounded-lg tr-h-9 tr-px-4 tr-bg-primary-10 tr-text-primary tr-text-sm tr-font-bold tr-hover-bg-primary-20">
                      <span className="material-symbols-outlined tr-mr-2"></span>
                      Gestionar Suscripción
                    </button>
                  </a>
                </div> */}
              </div>

              {/* Stats - Ahora con datos reales */}
              <div className="tr-grid tr-grid-cols-1 tr-sm-grid-cols-2 tr-lg-grid-cols-4 tr-gap-6">
                {statsData.map((stat, index) => (
                  <div key={index} className="tr-flex tr-flex-col tr-gap-2 tr-rounded-xl tr-p-6 tr-border tr-border-border-light tr-bg-card-light">
                    <div className="tr-flex tr-items-center tr-gap-2">
                      <span className={`material-symbols-outlined tr-text-${stat.color}`}>
                        {stat.icon}
                      </span>
                      <p className="tr-text-base tr-font-medium tr-text-text-muted-light">{stat.title}</p>
                    </div>
                    <p className="tr-tracking-tight tr-text-3xl tr-font-bold">{stat.value}</p>
                    <p className={`tr-text-${stat.color} tr-text-sm tr-font-medium tr-flex tr-items-center`}>
                      <span className="material-symbols-outlined tr-text-base"></span>
                      {stat.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* My Terraces List - Ahora con datos reales */}
              <div>
                <div className="tr-flex tr-justify-between tr-items-center tr-mb-4">
                  <h2 className="tr-text-xl tr-font-bold tr-leading-tight tr-tracking-tight">
                    Mis Terrazas Publicadas ({publishedTerraces})
                  </h2>
                  {pendingTerraces > 0 && (
                    <div className="tr-text-accent tr-text-sm tr-font-medium">
                      {pendingTerraces} terraza(s) en revisión
                    </div>
                  )}
                </div>
                
                {loadingTerrazas ? (
                  <div className="tr-bg-card-light tr-rounded-xl tr-border tr-border-border-light tr-p-8 tr-text-center">
                    <div className="tr-text-lg">Cargando terrazas...</div>
                  </div>
                ) : approvedTerrazas.length > 0 ? (
                  <div className="tr-bg-card-light tr-rounded-xl tr-border tr-border-border-light tr-overflow-hidden">
                    <div className="tr-overflow-x-auto">
                      <table className="tr-w-full tr-text-sm tr-text-left">
                        <thead className="tr-bg-background-light tr-text-xs tr-uppercase tr-text-text-muted-light">
                          <tr>
                            <th className="tr-px-6 tr-py-3" scope="col">Nombre de la Terraza</th>
                            <th className="tr-px-6 tr-py-3" scope="col">Ubicación</th>
                            <th className="tr-px-6 tr-py-3" scope="col">Capacidad</th>
                            <th className="tr-px-6 tr-py-3" scope="col">Precio</th>
                            <th className="tr-px-6 tr-py-3" scope="col"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {approvedTerrazas.map((terraza) => (
                            <tr key={terraza._id} className="tr-border-b tr-border-border-light tr-hover-bg-background-light">
                              <td className="tr-px-6 tr-py-4 tr-font-medium">
                                <div className="tr-flex tr-items-center tr-gap-4">
                                  <div 
                                    className="tr-bg-center tr-bg-no-repeat tr-aspect-video tr-bg-cover tr-rounded tr-w-20 tr-h-12" 
                                    style={{backgroundImage: `url("${getTerrazaImage(terraza)}")`}}
                                  ></div>
                                  <div>
                                    <span>{terraza.terraceData.name}</span>
                                    <div className="tr-text-text-muted-light tr-text-xs">
                                      {terraza.terraceData.amenities.slice(0, 2).join(', ')}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="tr-px-6 tr-py-4">
                                <span className="tr-text-text-muted-light">
                                  {terraza.terraceData.location}
                                </span>
                              </td>
                              <td className="tr-px-6 tr-py-4 tr-font-medium">
                                <div className="tr-flex tr-items-center tr-gap-2">
                                  <span className="material-symbols-outlined tr-text-sm"></span>
                                  {terraza.terraceData.capacity} personas
                                </div>
                              </td>
                              <td className="tr-px-6 tr-py-4 tr-font-medium">
                                <div className="tr-flex tr-items-center tr-gap-2">
                                  <span className="material-symbols-outlined tr-text-sm"></span>
                                  ${terraza.terraceData.price}/hora
                                </div>
                              </td>
                              <td className="tr-px-6 tr-py-4 tr-text-right">
                                <button 
                                  className="tr-font-medium tr-text-primary tr-hover-underline tr-flex tr-items-center tr-gap-1"
                                  onClick={() => window.location.href = '/host/MyTerraces'}
                                >
                                  <span className="material-symbols-outlined tr-text-base"></span>
                                  Gestionar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="tr-bg-card-light tr-rounded-xl tr-border tr-border-border-light tr-p-8 tr-text-center">
                    <div className="tr-flex tr-flex-col tr-items-center tr-gap-4">
                      <span className="material-symbols-outlined tr-text-4xl tr-text-text-muted-light"></span>
                      <h3 className="tr-text-lg tr-font-medium">No tienes terrazas publicadas</h3>
                      <p className="tr-text-text-muted-light">
                        {terrazas.length > 0 
                          ? 'Tus terrazas están en proceso de revisión' 
                          : 'Comienza subiendo tu primera terraza'
                        }
                      </p>
                      <a href="/host/DocumentVerification">
                        <button className="tr-flex tr-items-center tr-justify-center tr-rounded-lg tr-h-10 tr-px-4 tr-bg-primary tr-text-white tr-text-sm tr-font-bold tr-shadow-sm tr-hover-bg-primary-dark tr-mt-4">
                          <span className="material-symbols-outlined tr-mr-2"></span>
                          {terrazas.length > 0 ? 'Ver mis terrazas' : 'Subir primera terraza'}
                        </button>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen de Estado de Terrazas */}
              {terrazas.length > 0 && (
                <div className="tr-bg-card-light tr-rounded-xl tr-border tr-border-border-light tr-p-6">
                  <h3 className="tr-text-lg tr-font-bold tr-mb-4">Resumen de Estado</h3>
                  <div className="tr-grid tr-grid-cols-1 tr-md-grid-cols-3 tr-gap-4">
                    <div className="tr-flex tr-items-center tr-gap-3">
                      <div className="tr-w-3 tr-h-3 tr-bg-secondary tr-rounded-full"></div>
                      <span className="tr-text-sm">
                        <strong>{publishedTerraces}</strong> Publicadas
                      </span>
                    </div>
                    <div className="tr-flex tr-items-center tr-gap-3">
                      <div className="tr-w-3 tr-h-3 tr-bg-accent tr-rounded-full"></div>
                      <span className="tr-text-sm">
                        <strong>{pendingTerraces}</strong> En revisión
                      </span>
                    </div>
                    <div className="tr-flex tr-items-center tr-gap-3">
                      <div className="tr-w-3 tr-h-3 tr-bg-gray-400 tr-rounded-full"></div>
                      <span className="tr-text-sm">
                        <strong>{rejectedTerraces}</strong> Rechazadas
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default TerraceAdmin;