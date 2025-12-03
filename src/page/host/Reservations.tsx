import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../../api';
import '../css/hostcss/ReservationHost.css';

interface Notification {
  id: number;
  type: 'reservation' | 'reminder' | 'cancellation' | 'payment' | string;
  message: string;
  read: boolean;
  time?: string;
}

interface Reservation {
  _id: string;
  clienteId: string;
  terrazaId: string;
  terrazaNombre: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  tipoEvento: string;
  descripcion: string;
  numPersonas: number;
  esVisita: boolean;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  precioTotal: number;
  ubicacion: string;
  capacidad: number;
  propietarioNombre: string;
  duracionVisita: number;
  nombreCliente: string;
  emailCliente: string;
  phoneCliente: string;
  comentarios: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

const ReservationsHost: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('reservaciones');
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('pendiente');
  const [filterDateRange, setFilterDateRange] = useState<string>('30d');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [actionType, setActionType] = useState<string>('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const userData = JSON.parse(localStorage.getItem('user') || '{}') as User;
          setUser(userData);
          
          if (userData?.role !== 'host') {
            alert('Acceso restringido a hosts');
            window.location.href = '/login';
            return;
          }
          
          const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
          if (savedNotifications.length > 0) {
            setNotifications(savedNotifications);
            const unreadCount = savedNotifications.filter(n => !n.read).length;
            setUnreadNotifications(unreadCount);
          }
          
          await fetchHostReservations();
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

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

  const fetchHostReservations = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('📡 Obteniendo reservas para host...');
      const response = await api.get('/reservations/host/reservations');
      console.log('✅ Respuesta del servidor:', response.data);
      if (response.data.success) {
        setReservations(response.data.data || []);
      } else {
        setReservations(mockReservations);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setReservations(mockReservations);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: 'confirmada' | 'cancelada'): Promise<boolean> => {
    try {
      let endpoint = '';
      
      switch(newStatus) {
        case 'confirmada':
          endpoint = `/reservations/${reservationId}/approve`;
          break;
        case 'cancelada':
          endpoint = `/reservations/${reservationId}/reject`;
          break;
        default:
          throw new Error('Estado no válido');
      }

      console.log(`🌐 Llamando a endpoint: ${endpoint}`);
      console.log(`🔑 Token: ${localStorage.getItem('token')}`);
      
      const response = await api.put(endpoint);
      console.log('✅ Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        setReservations(prev => prev.map(res => 
          res._id === reservationId ? { ...res, estado: newStatus } : res
        ));
        
        const reservation = reservations.find(r => r._id === reservationId);
        if (reservation) {
          addNotification({
            type: 'reservation',
            message: `Has ${newStatus === 'confirmada' ? 'aprobado' : 'rechazado'} la reserva en ${reservation.terrazaNombre}`,
            read: false
          });
        }
        
        alert(`Reserva ${newStatus === 'confirmada' ? 'aprobada' : 'rechazada'} exitosamente`);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error(`Error actualizando reserva:`, error);
      console.error('Detalles del error:', error.response?.data || error.message);
      alert(`Error al ${newStatus === 'confirmada' ? 'aprobar' : 'rechazar'} la reserva: ${error.response?.data?.message || error.message}`);
      return false;
    }
  };

  const handleApproveReservation = async (reservationId: string): Promise<void> => {
    const reservation = reservations.find(r => r._id === reservationId);
    if (!reservation) return;
    
    setSelectedReservation(reservation);
    setActionType('approve');
    setShowActionModal(true);
  };

  const handleRejectReservation = async (reservationId: string): Promise<void> => {
    const reservation = reservations.find(r => r._id === reservationId);
    if (!reservation) return;
    
    setSelectedReservation(reservation);
    setActionType('reject');
    setShowActionModal(true);
  };

  const confirmAction = async (): Promise<void> => {
    if (!selectedReservation) return;
    
    const newStatus = actionType === 'approve' ? 'confirmada' : 'cancelada';
    const success = await updateReservationStatus(selectedReservation._id, newStatus as 'confirmada' | 'cancelada');
    
    if (success) {
      setShowActionModal(false);
      setSelectedReservation(null);
      setActionType('');
    }
  };

  const handleShowDetails = (reservation: Reservation): void => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const handleMarkAllAsRead = (): void => {
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: true
    }));
    setNotifications(updatedNotifications);
    setUnreadNotifications(0);
  };

  const handleMarkAsRead = (notificationId: number): void => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    setUnreadNotifications(unreadCount);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'time'>): void => {
    const newNotification: Notification = {
      id: Date.now(),
      ...notification,
      time: 'Ahora mismo'
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    setUnreadNotifications(prev => prev + 1);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('notifications');
    window.location.href = '/login';
  };

  const getInitial = (): string => {
    if (!user || !user.name) return 'H';
    return user.name.charAt(0).toUpperCase();
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'reservation': return 'event_available';
      case 'reminder': return 'notifications';
      case 'cancellation': return 'event_busy';
      case 'payment': return 'payments';
      default: return 'notifications';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pendiente': return 'status-indicator-pending';
      case 'confirmada': return 'status-indicator-confirmed';
      case 'cancelada': return 'status-indicator-cancelled';
      case 'completada': return 'status-indicator-completed';
      default: return 'status-indicator-pending';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Aprobada';
      case 'cancelada': return 'Rechazada';
      case 'completada': return 'Completada';
      default: return status || 'Desconocido';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pendiente': return 'Pendientes';
      case 'confirmada': return 'Aprobadas';
      case 'cancelada': return 'Rechazadas';
      case 'all': return 'Todas';
      default: return status;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (!reservation) return false;
    
    const matchesSearch = searchTerm === '' || 
      (reservation.terrazaNombre && reservation.terrazaNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reservation.nombreCliente && reservation.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = false;
    if (filterStatus === 'all') {
      matchesStatus = true;
    } else {
      matchesStatus = reservation.estado === filterStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    return timeString;
  };

  const mockReservations: Reservation[] = [
    {
      _id: '692fed5a1234567890abcdef',
      clienteId: '123',
      terrazaId: '1',
      terrazaNombre: 'Terraza del Sol',
      fechaReserva: '2024-12-25T16:00:00.000Z',
      horaInicio: '16:00',
      horaFin: '22:00',
      tipoEvento: 'Fiesta',
      descripcion: 'Fiesta de Navidad',
      numPersonas: 50,
      esVisita: false,
      estado: 'pendiente',
      precioTotal: 1500,
      ubicacion: 'Ciudad de México',
      capacidad: 100,
      propietarioNombre: 'Juan Pérez',
      duracionVisita: 0,
      nombreCliente: 'María García',
      emailCliente: 'maria@email.com',
      phoneCliente: '555-1234',
      comentarios: 'Quiero hacer una fiesta para mi familia',
      createdAt: '2024-11-15T10:00:00.000Z',
      updatedAt: '2024-11-15T10:00:00.000Z'
    },
    {
      _id: '2',
      clienteId: '124',
      terrazaId: '1',
      terrazaNombre: 'Terraza del Sol',
      fechaReserva: '2024-12-10T11:30:00.000Z',
      horaInicio: '11:30',
      horaFin: '13:00',
      tipoEvento: 'Visita',
      descripcion: 'Visita de reconocimiento',
      numPersonas: 2,
      esVisita: true,
      estado: 'pendiente',
      precioTotal: 0,
      ubicacion: 'Ciudad de México',
      capacidad: 100,
      propietarioNombre: 'Juan Pérez',
      duracionVisita: 1.5,
      nombreCliente: 'Carlos López',
      emailCliente: 'carlos@email.com',
      phoneCliente: '555-5678',
      comentarios: 'Quiero ver la terraza para mi boda',
      createdAt: '2024-11-14T14:30:00.000Z',
      updatedAt: '2024-11-14T14:30:00.000Z'
    }
  ];

  return (
    <div className="host-reservations-panel">
      <header className="host-header-section">
        <div className="header-container">
          <div className="logo-brand-section">
            <div className="brand-logo">
              <span className="material-symbols-outlined">Reservation</span>
              <h1>Express</h1>
            </div>
          </div>
          
          <nav className="header-navigation">
            <div className="user-actions-section" ref={userMenuRef}>
              <div className="notifications-wrapper" ref={notificationsRef}>
                
                {notificationsOpen && (
                  <div className="notifications-panel">
                    <div className="notifications-header">
                      <h3>Notificaciones</h3>
                      {unreadNotifications > 0 && (
                        <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    <div className="notifications-list">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-entry ${notification.read ? '' : 'notification-unread'}`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="notification-icon-wrapper">
                            <span className="material-symbols-outlined">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                          <div className="notification-content-wrapper">
                            <p className="notification-text">{notification.message}</p>
                            <span className="notification-timestamp">{notification.time || ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {user ? (
                <div 
                  className="user-profile-section"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="user-avatar">
                    <span>{getInitial()}</span>
                  </div>
                  <span className="user-display-name">{user.name || 'Host'}</span>
                  <span className="user-role-badge">Host</span>
                  
                  {userMenuOpen && (
                    <div className="user-options-panel">
                      <a className="option-item" href="/host/profile">
                        <span className="material-symbols-outlined"></span>
                        Mi Perfil
                      </a>

                      <div className="options-divider"></div>
                      <a className="option-item" onClick={handleLogout}>
                        <span className="material-symbols-outlined"></span>
                        Cerrar Sesión
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="authentication-buttons">
                  <a href="/login" className="login-button">Iniciar Sesión</a>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="host-content-layout">
        <aside className="host-sidebar-panel">
          <div className="sidebar-inner">
            <div className="sidebar-header-section">
              <div className="sidebar-logo-brand">
                <span className="material-symbols-outlined">Resevation</span>
                <h2>Express</h2>
              </div>
            </div>
            {/* -------------------------------------- */}
            <nav className="sidebar-navigation">
  <a 
    className={`navigation-link ${activeMenu === 'inicio' ? 'navigation-active' : ''}`}
    href="/host/dashboard"
    onClick={(e) => {
      e.preventDefault();
      setActiveMenu('inicio');
      setTimeout(() => {
        window.location.href = "/host/dashboard";
      }, 0);
    }}
  >
    <span className="material-symbols-outlined"></span>
    <span className="link-text">Inicio</span>
  </a>

  <a 
    className={`navigation-link ${activeMenu === 'terrazas' ? 'navigation-active' : ''}`}
    href="/host/MyTerraces"
    onClick={(e) => {
      e.preventDefault();
      setActiveMenu('terrazas');
      setTimeout(() => {
        window.location.href = "/host/MyTerraces";
      }, 0);
    }}
  >
    <span className="material-symbols-outlined"></span>
    <span className="link-text">Mis Terrazas</span>
  </a>

  <a 
    className={`navigation-link ${activeMenu === 'reservaciones' ? 'navigation-active' : ''}`}
    href="/host/Reservation"
    onClick={(e) => {
      e.preventDefault();
      setActiveMenu('reservaciones');
      setTimeout(() => {
        window.location.href = "/host/Reservation";
      }, 0);
    }}
  >
    <span className="material-symbols-outlined"></span>
    <span className="link-text">Reservaciones</span>
    <span className="navigation-counter">
      {reservations.filter(r => r.estado === 'pendiente').length}
    </span>
  </a>

  <a 
    className={`navigation-link ${activeMenu === 'mensajes' ? 'navigation-active' : ''}`}
    href="/host/DocumentVerification"
    onClick={(e) => {
      e.preventDefault();
      setActiveMenu('mensajes');
      setTimeout(() => {
        window.location.href = "/host/DocumentVerification";
      }, 0);
    }}
  >
    <span className="material-symbols-outlined"></span>
    <span className="link-text">Subir Permisos</span>
  </a>
            </nav>
          </div>
        </aside>

        <main className="host-main-content">
          <div className="content-title-section">
            <h1 className="primary-title">Gestión de Reservaciones</h1>
            <p className="content-subtitle">Administra y gestiona las reservas de tus terrazas</p>
          </div>

          <div className="statistics-grid">
            <div className="statistic-card">
              <div className="stat-icon-container pending-stat">
                <span className="material-symbols-outlined">Pendiente</span>
              </div>
              <div className="statistic-details">
                <h3 className="statistic-value">
                  {reservations.filter(r => r.estado === 'pendiente').length}
                </h3>
                <p className="statistic-label">Pendientes</p>
              </div>
            </div>
            <div className="statistic-card">
              <div className="stat-icon-container confirmed-stat">
                <span className="material-symbols-outlined">Aprovado</span>
              </div>
              <div className="statistic-details">
                <h3 className="statistic-value">
                  {reservations.filter(r => r.estado === 'confirmada').length}
                </h3>
                <p className="statistic-label">Aprobadas</p>
              </div>
            </div>
            <div className="statistic-card">
              <div className="stat-icon-container cancelled-stat">
                <span className="material-symbols-outlined">Cancelado</span>
              </div>
              <div className="statistic-details">
                <h3 className="statistic-value">
                  {reservations.filter(r => r.estado === 'cancelada').length}
                </h3>
                <p className="statistic-label">Rechazadas</p>
              </div>
            </div>
            <div className="statistic-card">
              <div className="stat-icon-container total-stat">
                <span className="material-symbols-outlined">Todas</span>
              </div>
              <div className="statistic-details">
                <h3 className="statistic-value">{reservations.length}</h3>
                <p className="statistic-label">Total</p>
              </div>
            </div>
          </div>

          <div className="filter-tabs-container">
            {['pendiente', 'confirmada', 'cancelada', 'all'].map((status) => (
              <button
                key={status}
                className={`filter-tab ${filterStatus === status ? 'tab-active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>

          <div className="search-filters-container">
            <div className="search-container">
              <span className="material-symbols-outlined search-icon"></span>
              <input
                type="text"
                className="search-field"
                placeholder="Buscar por nombre de cliente o terraza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando reservas...</p>
            </div>
          ) : (
            <>
              {filteredReservations.length > 0 ? (
                <section className="reservations-display-section">
                  <div className="reservations-grid-layout">
                    {filteredReservations.map((reservation) => (
                      <div
                        key={reservation._id}
                        className="reservation-item-card"
                      >
                        <div className="card-header-section">
                          <div className="card-title-section">
                            <p className="card-subtitle-text">
                              {reservation.esVisita ? 'Cita para Visita' : 'Evento'}
                            </p>
                            <h3 className="card-main-title">{reservation.terrazaNombre || 'Sin nombre'}</h3>
                          </div>
                          <div className={`status-indicator ${getStatusColor(reservation.estado)}`}>
                            <span className="status-dot"></span>
                            {getStatusText(reservation.estado)}
                          </div>
                        </div>

                        <div className="card-details-section">
                          <div className="detail-row">
                            <span className="material-symbols-outlined detail-icon">person</span>
                            <span className="detail-text-content">{reservation.nombreCliente || 'Cliente no disponible'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="material-symbols-outlined detail-icon">calendar_today</span>
                            <span className="detail-text-content">{formatDate(reservation.fechaReserva)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="material-symbols-outlined detail-icon">schedule</span>
                            <span className="detail-text-content">
                              {formatTime(reservation.horaInicio)} - {formatTime(reservation.horaFin)}
                            </span>
                          </div>
                          {reservation.numPersonas > 0 && (
                            <div className="detail-row">
                              <span className="material-symbols-outlined detail-icon">groups</span>
                              <span className="detail-text-content">{reservation.numPersonas} personas</span>
                            </div>
                          )}
                        </div>

                        <div className="card-actions-section">
                          <button 
                            className="action-button primary-action"
                            onClick={() => handleShowDetails(reservation)}
                          >
                            Ver Detalles
                          </button>
                          
                          {reservation.estado === 'pendiente' && (
                            <>
                              <button 
                                className="action-button success-action"
                                onClick={() => handleApproveReservation(reservation._id)}
                              >
                                <span className="material-symbols-outlined"></span>
                                Aprobar
                              </button>
                              <button 
                                className="action-button danger-action"
                                onClick={() => handleRejectReservation(reservation._id)}
                              >
                                <span className="material-symbols-outlined"></span>
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="empty-state-container">
                  <div className="empty-icon-container">
                    <span className="material-symbols-outlined">event_busy</span>
                  </div>
                  <h3 className="empty-state-title">No se encontraron reservaciones</h3>
                  <p className="empty-state-message">
                    {searchTerm || filterStatus !== 'pendiente'
                      ? 'Intenta con otros términos de búsqueda o filtros'
                      : 'No tienes reservaciones pendientes'}
                  </p>
                </div>
              )}
            </>
          )}

          {showDetailsModal && selectedReservation && (
            <div className="modal-overlay-backdrop">
              <div className="modal-content-container">
                <div className="modal-header-section">
                  <h3 className="modal-title-text">Detalles de la Reserva</h3>
                  <button 
                    className="modal-close-button"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <span className="material-symbols-outlined">Cerrar</span>
                  </button>
                </div>
                
                <div className="modal-body-content">
                  <div className="details-section">
                    <h4 className="details-section-title">Información del Cliente</h4>
                    <div className="detail-info-row">
                      <strong>Nombre:</strong>
                      <span>{selectedReservation.nombreCliente || 'No disponible'}</span>
                    </div>
                    <div className="detail-info-row">
                      <strong>Email:</strong>
                      <span>{selectedReservation.emailCliente || 'No disponible'}</span>
                    </div>
                    <div className="detail-info-row">
                      <strong>Teléfono:</strong>
                      <span>{selectedReservation.phoneCliente || 'No disponible'}</span>
                    </div>
                  </div>

                  <div className="details-section">
                    <h4 className="details-section-title">Información de la Reserva</h4>
                    <div className="detail-info-row">
                      <strong>Terraza:</strong>
                      <span>{selectedReservation.terrazaNombre}</span>
                    </div>
                    <div className="detail-info-row">
                      <strong>Fecha:</strong>
                      <span>{formatDate(selectedReservation.fechaReserva)}</span>
                    </div>
                    <div className="detail-info-row">
                      <strong>Horario:</strong>
                      <span>
                        {formatTime(selectedReservation.horaInicio)} - {formatTime(selectedReservation.horaFin)}
                      </span>
                    </div>
                    <div className="detail-info-row">
                      <strong>Tipo:</strong>
                      <span>{selectedReservation.esVisita ? 'Cita para Visita' : 'Evento'}</span>
                    </div>
                    <div className="detail-info-row">
                      <strong>Estado:</strong>
                      <span className={`status-text-display ${getStatusColor(selectedReservation.estado)}`}>
                        {getStatusText(selectedReservation.estado)}
                      </span>
                    </div>
                    {selectedReservation.numPersonas > 0 && (
                      <div className="detail-info-row">
                        <strong>Número de personas:</strong>
                        <span>{selectedReservation.numPersonas}</span>
                      </div>
                    )}
                    {selectedReservation.precioTotal > 0 && (
                      <div className="detail-info-row">
                        <strong>Precio total:</strong>
                        <span>${selectedReservation.precioTotal}</span>
                      </div>
                    )}
                    {selectedReservation.descripcion && (
                      <div className="detail-info-row">
                        <strong>Descripción:</strong>
                        <span>{selectedReservation.descripcion}</span>
                      </div>
                    )}
                    {selectedReservation.comentarios && (
                      <div className="detail-info-row">
                        <strong>Comentarios:</strong>
                        <span>{selectedReservation.comentarios}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="modal-footer-section">
                  <button 
                    className="modal-button secondary-modal-button"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Cerrar
                  </button>
                  {selectedReservation.estado === 'pendiente' && (
                    <div className="modal-actions-container">
                      <button 
                        className="modal-button success-modal-button"
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleApproveReservation(selectedReservation._id);
                        }}
                      >
                        Aprobar
                      </button>
                      <button 
                        className="modal-button danger-modal-button"
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleRejectReservation(selectedReservation._id);
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showActionModal && selectedReservation && (
            <div className="modal-overlay-backdrop">
              <div className="modal-content-container confirmation-modal-container">
                <div className="modal-header-section">
                  <h3 className="modal-title-text">
                    {actionType === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                  </h3>
                </div>
                
                <div className="modal-body-content">
                  <div className="confirmation-icon-container">
                    <span className="material-symbols-outlined">
                      {actionType === 'approve' ? 'check_circle' : 'warning'}
                    </span>
                  </div>
                  <p className="confirmation-message-text">
                    {actionType === 'approve' 
                      ? `¿Estás seguro de que quieres aprobar la reserva de "${selectedReservation.nombreCliente}" para el ${formatDate(selectedReservation.fechaReserva)}?`
                      : `¿Estás seguro de que quieres rechazar la reserva de "${selectedReservation.nombreCliente}" para el ${formatDate(selectedReservation.fechaReserva)}?`}
                  </p>
                  <p className="confirmation-warning-text">
                    {actionType === 'approve'
                      ? 'Esta acción notificará al cliente que su reserva ha sido aprobada.'
                      : 'Esta acción notificará al cliente que su reserva ha sido rechazada.'}
                  </p>
                </div>
                
                <div className="modal-footer-section">
                  <button 
                    className="modal-button secondary-modal-button"
                    onClick={() => {
                      setShowActionModal(false);
                      setSelectedReservation(null);
                      setActionType('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className={`modal-button ${actionType === 'approve' ? 'success-modal-button' : 'danger-modal-button'}`}
                    onClick={confirmAction}
                  >
                    {actionType === 'approve' ? 'Sí, Aprobar' : 'Sí, Rechazar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReservationsHost;