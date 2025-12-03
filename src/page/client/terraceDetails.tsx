//terraceDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import '../css/clientcss/terraceDetail.css';

interface TerrazaDetalle {
  id: string;
  nombre: string;
  ubicacion: string;
  precio: number;
  calificacion: number;
  descripcion: string;
  capacidad: number;
  imagenes: string[];
  amenities: string[];
  reglas: string;
  contacto: {
    telefono: string;
    email: string;
  };
  propietario: {
    nombre: string;
    email: string;
    telefono: string;
  };
  fechaCreacion: string;
  reseñas: number;
}

const TerraceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [terraza, setTerraza] = useState<TerrazaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [user, setUser] = useState<any>(null);
  const [occupiedDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    console.log('🆔 ID recibido en parámetros:', id);
    if (id && id !== 'undefined') {
      loadTerraza();
      loadOccupiedDays();
    } else {
      setError('ID de terraza no válido');
      setLoading(false);
    }
    loadUserData();
  }, [id]);

  const loadTerraza = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Cargando terraza con ID:', id);
      
      const response = await api.get(`/publication-requests/public/${id}`);
      console.log('📦 Respuesta de la API:', response.data);
      
      if (response.data.success && response.data.data) {
        setTerraza(response.data.data);
      } else {
        setError(response.data.message || 'No se pudo cargar la información de la terraza');
      }
    } catch (err: any) {
      console.error('💥 Error cargando terraza:', err);
      if (err.response?.status === 404) {
        setError('Terraza no encontrada o no está disponible');
      } else if (err.response?.status === 400) {
        setError('ID de terraza inválido');
      } else {
        setError('Error al cargar la información de la terraza. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOccupiedDays = async () => {
    try {
      // Llamada a API para días ocupados (si existe)
    } catch (error) {
      console.error('Error cargando días ocupados:', error);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('🖼️ Error cargando imagen, usando fallback');
    e.currentTarget.src = "https://images.unsplash.com/photo-1549294413-26f195200c16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDayOccupied = (day: number, month: number, year: number) => {
    if (occupiedDays.length === 0) return false;
    return occupiedDays.includes(day);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date();
    
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isOccupied = isDayOccupied(day, currentMonth, currentYear);
      const isSelected = selectedDay === day;
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      days.push(
        <button
          key={day}
          onClick={() => !isOccupied && handleDayClick(day)}
          className={`calendar-day ${
            isOccupied 
              ? 'occupied' 
              : isSelected
                ? 'selected'
                : isToday
                  ? 'today'
                  : isWeekend
                    ? 'weekend'
                    : 'available'
          }`}
          disabled={isOccupied}
          aria-label={`Seleccionar día ${day} de ${monthNames[currentMonth]} ${currentYear}`}
        >
          <span className="day-number">{day}</span>
          {isToday && <div className="today-indicator"></div>}
        </button>
      );
    }
    
    return days;
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const selectedDateObj = new Date(currentYear, currentMonth, day);
    const formattedDate = selectedDateObj.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const formatSelectedDate = () => {
    if (!selectedDate) return 'No has seleccionado una fecha';
    const date = new Date(selectedDate);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReservar = () => {
    if (!terraza) return;
    
    if (!user) {
      alert('Por favor inicia sesión para reservar');
      navigate('/login');
      return;
    }
    
    if (!selectedDate) {
      alert('Por favor selecciona una fecha primero');
      return;
    }
    
    // Para reserva normal (con selector de horas)
    navigate('/client/Reservation', {
      state: {
        terrazaId: terraza.id,
        terrazaNombre: terraza.nombre,
        fecha: selectedDate,
        precio: terraza.precio,
        propietario: terraza.propietario,
        esVisita: false,
        ubicacion: terraza.ubicacion,
        capacidad: terraza.capacidad
      }
    });
  };

  const handleSolicitarVisita = () => {
    if (!terraza) return;
    
    if (!user) {
      alert('Por favor inicia sesión para solicitar una visita');
      navigate('/login');
      return;
    }
    
    if (!selectedDate) {
      alert('Por favor selecciona una fecha primero para la visita');
      return;
    }
    
    // Para solicitud de visita
    navigate('/client/Reservation', {
      state: {
        terrazaId: terraza.id,
        terrazaNombre: terraza.nombre,
        fecha: selectedDate,
        precio: terraza.precio,
        propietario: terraza.propietario,
        esVisita: true,
        ubicacion: terraza.ubicacion,
        capacidad: terraza.capacidad,
        duracionVisita: 1.5 // 1 hora y media por defecto
      }
    });
  };

  const handleContactar = () => {
    if (!terraza) return;
    
    const subject = `Consulta sobre ${terraza.nombre}`;
    const body = `Hola ${terraza.propietario.nombre},\n\nMe interesa obtener más información sobre tu terraza "${terraza.nombre}".\n\nSaludos.`;
    
    window.open(`mailto:${terraza.propietario.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const terrazaEjemplo: TerrazaDetalle = {
    id: id || 'ejemplo-123',
    nombre: "villa sancarlos",
    ubicacion: "San Carlos",
    precio: 9995,
    calificacion: 4.85,
    descripcion: "Disfruta de un espacio único para tus eventos. Nuestra villa cuenta con todas las comodidades para hacer de tu celebración un momento inolvidable.",
    capacidad: 50,
    imagenes: [
      "https://images.unsplash.com/photo-1549294413-26f195200c16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1564013797767-2f7b0eb10aac?w=600&h=400&fit=crop"
    ],
    amenities: ['alberca', 'asador', 'wifi', 'estacionamiento', 'baños'],
    reglas: "Música moderada después de las 11:00 PM.\nCheck-in: 3:00 PM - Check-out: 12:00 PM.\nProhibido fumar en áreas techadas.",
    contacto: {
      telefono: "+52 123 456 7890",
      email: "contacto@villasancarlos.com"
    },
    propietario: {
      nombre: "pedro",
      email: "pedro@example.com",
      telefono: "+52 123 456 7890"
    },
    fechaCreacion: "2023-01-15",
    reseñas: 12
  };

  if (loading) {
    return (
      <div className="terraza-detail-app">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando información de la terraza...</p>
        </div>
      </div>
    );
  }

  const terrazaData = terraza || terrazaEjemplo;

  return (
    <div className="terraza-detail-app">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="terraza-detail-main">
        <div className="title-container">
          <h1 className="page-title">{terrazaData.nombre}</h1>
        </div>

        {error && (
          <div className="error-banner">
            <span className="material-symbols-outlined">warning</span>
            <p>{error} Mostrando información de ejemplo.</p>
          </div>
        )}

        <div className="gallery-container">
          <div className="gallery-main">
            <img 
              src={terrazaData.imagenes[selectedImage]} 
              alt={terrazaData.nombre}
              onError={handleImageError}
              className="main-image"
              loading="lazy"
            />
          </div>
          <div className="gallery-thumbnails">
            {terrazaData.imagenes.map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <img 
                  src={img} 
                  alt={`Vista ${index + 1}`}
                  onError={handleImageError}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="content-container">
          <div className="content-left">
            <section className="description-section">
              <h2 className="section-title">Descripción del Lugar</h2>
              <p className="description-text">{terrazaData.descripcion}</p>
            </section>

            <hr className="divider" />

            <section className="features-section">
              <h2 className="section-title">Capacidad</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="material-symbols-outlined feature-icon"></span>
                  <span className="feature-text">Hasta {terrazaData.capacidad} personas</span>
                </div>
              </div>
            </section>

            <hr className="divider" />

            <section className="rules-section">
              <h2 className="section-title">Reglas del lugar</h2>
              <ul className="rules-list">
                {terrazaData.reglas.split('\n').map((rule, index) => (
                  rule.trim() && (
                    <li key={index} className="rule-item">
                      <span className="material-symbols-outlined rule-icon"></span>
                      {rule.trim()}
                    </li>
                  )
                ))}
              </ul>
            </section>
          </div>

          <div className="content-right">
            <div className="action-panel">
              <div className="price-section">
                <span className="price">${terrazaData.precio.toLocaleString()} MXN</span>
                <span className="price-unit">/ por evento</span>
              </div>

              <div className="calendar-section">
                <h3 className="">Selecciona tu fecha</h3>
                
                <div className="calendar">
                  <div className="calendar-header">
                    <button 
                      className="calendar-nav prev" 
                      onClick={handlePrevMonth}
                      aria-label="Mes anterior"
                    >
                      <span className="material-symbols-outlined">◀</span>
                    </button>
                    <span className="calendar-month">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <button 
                      className="calendar-nav next" 
                      onClick={handleNextMonth}
                      aria-label="Mes siguiente"
                    >
                      <span className="material-symbols-outlined">▶</span>
                    </button>
                  </div>
                  
                  <div className="calendar-weekdays">
                    {weekDays.map((day, index) => (
                      <span key={index} className={index === 0 || index === 6 ? 'weekend' : ''}>
                        {day}
                      </span>
                    ))}
                  </div>
                  
                  <div className="calendar-days">
                    {renderCalendar()}
                  </div>
                </div>

                {selectedDate && (
                  <div className="selected-date-info">
                    <span className="material-symbols-outlined"></span>
                    <span>Fecha seleccionada: <strong>{formatSelectedDate()}</strong></span>
                  </div>
                )}
              </div>
            
              <div className="buttons-section">
                <button 
                  className={`btn-primary ${!selectedDate ? 'disabled' : ''}`}
                  onClick={handleReservar}
                  disabled={!selectedDate}
                >
                  <span className="material-symbols-outlined"></span>
                  Apartar Fecha
                </button>
                <button 
                  className={`btn-secondary ${!selectedDate ? 'disabled' : ''}`}
                  onClick={handleSolicitarVisita}
                  disabled={!selectedDate}
                >
                  <span className="material-symbols-outlined"></span>
                  Solicitar una visita
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
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
            <a className="nav-link" href="/client/MyResarvation">Reservaciones</a>
          </div>
          
          <div className="user-section">
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
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={onLogout} type="button">
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
  );
};

export default TerraceDetails;

//----------------------------------------BIEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEN----------------------------------------