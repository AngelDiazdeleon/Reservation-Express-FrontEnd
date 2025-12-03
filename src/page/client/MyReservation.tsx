// src/pages/client/MyReservations.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservationApi } from '../../api'; // Importa específicamente la API de reservas
import '../css/clientcss/MyReservations.css';

const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'todas' | 'eventos' | 'visitas'>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('30-dias');
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchReservations();
    
    // Cerrar menú al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, activeTab, searchTerm, timeFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usa la API específica para reservas
      const response = await reservationApi.getMyReservations();
      
      console.log('📋 Respuesta de la API:', response.data);
      
      if (response.data.success) {
        const sortedReservations = (response.data.data || [])
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReservations(sortedReservations);
      } else {
        setError(response.data.message || 'Error al obtener reservas');
      }
    } catch (error: any) {
      console.error('❌ Error al obtener reservas:', error);
      setError('No se pudieron cargar las reservas. Verifica tu conexión.');
      
      // Si es error 401, redirigir a login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(res => 
        res.terrazaNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por tipo
    if (activeTab === 'eventos') {
      filtered = filtered.filter(res => !res.esVisita);
    } else if (activeTab === 'visitas') {
      filtered = filtered.filter(res => res.esVisita);
    }
    
    // Filtrar por tiempo
    const now = new Date();
    switch(timeFilter) {
      case '30-dias':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(res => new Date(res.createdAt) >= thirtyDaysAgo);
        break;
      case '3-meses':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filtered = filtered.filter(res => new Date(res.createdAt) >= threeMonthsAgo);
        break;
      // 'todo' no necesita filtro
    }
    
    setFilteredReservations(filtered);
  };

  const formatDate = (dateString: string) => {
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

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const getStatusInfo = (estado: string, esVisita: boolean) => {
    if (esVisita) {
      switch(estado) {
        case 'pendiente':
          return {
            text: 'Pendiente',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            dotColor: 'bg-yellow-500'
          };
        case 'confirmada':
          return {
            text: 'Confirmada',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            dotColor: 'bg-green-500'
          };
        case 'cancelada':
          return {
            text: 'Cancelada',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            dotColor: 'bg-red-500'
          };
        default:
          return {
            text: 'Solicitada',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            dotColor: 'bg-blue-500'
          };
      }
    } else {
      switch(estado) {
        case 'pendiente':
          return {
            text: 'Pendiente',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            dotColor: 'bg-yellow-500'
          };
        case 'confirmada':
          return {
            text: 'Confirmada',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            dotColor: 'bg-green-500'
          };
        case 'cancelada':
          return {
            text: 'Cancelada',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            dotColor: 'bg-red-500'
          };
        case 'completada':
          return {
            text: 'Completada',
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-600',
            dotColor: 'bg-teal-500'
          };
        default:
          return {
            text: estado,
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-600',
            dotColor: 'bg-gray-500'
          };
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }
    
    try {
      await reservationApi.cancelReservation(id);
      alert('Reserva cancelada exitosamente');
      fetchReservations(); // Recargar las reservas
    } catch (error: any) {
      console.error('Error al cancelar:', error);
      alert(error.response?.data?.message || 'No se pudo cancelar la reserva');
    }
  };

  const handleContactHost = (terrazaId: string) => {
    console.log('Contactar al anfitrión de terraza:', terrazaId);
    alert('Funcionalidad de contacto en desarrollo');
  };

  const handleLeaveReview = (terrazaId: string) => {
    console.log('Dejar reseña para terraza:', terrazaId);
    alert('Funcionalidad de reseñas en desarrollo');
  };

  const handleReBook = (terrazaId: string) => {
    navigate(`/client/terraza/${terrazaId}`);
  };

  // Separar reservas activas e historial
  const activeReservations = filteredReservations.filter(res => 
    res.estado === 'pendiente' || res.estado === 'confirmada'
  );
  
  const historyReservations = filteredReservations.filter(res => 
    res.estado === 'completada' || res.estado === 'cancelada'
  );

  // Estado de carga mejorado
  if (loading) {
    return (
      <div className="my-reservations-container">
        <header className="app-header">
          <div className="header-container">
            <div className="logo-section">
              <div className="logo">
                <span className="material-symbols-outlined">terrace</span>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h1>TerrazaApp</h1>
                </Link>
              </div>
            </div>
            
            <nav className="nav-section">
              <div className="nav-links">
                <Link className="nav-link" to="/client/home">Explorar</Link>
                <Link className="nav-link active" to="/client/reservations">Reservaciones</Link>
              </div>
              
              <div className="user-section" ref={userMenuRef}>
                {user ? (
                  <div 
                    className="user-profile"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="avatar">
                      <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    </div>
                    <span className="user-name">{user.name}</span>
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <Link to="/login" className="login-btn">Iniciar Sesión</Link>
                    <Link to="/register" className="register-btn">Registrarse</Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </header>
        
        <main className="my-reservations-main">
          <div className="container">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando tus reservas...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="my-reservations-container">
        <header className="app-header">
          <div className="header-container">
            <div className="logo-section">
              <div className="logo">
                <span className="material-symbols-outlined">terrace</span>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h1>TerrazaApp</h1>
                </Link>
              </div>
            </div>
            
            <nav className="nav-section">
              <div className="nav-links">
                <Link className="nav-link" to="/client/home">Explorar</Link>
                <Link className="nav-link active" to="/client/reservations">Reservaciones</Link>
              </div>
              
              <div className="user-section" ref={userMenuRef}>
                {user ? (
                  <div 
                    className="user-profile"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="avatar">
                      <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    </div>
                    <span className="user-name">{user.name}</span>
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <Link to="/login" className="login-btn">Iniciar Sesión</Link>
                    <Link to="/register" className="register-btn">Registrarse</Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </header>
        
        <main className="my-reservations-main">
          <div className="container">
            <div className="error-state">
              <div className="error-icon">
                <span className="material-symbols-outlined">error</span>
              </div>
              <h3>Error al cargar reservas</h3>
              <p>{error}</p>
              <button 
                onClick={fetchReservations}
                className="btn-primary mt-4"
              >
                Reintentar
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="my-reservations-container">
      <header className="app-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <span className="material-symbols-outlined">terrace</span>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1>TerrazaApp</h1>
              </Link>
            </div>
          </div>
          
          <nav className="nav-section">
            <div className="nav-links">
              <Link className="nav-link" to="/client/home">Explorar</Link>
              <Link className="nav-link active" to="/client/reservations">Reservaciones</Link>
            </div>
            
            <div className="user-section" ref={userMenuRef}>
              {user ? (
                <div 
                  className="user-profile"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="avatar">
                    <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                  <span className="user-name">{user.name}</span>
                  
                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <Link className="dropdown-item" to="/client/profile">
                        <span className="material-symbols-outlined">person</span>
                        Mi Perfil
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={handleLogout} type="button">
                        <span className="material-symbols-outlined">logout</span>
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="login-btn">Iniciar Sesión</Link>
                  <Link to="/register" className="register-btn">Registrarse</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="my-reservations-main">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Mis Reservas</h1>
            <p className="page-subtitle">Visualiza y gestiona tus reservas activas y pasadas.</p>
            <p className="text-sm text-gray-600 mt-2">
              Mostrando {filteredReservations.length} de {reservations.length} reservas
            </p>
          </div>

          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'todas' ? 'active' : ''}`}
                onClick={() => setActiveTab('todas')}
              >
                Todas ({reservations.length})
              </button>
              <button 
                className={`tab ${activeTab === 'eventos' ? 'active' : ''}`}
                onClick={() => setActiveTab('eventos')}
              >
                Reservas de Eventos ({reservations.filter(r => !r.esVisita).length})
              </button>
              <button 
                className={`tab ${activeTab === 'visitas' ? 'active' : ''}`}
                onClick={() => setActiveTab('visitas')}
              >
                Citas para Visitas ({reservations.filter(r => r.esVisita).length})
              </button>
            </div>
          </div>

          <div className="filters-container">
            <div className="search-box">
              <span className="search-icon material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Buscar por nombre de terraza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="select-wrapper">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="time-select"
              >
                <option value="30-dias">Próximos 30 días</option>
                <option value="3-meses">Próximos 3 meses</option>
                <option value="todo">Todo el historial</option>
              </select>
              <span className="select-arrow material-symbols-outlined"></span>
            </div>
          </div>

          {/* Reservas Activas */}
          {activeReservations.length > 0 && (
            <section className="reservations-section">
              <h2 className="section-title">
                Reservas Activas 
                <span className="badge-count">{activeReservations.length}</span>
              </h2>
              <div className="reservations-grid">
                {activeReservations.map((res) => {
                  const status = getStatusInfo(res.estado, res.esVisita);
                  return (
                    <div key={res._id} className="reservation-card">
                      <div className="card-header">
                        <div>
                          <p className="card-type">
                            {res.esVisita ? '🎯 CITA PARA VISITA' : '🎉 EVENTO'}
                          </p>
                          <h3 className="card-title">{res.terrazaNombre}</h3>
                        </div>
                        <div className={`status-badge ${status.bgColor} ${status.textColor}`}>
                          <span className={`status-dot ${status.dotColor}`}></span>
                          {status.text}
                        </div>
                      </div>
                      
                      <div className="card-details">
                        <div className="detail-item">
                          <span className="material-symbols-outlined">Fecha</span>
                          <span>{formatDate(res.fechaReserva)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="material-symbols-outlined">Hora</span>
                          <span>
                            {formatTime(res.horaInicio)} - {formatTime(res.horaFin)}
                          </span>
                        </div>
                        {res.tipoEvento && !res.esVisita && (
                          <div className="detail-item">
                            <span className="material-symbols-outlined">celebration</span>
                            <span>{res.tipoEvento}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-actions">
                        {res.estado === 'pendiente' ? (
                          <button 
                            className="btn-secondary"
                            onClick={() => handleCancel(res._id)}
                          >
                            Cancelar {res.esVisita ? 'Cita' : 'Reserva'}
                          </button>
                        ) : (
                          <button 
                            className="btn-secondary"
                            onClick={() => handleContactHost(res.terrazaId)}
                          >
                            Contactar Anfitrión
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Historial de Reservas */}
          {historyReservations.length > 0 && (
            <section className="reservations-section">
              <h2 className="section-title">
                Historial de Reservas
                <span className="badge-count">{historyReservations.length}</span>
              </h2>
              <div className="reservations-grid">
                {historyReservations.map((res) => {
                  const status = getStatusInfo(res.estado, res.esVisita);
                  return (
                    <div key={res._id} className="reservation-card">
                      <div className="card-header">
                        <div>
                          <p className="card-type">
                            {res.esVisita ? '🎯 CITA PARA VISITA' : '🎉 EVENTO'}
                          </p>
                          <h3 className="card-title">{res.terrazaNombre}</h3>
                        </div>
                        <div className={`status-badge ${status.bgColor} ${status.textColor}`}>
                          <span className={`status-dot ${status.dotColor}`}></span>
                          {status.text}
                        </div>
                      </div>
                      
                      <div className="card-details">
                        <div className="detail-item">
                          <span className="material-symbols-outlined">calendar_today</span>
                          <span>{formatDate(res.fechaReserva)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="material-symbols-outlined">schedule</span>
                          <span>
                            {formatTime(res.horaInicio)} - {formatTime(res.horaFin)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        {res.estado === 'completada' ? (
                          <>
                            <button 
                              className="btn-primary"
                              onClick={() => handleReBook(res.terrazaId)}
                            >
                              Volver a Reservar
                            </button>
                            <button 
                              className="btn-secondary"
                              onClick={() => handleLeaveReview(res.terrazaId)}
                            >
                              Dejar Reseña
                            </button>
                          </>
                        ) : (
                          <button 
                            className="btn-secondary"
                            onClick={() => navigate(`/client/reservation/${res._id}`)}
                          >
                            Ver Detalles
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Estado vacío */}
          {filteredReservations.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <span className="material-symbols-outlined">Eventos</span>
              </div>
              <h3>Aún no tienes reservas activas</h3>
              <p>Parece que no tienes ningún evento o cita programada. ¡Encuentra el lugar perfecto para tu próximo evento!</p>
              <Link to="/client/home" className="btn-explore">
                <span className="material-symbols-outlined"></span>
                Explorar Terrazas
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyReservations;