// frontend/src/pages/client/Home.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Cambia a Link
import "../css/clientcss/home.css";
import api from '../../api';

// Definir tipos TypeScript
interface Terraza {
  id: string;
  nombre: string;
  ubicacion: string;
  precio: number;
  calificacion: number;
  capacidad: number;
  imagen: string;
  categoria: string;
  descripcion: string;
  amenities: string[];
  contacto: {
    telefono?: string;
    email?: string;
  };
  propietario: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [invitados, setInvitados] = useState<string>('');
  const [precioMin, setPrecioMin] = useState<string>('');
  const [precioMax, setPrecioMax] = useState<string>('');
  const [calificacionMin, setCalificacionMin] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [terrazas, setTerrazas] = useState<Terraza[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Notificaciones de ejemplo
  const [notifications] = useState<Notification[]>([
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
  const loadAllTerrazas = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Cargando terrazas aprobadas...');
      
      const response = await api.get('/publication-requests/public/approved');
      
      if (response.data.success) {
        console.log('✅ Terrazas cargadas:', response.data.data.length);
        console.log('📊 Datos de terrazas:', response.data.data);
        
        // Verificar que las terrazas tengan IDs
        const terrazasConIds = response.data.data.map((terraza: any, index: number) => {
          // Asegurar que cada terraza tenga un ID válido
          const terrazaId = terraza.id || terraza._id || `temp-${index}`;
          console.log(`Terraza ${index}: ID=${terrazaId}, Nombre=${terraza.nombre}`);
          
          return {
            ...terraza,
            id: terrazaId,
            imagen: terraza.imagen || getDefaultImage()
          };
        });
        
        setTerrazas(terrazasConIds);
      } else {
        console.error('❌ Error cargando terrazas:', response.data.message);
        setError('No se pudieron cargar las terrazas');
        setTerrazas(getTerrazasEjemplo());
      }
    } catch (error: any) {
      console.error('💥 Error al cargar terrazas:', error);
      setError('Error de conexión con el servidor');
      setTerrazas(getTerrazasEjemplo());
    } finally {
      setLoading(false);
    }
  };

  // Imagen por defecto
  const getDefaultImage = (): string => {
    return "https://images.unsplash.com/photo-1549294413-26f195200c16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  };

  // Función para manejar errores de imágenes
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    console.log('🖼️ Error cargando imagen, usando fallback');
    e.currentTarget.src = getDefaultImage();
  };

  // Función para cargar datos del usuario
  const loadUserData = (): void => {
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
  const getTerrazasEjemplo = (): Terraza[] => [
    {
      id: '65a1b2c3d4e5f6a7b8c9d0e1',
      nombre: "Terraza del Sol",
      ubicacion: "Colonia Roma Norte, CDMX",
      precio: 5000,
      calificacion: 4.8,
      capacidad: 50,
      imagen: "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=600&h=400&fit=crop",
      categoria: "popular",
      descripcion: "Amplia terraza con vista panorámica al atardecer",
      amenities: [],
      contacto: {},
      propietario: "Anfitrión"
    },
    {
      id: '65a1b2c3d4e5f6a7b8c9d0e2',
      nombre: "Jardín Secreto",
      ubicacion: "Polanco, CDMX",
      precio: 8000,
      calificacion: 4.9,
      capacidad: 30,
      imagen: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop",
      categoria: "lujo",
      descripcion: "Elegante terraza con jardín privado y fuentes",
      amenities: [],
      contacto: {},
      propietario: "Anfitrión"
    },
    {
      id: '65a1b2c3d4e5f6a7b8c9d0e3',
      nombre: "Rooftop Panorámico",
      ubicacion: "Condesa, CDMX",
      precio: 6500,
      calificacion: 4.7,
      capacidad: 40,
      imagen: "https://images.unsplash.com/photo-1564013797767-2f7b0eb10aac?w=600&h=400&fit=crop",
      categoria: "moderno",
      descripcion: "Terraza moderna con vista espectacular de la ciudad",
      amenities: [],
      contacto: {},
      propietario: "Anfitrión"
    }
  ];

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
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
  const handleLogout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
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
      terraza.precio >= parseInt(precioMin) || 0;
    
    const matchPrecioMax = 
      precioMax === '' || 
      terraza.precio <= parseInt(precioMax) || Infinity;
    
    const matchCalificacion = 
      calificacionMin === '' || 
      terraza.calificacion >= parseFloat(calificacionMin) || 0;
    
    const matchInvitados = 
      invitados === '' || 
      terraza.capacidad >= parseInt(invitados) || 0;
    
    const matchCategoria = 
      activeFilter === 'todos' || 
      terraza.categoria === activeFilter;
    
    return matchSearch && matchUbicacion && matchPrecioMin && 
           matchPrecioMax && matchCalificacion && matchInvitados && matchCategoria;
  });

  const limpiarFiltros = (): void => {
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

  // Función para manejar favoritos
  const handleFavorite = (terrazaId: string, event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
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
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1>TerrazaApp</h1>
              </Link>
            </div>
          </div>
          
          <nav className="nav-section">
            <div className="nav-links">
              <a className="nav-link" href="/client/home">Explorar</a>
              <a className="nav-link" href="/client/MyResarvation">Reservaciones</a>
            </div>
            
            <div className="user-section" ref={userMenuRef}>
              {user ? (
                <div 
                  className="user-profile"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && setUserMenuOpen(!userMenuOpen)}
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
                      <button className="dropdown-item" onClick={handleLogout} type="button">
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
                <Link 
                  key={terraza.id} 
                  to={`/client/terraceDetail/${terraza.id}`}
                  className={`floating-card card-${index + 1}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <img 
                    src={terraza.imagen} 
                    alt={terraza.nombre}
                    onError={handleImageError}
                    className="card-image"
                  />
                  <div className="card-content">
                    <h4>{terraza.nombre}</h4>
                    <div className="card-rating">
                      <span className="material-symbols-outlined">star</span>
                      <span>{terraza.calificacion}</span>
                    </div>
                  </div>
                </Link>
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
                type="button"
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
                  type="button"
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
                <button className="clear-filters" onClick={limpiarFiltros} type="button">
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
                      min="0"
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
                      min="0"
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
                      min="1"
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
              {error && <p className="error-message">{error}</p>}
              <p>Descubre el lugar perfecto para tu evento</p>
            </div>
            
            {terrazasFiltradas.length > 0 && (
              <div className="sort-options">
                <span>Ordenar por:</span>
                <select className="sort-select" onChange={(e) => console.log('Ordenar por:', e.target.value)}>
                  <option value="recomendados">Recomendados</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="calificacion">Mejor calificadas</option>
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
                <div 
                  key={terraza.id} 
                  className="terraza-card"
                >
                  <div className="card-image-section">
                    <img 
                      src={terraza.imagen} 
                      alt={terraza.nombre}
                      onError={handleImageError}
                      className="card-image"
                    />
                    <button 
                      className="favorite-btn"
                      onClick={(e) => handleFavorite(terraza.id, e)}
                      type="button"
                      aria-label="Agregar a favoritos"
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
                      {/* CAMBIO AQUÍ: Usa Link en lugar de <a> */}
                      <Link to={`/client/terraceDetail/${terraza.id}`}>
                        <button 
                          className="reserve-btn"
                          type="button"
                        >
                          <span className="material-symbols-outlined">event_available</span>
                          Reservar
                        </button>
                      </Link>
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
              <button className="clear-filters-btn" onClick={limpiarFiltros} type="button">
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
              <a href="/client/ayuda">Centro de Ayuda</a>
              <a href="/contacto">Contacto</a>
            </div>
            
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="/privacidad">Política de Privacidad</a>
              <a href="/terminos">Términos de Servicio</a>
              <a href="/cookies">Política de Cookies</a>
            </div>
            
            <div className="footer-section">
              <h4>Contacto</h4>
              <p>contacto@terrazaapp.com</p>
              <p>+52 55 1234 5678</p>
              <div className="social-links">
                <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">📘</a>
                <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">📷</a>
                <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">🐦</a>
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

export default Home;