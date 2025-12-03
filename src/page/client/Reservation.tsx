import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { reservationApi } from '../../api'; // Cambiamos a la API con soporte offline
import '../css/clientcss/Reservation.css';

const ReservationClient: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { 
    terrazaId, 
    terrazaNombre, 
    fecha, 
    precio = 9995,
    propietario,
    esVisita = false,
    ubicacion = 'San Carlos',
    capacidad = 50
  } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [showEventTypeSelector, setShowEventTypeSelector] = useState(false);
  const [horasVisita, setHorasVisita] = useState(1.5);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    phone: '',
    fechaReserva: fecha || '',
    horaInicio: esVisita ? '10:00' : '18:00',
    horaFin: esVisita ? '11:30' : '23:00',
    tipoEvento: 'Cumpleaños'
  });

  useEffect(() => {
    if (!terrazaId) {
      navigate('/client/home');
      return;
    }

    // Configurar listeners para cambios de conexión
    const handleOnline = () => {
      setOfflineMode(false);
      setShowOfflineBanner(false);
      console.log('🌐 Conexión restaurada');
    };
    
    const handleOffline = () => {
      setOfflineMode(true);
      setShowOfflineBanner(true);
      console.log('📴 Modo offline activado');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Calcular hora fin inicial para visita (1h30 después)
    if (esVisita) {
      const [horasInicio, minutosInicio] = formData.horaInicio.split(':').map(Number);
      const minutosTotales = horasInicio * 60 + minutosInicio + Math.round(horasVisita * 60);
      const horasFin = Math.floor(minutosTotales / 60);
      const minutosFin = minutosTotales % 60;
      const horaFinFormateada = `${horasFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        horaFin: horaFinFormateada
      }));
    }

    // Para reserva: calcular hora fin (5 horas después del inicio)
    if (!esVisita) {
      const [horasInicio, minutosInicio] = formData.horaInicio.split(':').map(Number);
      const horaFinCalculada = horasInicio + 5;
      const horaFinFormateada = `${horaFinCalculada.toString().padStart(2, '0')}:${minutosInicio.toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        horaFin: horaFinFormateada
      }));
    }

    // Cargar datos del usuario
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Guardar userId en localStorage para uso offline
        localStorage.setItem('userId', parsedUser.id || parsedUser._id || '');
        
        setFormData(prev => ({
          ...prev,
          nombreCompleto: parsedUser.name || 'Carlos perfil de pruebas',
          email: parsedUser.email || 'carlos@gmail.com'
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Verificar operaciones pendientes
    checkPendingOperations();

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [terrazaId, navigate, esVisita]);

  const checkPendingOperations = async () => {
    try {
      const status = await reservationApi.getOfflineStatus();
      setPendingSync(status.pendingOperations);
    } catch (error) {
      console.error('Error verificando estado offline:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'horaInicio' && !esVisita) {
      const [horasInicio, minutosInicio] = value.split(':').map(Number);
      const horaFinCalculada = horasInicio + 5;
      const horaFinFormateada = `${horaFinCalculada.toString().padStart(2, '0')}:${minutosInicio.toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        horaFin: horaFinFormateada
      }));
    } else if (name === 'horaInicio' && esVisita) {
      const [horasInicio, minutosInicio] = value.split(':').map(Number);
      const minutosTotales = horasInicio * 60 + minutosInicio + Math.round(horasVisita * 60);
      const horasFin = Math.floor(minutosTotales / 60);
      const minutosFin = minutosTotales % 60;
      const horaFinFormateada = `${horasFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        horaFin: horaFinFormateada
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEventTypeChange = (tipo: string) => {
    setFormData(prev => ({
      ...prev,
      tipoEvento: tipo
    }));
    setShowEventTypeSelector(false);
  };

  const handleHorasVisitaChange = (horas: number) => {
    setHorasVisita(horas);
    if (formData.horaInicio) {
      const [horasInicio, minutosInicio] = formData.horaInicio.split(':').map(Number);
      const minutosTotales = horasInicio * 60 + minutosInicio + Math.round(horas * 60);
      const horasFin = Math.floor(minutosTotales / 60);
      const minutosFin = minutosTotales % 60;
      const horaFinFormateada = `${horasFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        horaFin: horaFinFormateada
      }));
    }
  };

  // FUNCIÓN MODIFICADA CON SOPORTE OFFLINE
  // FUNCIÓN MODIFICADA CON SOPORTE OFFLINE Y DEBUGGING
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}').id;
    
    if (!token || !userId) {
      alert('Por favor inicia sesión para continuar');
      navigate('/login');
      return;
    }

    const reservationData = {
      terrazaId,
      terrazaNombre,
      fechaReserva: formData.fechaReserva,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      tipoEvento: formData.tipoEvento,
      descripcion: comentarios,
      numPersonas: capacidad,
      nombreCliente: formData.nombreCompleto,
      emailCliente: formData.email,
      phoneCliente: formData.phone,
      esVisita: esVisita,
      estado: 'pendiente',
      precioTotal: esVisita ? 0 : precio,
      ubicacion,
      capacidad,
      propietarioNombre: propietario?.nombre || 'Propietario',
      duracionVisita: esVisita ? horasVisita : 5
    };

    console.log('📤 Enviando reserva:', reservationData);
    console.log('📶 Estado de conexión:', navigator.onLine ? 'Online' : 'Offline');

    // USAMOS LA API CON SOPORTE OFFLINE
    const response = await reservationApi.createReservation(reservationData);
    
    setLoading(false);
    
    if (response.data.success) {
      let mensaje = '';
      
      if (response.data.offline) {
        // Reserva guardada localmente
        mensaje = esVisita 
          ? '✅ Solicitud de visita guardada localmente. Se sincronizará automáticamente cuando haya conexión.'
          : '✅ Reserva guardada localmente. Se sincronizará automáticamente cuando haya conexión.';
        
        // Mostrar detalles de la reserva local
        if (response.data.data) {
          console.log('📱 Reserva local creada:', response.data.data);
          console.log('📱 ID de reserva local:', response.data.data?._id);
          console.log('📦 Datos completos de la reserva local:', response.data.data);
          
          // Verificar que se guardó en IndexedDB
          setTimeout(async () => {
            console.log('🔄 Verificando estado offline...');
            try {
              const status = await reservationApi.getOfflineStatus();
              console.log('📊 Estado offline después de guardar:');
              console.log('   - ¿Hay conexión?:', status.isOnline ? 'Sí' : 'No');
              console.log('   - Operaciones pendientes:', status.pendingOperations);
              console.log('   - Reservas pendientes:', status.pendingReservations);
              console.log('   - Total de reservas locales:', status.totalLocalReservations);
              
              // También verificar el outbox directamente
              const { getOutbox } = await import('../../offline/db');
              const outbox = await getOutbox();
              console.log('📬 Contenido del outbox:', outbox);
              
            } catch (error) {
              console.error('❌ Error verificando estado offline:', error);
            }
          }, 1000);
        }
      } else {
        // Reserva enviada al servidor exitosamente
        mensaje = esVisita 
          ? '✅ Solicitud de visita enviada correctamente. Te contactaremos pronto.'
          : '✅ Reserva realizada correctamente. Revisa tu email para más detalles.';
        
        console.log('✅ Reserva enviada al servidor exitosamente');
        console.log('📦 Respuesta del servidor:', response.data);
      }
      
      alert(mensaje);
      
      // Redirigir según el modo
      if (response.data.offline) {
        console.log('🔄 Redirigiendo a /client/reservations para ver reservas locales');
        navigate('/client/reservations'); // Mostrar reservas locales
      } else {
        navigate('/client/home');
      }
    } else {
      console.error('❌ Error en la respuesta de la API:', response.data);
      alert('Error al procesar la solicitud: ' + response.data.message);
    }

  } catch (error: any) {
    console.error('❌ Error al realizar la reserva:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    setLoading(false);
    
    // Mostrar mensaje de error específico
    if (error.response) {
      if (error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        navigate('/login');
      } else if (error.response.data?.message) {
        alert('Error: ' + error.response.data.message);
      } else {
        alert('Error al procesar la reserva. Intenta nuevamente.');
      }
    } else {
      alert('Error de conexión. Verifica tu internet e intenta nuevamente.');
    }
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    setUserMenuOpen(false);
    navigate('/login');
  };

  const handleManualSync = async () => {
    try {
      alert('Iniciando sincronización...');
      await reservationApi.syncOfflineData();
      alert('Sincronización completada');
      await checkPendingOperations();
    } catch (error) {
      console.error('Error en sincronización:', error);
      alert('Error en sincronización. Por favor, inténtalo nuevamente.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const tiposEvento = [
    'Cumpleaños',
    'Boda',
    'Reunión familiar',
    'Evento corporativo',
    'Graduación',
    'Otro'
  ];

  const horasDisponibles = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const opcionesHorasVisita = [
    { horas: 1, label: '1 hora' },
    { horas: 1.5, label: '1 hora 30 min' },
    { horas: 2, label: '2 horas' },
    { horas: 2.5, label: '2 horas 30 min' },
    { horas: 3, label: '3 horas' }
  ];

  if (!terrazaId) {
    return (
      <div className="reservation-client">
        <div className="error-container">
          <h2>No se encontró información de la terraza</h2>
          <button onClick={() => navigate('/client/home')}>
            Volver a terrazas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-client">
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
              <a className="nav-link" href="#explorar">Explorar</a>
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

      {/* Banner de modo offline */}
      {showOfflineBanner && (
        <div className="offline-banner">
          <div className="offline-content">
            <span className="material-symbols-outlined">wifi_off</span>
            <div className="offline-text">
              <strong>Modo offline activado</strong>
              <span>Puedes crear reservas que se guardarán localmente y se sincronizarán automáticamente cuando haya conexión.</span>
            </div>
            {pendingSync > 0 && navigator.onLine && (
              <button onClick={handleManualSync} className="offline-sync-btn">
                <span className="material-symbols-outlined">sync</span>
                Sincronizar ahora
              </button>
            )}
            <button 
              onClick={() => setShowOfflineBanner(false)}
              className="offline-close-btn"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      <main className="reservation-main">
        <div className="reservation-container">
          <div className="page-heading">
            <div className="heading-content">
              <h1>
                {esVisita ? 'Solicitar Visita' : 'Confirmación de Reserva'}
              </h1>
              <div className="heading-actions">
                {offlineMode && (
                  <div className="offline-indicator-small">
                    <span className="material-symbols-outlined"></span>
                    <span>Modo offline</span>
                  </div>
                )}
                {pendingSync > 0 && (
                  <button 
                    onClick={handleManualSync}
                    className="sync-button"
                    title="Sincronizar operaciones pendientes"
                  >
                    <span className="material-symbols-outlined">sync</span>
                    <span className="sync-badge">{pendingSync}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="content-wrapper">
            {/* Columna izquierda: Detalles */}
            <div className="details-column">
              <div className="terraza-card">
                <div className="terraza-header">
                  <div className="terraza-title-section">
                    <h2>{terrazaNombre}</h2>
                    <p className="location">{ubicacion}</p>
                  </div>
                  <div className="terraza-badge">
                    <span className={`badge ${esVisita ? 'badge-visita' : 'badge-reserva'}`}>
                      {esVisita ? 'Visita' : 'RESERVA'}
                    </span>
                    {offlineMode && (
                      <span className="badge-offline">
                        <span className="material-symbols-outlined"></span>
                        Offline
                      </span>
                    )}
                  </div>
                </div>
                {!esVisita && (
                  <div className="terraza-capacity">
                    <span className="capacity-label">Capacidad:</span>
                    <span className="capacity-value">{capacidad} personas</span>
                  </div>
                )}
              </div>

              {!esVisita && (
                <div className="payment-summary-card">
                  <h3 className="payment-summary-title">Resumen del Pago</h3>
                  <div className="payment-details">
                    <div className="payment-item">
                      <span className="payment-label">Precio por evento</span>
                      <span className="payment-value">${precio.toLocaleString('es-ES')}</span>
                    </div>
                    <div className="payment-item">
                      <span className="payment-label">5 horas incluidas</span>
                      <span className="payment-value">${precio.toLocaleString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del Propietario */}
              {!esVisita && (
                <div className="owner-info-card">
                  <h3 className="owner-info-title">
                    <span className="material-symbols-outlined"></span>
                    Información del Propietario
                  </h3>
                  <div className="owner-details">
                    <div className="owner-name">{propietario?.nombre || 'pedro'}</div>
                    <div className="owner-contact">
                      <div className="contact-item">
                        <span className="material-symbols-outlined">Correo</span>
                        <span>{propietario?.email || 'pedro@example.com'}</span>
                      </div>
                      <div className="contact-item">
                        <span className="material-symbols-outlined">Telefono</span>
                        <span>{propietario?.phone || '+52 123 456 7890'}</span>
                      </div>
                    </div>
                    <p className="owner-note">
                      El propietario contactará contigo para coordinar el pago y detalles finales.
                    </p>
                  </div>
                </div>
              )}

              {/* Sección de Fecha y Detalles */}
              <div className="date-details-card">
                <h3 className="date-details-title">Fecha</h3>
                <div className="date-info">
                  <div className="date-value">
                    {formatDate(formData.fechaReserva)}
                  </div>
                </div>

                {esVisita ? (
                  <div className="visit-details">
                    <div className="detail-row">
                      <span className="detail-label">Hora de inicio</span>
                      <div className="detail-value">
                        <select
                          value={formData.horaInicio}
                          onChange={handleChange}
                          name="horaInicio"
                          className="time-select"
                        >
                          {horasDisponibles.map(hora => (
                            <option key={hora} value={hora}>{hora}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Duración de visita</span>
                      <div className="duration-buttons">
                        {opcionesHorasVisita.map(opcion => (
                          <button
                            key={opcion.horas}
                            type="button"
                            className={`duration-btn ${horasVisita === opcion.horas ? 'selected' : ''}`}
                            onClick={() => handleHorasVisitaChange(opcion.horas)}
                          >
                            {opcion.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Hora de fin</span>
                      <span className="detail-value time-value">{formData.horaFin}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Tipo de Reserva</span>
                      <span className="detail-value">Solicitud de Visita</span>
                    </div>
                  </div>
                ) : (
                  <div className="reservation-details">
                    <div className="detail-row">
                      <span className="detail-label">Horario</span>
                      <div className="time-selectors">
                        <select
                          value={formData.horaInicio}
                          onChange={handleChange}
                          name="horaInicio"
                          className="time-select small"
                        >
                          {horasDisponibles.map(hora => (
                            <option key={hora} value={hora}>{hora}</option>
                          ))}
                        </select>
                        <span className="time-separator">a</span>
                        <span className="time-value">{formData.horaFin}</span>
                        <span className="time-duration">(5 horas)</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Tipo de Evento</span>
                      <div className="event-type-container">
                        <span className="event-type-value">{formData.tipoEvento}</span>
                        <button 
                          type="button" 
                          className="change-event-btn"
                          onClick={() => setShowEventTypeSelector(!showEventTypeSelector)}
                        >
                          Cambiar
                        </button>
                        {showEventTypeSelector && (
                          <div className="event-type-selector">
                            {tiposEvento.map((tipo) => (
                              <button
                                key={tipo}
                                type="button"
                                className={`event-type-option ${formData.tipoEvento === tipo ? 'selected' : ''}`}
                                onClick={() => handleEventTypeChange(tipo)}
                              >
                                {tipo}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">Número de Invitados</span>
                  <span className="detail-value">{capacidad}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Reservado a nombre de</span>
                  <span className="detail-value">{formData.nombreCompleto || 'Carlos perfil de pruebas'}</span>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="contact-info-card">
                <div className="contact-row">
                  <span className="contact-label">Email de contacto</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    name="email"
                    className="contact-input"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="contact-row">
                  <span className="contact-label">Teléfono</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    name="phone"
                    className="contact-input"
                    placeholder="+52 123 456 7890"
                  />
                </div>
              </div>

              {/* Comentarios para visita */}
              {esVisita && (
                <div className="comments-card">
                  <h3 className="comments-title">Comentarios adicionales para la visita</h3>
                  <textarea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    className="comments-textarea"
                    placeholder="Ej: Necesito ver el estacionamiento, acceso para personas con movilidad reducida, etc."
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Columna derecha: Resumen y Confirmación */}
            <div className="summary-column">
              {esVisita ? (
                <div className="visit-summary-card">
                  <h3 className="summary-title">Resumen</h3>
                  <div className="visit-summary-content">
                    <div className="summary-item">
                      <span>Solicitud de visita</span>
                      <span className="price">Gratis</span>
                    </div>
                    <div className="visit-note">
                      <p>La visita es sin costo. El propietario se pondrá en contacto contigo para coordinar los detalles.</p>
                      {offlineMode && (
                        <div className="offline-note">
                          <span className="material-symbols-outlined">cloud_off</span>
                          <p>Esta solicitud se guardará localmente y se sincronizará automáticamente cuando haya conexión.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="total-section visit-total">
                    <h4>Total a Pagar</h4>
                    <div className="total-amount">Gratis</div>
                  </div>

                  <button
                    className={`confirm-button ${offlineMode ? 'offline-mode' : ''}`}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span>
                        {offlineMode ? 'Guardando localmente...' : 'Procesando...'}
                      </>
                    ) : offlineMode ? (
                      <>
                        <span className="material-symbols-outlined"></span>
                        Guardar localmente
                      </>
                    ) : 'Solicitar Visita'}
                  </button>

                  <div className="terms-notice">
                    <p>Al confirmar, aceptas nuestros <a href="/terminos-de-servicio" className="terms-link">Términos de Servicio</a> y <a href="/politica-cancelacion" className="terms-link">Política de Cancelación</a>.</p>
                    {offlineMode && (
                      <p className="offline-notice">
                        <span className="material-symbols-outlined"></span>
                        La solicitud se sincronizará automáticamente cuando se restablezca la conexión.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="reservation-summary-card">
                  <div className="total-section">
                    <h3>Total a Pagar</h3>
                    <div className="total-amount-large">${precio.toLocaleString('es-ES')}</div>
                  </div>

                  <div className="payment-info-card">
                    <div className="payment-info-title">
                      <span className="material-symbols-outlined"></span>
                      Información importante:
                    </div>
                    <p className="payment-info-text">
                      El pago se realizará directamente con el propietario. Esta es una solicitud de reserva.
                      {offlineMode && (
                        <>
                          <br /><br />
                          <strong>Modo offline:</strong> Esta reserva se guardará localmente y se sincronizará automáticamente cuando haya conexión.
                        </>
                      )}
                    </p>
                  </div>

                  <button
                    className={`confirm-button ${offlineMode ? 'offline-mode' : ''}`}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span>
                        {offlineMode ? 'Guardando localmente...' : 'Procesando...'}
                      </>
                    ) : offlineMode ? (
                      <>
                        <span className="material-symbols-outlined"></span>
                        Guardar localmente
                      </>
                    ) : 'Confirmar Reserva'}
                  </button>

                  <div className="terms-notice">
                    <p>Al confirmar, aceptas nuestros <a href="/terminos-de-servicio" className="terms-link">Términos de Servicio</a> y <a href="/politica-cancelacion" className="terms-link">Política de Cancelación</a>.</p>
                    {offlineMode && (
                      <p className="offline-notice">
                        <span className="material-symbols-outlined"></span>
                        La reserva se sincronizará automáticamente cuando se restablezca la conexión.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReservationClient;