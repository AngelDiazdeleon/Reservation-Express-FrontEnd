import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [user, setUser] = useState<{name: string} | null>(null);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

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

  // Obtener información del usuario al cargar el componente
  useEffect(() => {
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Redirigir al login o página principal
    window.location.href = '/login';
  };

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Si hay error de autenticación, cerrar sesión
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Funciones para manejar notificaciones
  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reserva': return 'event_available';
      case 'mensaje': return 'message';
      case 'recordatorio': return 'notification_important';
      case 'promocion': return 'local_offer';
      default: return 'notifications';
    }
  };

  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  // Datos de terrazas
  const terrazas = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
      nombre: "Rooftop Panorámico",
      ubicacion: "Condesa, CDMX",
      precio: 6500,
      calificacion: 4.7,
      capacidad: 40,
      imagen: "https://images.unsplash.com/photo-1564013797767-2f7b0eb10aac?w=600&h=400&fit=crop",
      categoria: "moderno",
      descripcion: "Terraza moderna con vista espectacular de la ciudad"
    },
    {
      id: 4,
      nombre: "Terraza Bohemia",
      ubicacion: "Coyoacán, CDMX",
      precio: 3500,
      calificacion: 4.6,
      capacidad: 25,
      imagen: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&h=400&fit=crop",
      categoria: "bohemio",
      descripcion: "Ambiente bohemio con decoración artesanal y luces tenues"
    },
    {
      id: 5,
      nombre: "Patio Rustico",
      ubicacion: "San Ángel, CDMX",
      precio: 4200,
      calificacion: 4.5,
      capacidad: 35,
      imagen: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
      categoria: "rustico",
      descripcion: "Encantador patio rústico con paredes de piedra y madera"
    },
    {
      id: 6,
      nombre: "Sky Lounge",
      ubicacion: "Santa Fe, CDMX",
      precio: 9500,
      calificacion: 4.9,
      capacidad: 60,
      imagen: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
      categoria: "lujo",
      descripcion: "Exclusivo rooftop con bar privado y DJ"
    }
  ];

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

  return (
    <div className="terraza-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <span className="material-symbols-outlined">Terraza</span>
              <h1>Express</h1>
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
                    <span>{user.name.charAt(0)}</span>
                  </div>
                  <span className="user-name">{user.name}</span>
                  
                  
                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <a className="dropdown-item" href="/client/Profile">
                        <span className="material-symbols-outlined"></span>
                        Mi Perfil
                      </a>
                      <a 
                        className="dropdown-item" 
                        href="/client/profile#configuracion"
                        onClick={(e) => {
                          e.preventDefault();
                          // Redirigir al perfil con la pestaña de configuración activa
                          window.location.href = '/client/profile#configuracion';
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
                Más de 500 terrazas disponibles en la CDMX.
              </p>
              
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">500+</div>
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
              <div className="floating-card card-1">
                <div className="card-image" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=300&h=200&fit=crop)'}}></div>
                <div className="card-content">
                  <h4>Terraza del Sol</h4>
                  <div className="card-rating">
                    <span className="material-symbols-outlined">star</span>
                    <span>4.8</span>
                  </div>
                </div>
              </div>
              
              <div className="floating-card card-2">
                <div className="card-image" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop)'}}></div>
                <div className="card-content">
                  <h4>Vistas al Jardín</h4>
                  <div className="card-rating">
                    <span className="material-symbols-outlined">star</span>
                    <span>4.9</span>
                  </div>
                </div>
              </div>
              
              <div className="floating-card card-3">
                <div className="card-image" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1564013797767-2f7b0eb10aac?w=300&h=200&fit=crop)'}}></div>
                <div className="card-content">
                  <h4>Rooftop Moderno</h4>
                  <div className="card-rating">
                    <span className="material-symbols-outlined">star</span>
                    <span>4.7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-bar">
            <div className="search-input-container">
              <span className="material-symbols-outlined search-icon">🔍</span>
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
                <span className="material-symbols-outlined"></span>
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
                  {categoria.icono && (
                    <span className="material-symbols-outlined category-icon">{categoria.icono}</span>
                  )}
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
                  <span className="material-symbols-outlined"></span>
                  Limpiar Filtros
                </button>
              </div>
              
              <div className="filters-grid">
                <div className="filter-field">
                  <label>Ubicación específica</label>
                  <div className="input-with-icon">
                    <span className="material-symbols-outlined"></span>
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
                    <span className="material-symbols-outlined"></span>
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
                    <span className="material-symbols-outlined"></span>
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
                    <span className="material-symbols-outlined"></span>
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
                {terrazasFiltradas.length > 0 
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

          {/* Terraza Grid */}
          <div className="terraza-grid">
            {terrazasFiltradas.map(terraza => (
              <div key={terraza.id} className="terraza-card">
                <div className="card-image-section">
                  <div 
                    className="card-image"
                    style={{backgroundImage: `url(${terraza.imagen})`}}
                  ></div>
                  <button className="favorite-btn">
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
                    <button className="reserve-btn">
                      <span className="material-symbols-outlined">event_available</span>
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {terrazasFiltradas.length === 0 && (
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
                <span className="material-symbols-outlined">Terrazas</span>
                <h3>Express</h3>
              </div>
              <p>La plataforma líder para encontrar y reservar terrazas para tus eventos especiales.</p>
            </div>
            
            <div className="footer-section">
              <h4>Enlaces Rápidos</h4>
              <a href="#explorar">Explorar Terrazas</a>
              <a href="#publicar">Publicar Terraza</a>
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