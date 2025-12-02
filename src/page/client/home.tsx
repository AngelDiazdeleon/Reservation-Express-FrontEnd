import React, { useState, useRef, useEffect } from 'react';
import "../css/clientcss/home.css";

const TerrazaApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fecha, setFecha] = useState('');
  const [invitados, setInvitados] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [calificacionMin, setCalificacionMin] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [terrazas, setTerrazas] = useState([]);
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

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

  // Cargar terrazas y usuario al iniciar
  useEffect(() => {
    loadAllTerrazas();
    loadUserData();
  }, []);

  // Función para cargar todas las terrazas aprobadas desde la API
  const loadAllTerrazas = async () => {
    try {
      setLoading(true);
      console.log('📡 Cargando terrazas aprobadas...');
      
      const response = await fetch('http://localhost:4000/api/publication-requests/public/approved', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Terrazas cargadas:', data.data);
        setTerrazas(data.data);
      } else {
        console.error('❌ Error cargando terrazas:', data.message);
        // Usar datos de ejemplo si la API falla
        setTerrazas(getTerrazasEjemplo());
      }
    } catch (error) {
      console.error('💥 Error al cargar terrazas:', error);
      // Usar datos de ejemplo si hay error de conexión
      setTerrazas(getTerrazasEjemplo());
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar datos del usuario
  const loadUserData = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
  };

  // Datos de ejemplo por si falla la API
  const getTerrazasEjemplo = () => [
    {
      id: '1',
      nombre: "Terraza del Sol",
      ubicacion: "Colonia Roma Norte, CDMX",
      precio: 5000,
      calificacion: 4.8,
      capacidad: 50,
      imagen: "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=600&h=400&fit=crop",
      categoria: "popular",
      descripcion: "Amplia terraza con vista panorámica al atardecer"
    },
    {
      id: '2',
      nombre: "Jardín Secreto",
      ubicacion: "Polanco, CDMX",
      precio: 8000,
      calificacion: 4.9,
      capacidad: 30,
      imagen: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop",
      categoria: "lujo",
      descripcion: "Elegante terraza con jardín privado y fuentes"
    },
    {
      id: '3',
      nombre: "Rooftop Panorámico",
      ubicacion: "Condesa, CDMX",
      precio: 6500,
      calificacion: 4.7,
      capacidad: 40,
      imagen: "https://images.unsplash.com/photo-1564013797767-2f7b0eb10aac?w=600&h=400&fit=crop",
      categoria: "moderno",
      descripcion: "Terraza moderna con vista espectacular de la ciudad"
    }
  ];

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // Funciones para manejar notificaciones
  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reserva': return 'event_available';
      case 'mensaje': return 'message';
      case 'recordatorio': return 'notification_important';
      case 'promocion': return 'local_offer';
      default: return 'notifications';
    }
  };

  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  // Filtrar terrazas
  const terrazasFiltradas = terrazas.filter(terraza => {
    const matchSearch = 
      searchQuery === '' ||
      terraza.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      terraza.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchUbicacion = 
      ubicacion === '' || 
      terraza.ubicacion.toLowerCase().includes(ubicacion.toLowerCase());
    
    const matchPrecioMin = 
      precioMin === '' || 
      terraza.precio >= parseInt(precioMin);
    
    const matchPrecioMax = 
      precioMax === '' || 
      terraza.precio <= parseInt(precioMax);
    
    const matchCalificacion = 
      calificacionMin === '' || 
      terraza.calificacion >= parseFloat(calificacionMin);
    
    const matchInvitados = 
      invitados === '' || 
      terraza.capacidad >= parseInt(invitados);
    
    const matchCategoria = 
      activeFilter === 'todos' || 
      terraza.categoria === activeFilter;
    
    return matchSearch && matchUbicacion && matchPrecioMin && 
           matchPrecioMax && matchCalificacion && matchInvitados && matchCategoria;
  });

  const limpiarFiltros = () => {
    setSearchQuery('');
    setFecha('');
    setInvitados('');
    setPrecioMin('');
    setPrecioMax('');
    setCalificacionMin('');
    setUbicacion('');
    setActiveFilter('todos');
  };

  const categorias = [
    { id: 'todos', nombre: 'Todas', icono: '' },
    { id: 'popular', nombre: 'Populares', icono: '' },
    { id: 'lujo', nombre: 'Lujo', icono: '' },
    { id: 'moderno', nombre: 'Modernas', icono: '' },
    { id: 'rustico', nombre: 'Rústicas', icono: '' },
    { id: 'bohemio', nombre: 'Bohemias', icono: '' }
  ];

  // Función para manejar reserva
  const handleReservar = (terrazaId) => {
    if (!user) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    // Redirigir a la página de reserva
    window.location.href = `/reserva/${terrazaId}`;
  };

  // Función para manejar favoritos
  const handleFavorite = (terrazaId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    // Aquí puedes implementar la lógica para agregar a favoritos
    console.log('Agregar a favoritos:', terrazaId);
  };

  return (
    <div className="terraza-app">
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
            <div className="nav-links">
              <a className="nav-link" href="#explorar">Explorar</a>
              <a className="nav-link" href="#reservaciones">Reservaciones</a>
            </div>
            
            <div className="user-section" ref={userMenuRef}>
              {/* Notificaciones */}
              <div className="notification-container" ref={notificationsRef}>
                <button 
                  className="icon-btn notification-btn"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <span className="material-symbols-outlined">notifications</span>
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
                    <span>{user.name ? user.name.charAt(0) : 'U'}</span>
                  </div>
                  <span className="user-name">{user.name}</span>
                  
                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <a className="dropdown-item" href="/client/profile">
                        <span className="material-symbols-outlined">person</span>
                        Mi Perfil
                      </a>
                      <a 
                        className="dropdown-item" 
                        href="/client/profile#configuracion"
                      >
                        <span className="material-symbols-outlined">settings</span>
                        Configuración
                      </a>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <span className="material-symbols-outlined">logout</span>
                        Cerrar Sesión
                      </button>
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Encuentra la <span className="highlight">terraza perfecta</span> para tu evento
              </h1>
              <p className="hero-description">
                Explora, compara y reserva el lugar ideal para tu próxima celebración. 
                {terrazas.length}+ terrazas disponibles en la CDMX.
              </p>
              
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">{terrazas.length}+</div>
                  <div className="stat-label">Terrazas</div>
                </div>
                <div className="stat">
                  <div className="stat-number">4.8</div>
                  <div className="stat-label">Rating Promedio</div>
                </div>
                <div className="stat">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Soporte</div>
                </div>
              </div>
            </div>
            
            <div className="hero-cards">
              {terrazas.slice(0, 3).map((terraza, index) => (
                <div key={terraza.id} className={`floating-card card-${index + 1}`}>
                  <div 
                    className="card-image"
                    style={{backgroundImage: `url(${terraza.imagen})`}}
                  ></div>
                  <div className="card-content">
                    <h4>{terraza.nombre}</h4>
                    <div className="card-rating">
                      <span className="material-symbols-outlined">star</span>
                      <span>{terraza.calificacion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-bar">
            <div className="search-input-container">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar terrazas por nombre o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="search-filters">
              <button 
                className={`filter-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="material-symbols-outlined">filter_list</span>
                Filtros
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="category-filters-container">
            <div className="category-filters">
              {categorias.map(categoria => (
                <button
                  key={categoria.id}
                  className={`category-btn ${activeFilter === categoria.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(categoria.id)}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="advanced-filters">
              <div className="filters-header">
                <h3>Filtros Avanzados</h3>
                <button className="clear-filters" onClick={limpiarFiltros}>
                  <span className="material-symbols-outlined">clear_all</span>
                  Limpiar Filtros
                </button>
              </div>
              
              <div className="filters-grid">
                <div className="filter-field">
                  <label>Ubicación específica</label>
                  <div className="input-with-icon">
                    <span className="material-symbols-outlined">location_on</span>
                    <input
                      type="text"
                      placeholder="Ej: Roma, Polanco..."
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="filter-field">
                  <label>Precio mínimo</label>
                  <div className="input-with-icon">
                    <span className="material-symbols-outlined">attach_money</span>
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={precioMin}
                      onChange={(e) => setPrecioMin(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="filter-field">
                  <label>Precio máximo</label>
                  <div className="input-with-icon">
                    <span className="material-symbols-outlined">attach_money</span>
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={precioMax}
                      onChange={(e) => setPrecioMax(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="filter-field">
                  <label>Calificación mínima</label>
                  <div className="input-with-icon">
                    <span className="material-symbols-outlined">star</span>
                    <select
                      value={calificacionMin}
                      onChange={(e) => setCalificacionMin(e.target.value)}
                    >
                      <option value="">Cualquier calificación</option>
                      <option value="4.5">4.5+ Estrellas</option>
                      <option value="4.0">4.0+ Estrellas</option>
                      <option value="3.5">3.5+ Estrellas</option>
                    </select>
                  </div>
                </div>

                <div className="filter-field">
                  <label>Número de invitados</label>
                  <div className="input-with-icon">
                    <span className="material-symbols-outlined">group</span>
                    <input
                      type="number"
                      placeholder="Mínimo de invitados"
                      value={invitados}
                      onChange={(e) => setInvitados(e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-field">
                  <label>Fecha del evento</label>
                  <div className="input-with-icon">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="results-container">
          <div className="results-header">
            <div className="results-info">
              <h2>
                {loading ? 'Cargando terrazas...' : 
                 terrazasFiltradas.length > 0 
                  ? `${terrazasFiltradas.length} terrazas encontradas` 
                  : 'No se encontraron terrazas'}
              </h2>
              <p>Descubre el lugar perfecto para tu evento</p>
            </div>
            
            {terrazasFiltradas.length > 0 && (
              <div className="sort-options">
                <span>Ordenar por:</span>
                <select className="sort-select">
                  <option>Recomendados</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                  <option>Mejor calificadas</option>
                </select>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando terrazas disponibles...</p>
            </div>
          )}

          {/* Terraza Grid */}
          {!loading && (
            <div className="terraza-grid">
              {terrazasFiltradas.map(terraza => (
                <div key={terraza.id} className="terraza-card">
                  <div className="card-image-section">
                    <div 
                      className="card-image"
                      style={{backgroundImage: `url(${terraza.imagen})`}}
                    ></div>
                    <button 
                      className="favorite-btn"
                      onClick={(e) => handleFavorite(terraza.id, e)}
                    >
                      <span className="material-symbols-outlined">favorite</span>
                    </button>
                    <div className="card-badge">{terraza.categoria}</div>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-header">
                      <h3 className="card-title">{terraza.nombre}</h3>
                      <div className="rating">
                        <span className="material-symbols-outlined">star</span>
                        <span className="rating-value">{terraza.calificacion}</span>
                      </div>
                    </div>
                    
                    <div className="card-location">
                      <span className="material-symbols-outlined">location_on</span>
                      {terraza.ubicacion}
                    </div>
                    
                    <p className="card-description">{terraza.descripcion}</p>
                    
                    <div className="card-details">
                      <div className="detail">
                        <span className="material-symbols-outlined">group</span>
                        <span>{terraza.capacidad} invitados</span>
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <div className="price">
                        <span className="price-amount">${terraza.precio.toLocaleString()}</span>
                        <span className="price-label"> / evento</span>
                      </div>
                      <button 
                        className="reserve-btn"
                        onClick={() => handleReservar(terraza.id)}
                      >
                        <span className="material-symbols-outlined">event_available</span>
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && terrazasFiltradas.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <span className="material-symbols-outlined">search_off</span>
              </div>
              <h3>No se encontraron terrazas</h3>
              <p>Intenta ajustar tus filtros de búsqueda</p>
              <button className="clear-filters-btn" onClick={limpiarFiltros}>
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="material-symbols-outlined">terrace</span>
                <h3>TerrazaApp</h3>
              </div>
              <p>La plataforma líder para encontrar y reservar terrazas para tus eventos especiales.</p>
            </div>
            
            <div className="footer-section">
              <h4>Enlaces Rápidos</h4>
              <a href="#explorar">Explorar Terrazas</a>
              <a href="/host/dashboard">Publicar Terraza</a>
              <a href="#ayuda">Centro de Ayuda</a>
              <a href="#contacto">Contacto</a>
            </div>
            
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#privacidad">Política de Privacidad</a>
              <a href="#terminos">Términos de Servicio</a>
              <a href="#cookies">Política de Cookies</a>
            </div>
            
            <div className="footer-section">
              <h4>Contacto</h4>
              <p>contacto@terrazaapp.com</p>
              <p>+52 55 1234 5678</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="Twitter">🐦</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 TerrazaApp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TerrazaApp;