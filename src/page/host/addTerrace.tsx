import React, { useState, useRef, useEffect } from "react";
import "../css/hostcss/addTerrace.css";
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
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
}

const PublicarTerraza = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    capacidad: 50,
    caracteristicas: [] as string[],
    reglas: '',
    ubicacion: '',
    precio: '',
    telefonoContacto: '',
    emailContacto: ''
  });

  const [nuevaCaracteristica, setNuevaCaracteristica] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('nueva-terraza');
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Notificaciones de ejemplo
  const [notifications, setNotifications] = useState<Notification[]>([
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
    }
  ]);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
        // Pre-fill contact information from user profile
        setFormData(prev => ({
          ...prev,
          telefonoContacto: user.phone || '',
          emailContacto: user.email || ''
        }));
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validación para teléfono (máximo 10 números)
    if (name === 'telefonoContacto') {
      // Solo permitir números y máximo 10 caracteres
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError(''); // Limpiar error cuando el usuario empiece a escribir
  };

  const handleCapacidadChange = (increment: number) => {
    setFormData(prev => ({
      ...prev,
      capacidad: Math.max(1, prev.capacidad + increment)
    }));
  };

  const agregarCaracteristica = () => {
    if (nuevaCaracteristica.trim() && !formData.caracteristicas.includes(nuevaCaracteristica)) {
      setFormData(prev => ({
        ...prev,
        caracteristicas: [...prev.caracteristicas, nuevaCaracteristica.trim()]
      }));
      setNuevaCaracteristica('');
    }
  };

  const eliminarCaracteristica = (index: number) => {
    setFormData(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarCaracteristica();
    }
  };

  // Manejo de subida de archivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validaciones
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Las imágenes no deben superar los 10MB');
        continue;
      }
      if (uploadedPhotos.length + newFiles.length >= 10) {
        alert('Máximo 10 imágenes permitidas');
        break;
      }

      const preview = URL.createObjectURL(file);
      newFiles.push({ file, preview });
    }

    setUploadedPhotos(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedPhotos(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Validación del formulario
  const validateForm = () => {
    if (!formData.nombre.trim()) {
      return 'El nombre de la terraza es requerido';
    }

    if (!formData.descripcion.trim()) {
      return 'La descripción es requerida';
    }

    if (!formData.ubicacion.trim()) {
      return 'La ubicación es requerida';
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      return 'El precio debe ser mayor a 0';
    }

    if (!formData.telefonoContacto || formData.telefonoContacto.length !== 10) {
      return 'El teléfono debe tener exactamente 10 dígitos';
    }

    if (!formData.emailContacto || !/\S+@\S+\.\S+/.test(formData.emailContacto)) {
      return 'El email debe ser válido';
    }

    if (uploadedPhotos.length === 0) {
      return 'Debes subir al menos una foto de la terraza';
    }

    return null;
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // Preparar FormData
      const submitData = new FormData();

      // Datos básicos
      submitData.append('name', formData.nombre);
      submitData.append('description', formData.descripcion);
      submitData.append('capacity', formData.capacidad.toString());
      submitData.append('location', formData.ubicacion);
      submitData.append('price', formData.precio);
      submitData.append('contactPhone', formData.telefonoContacto);
      submitData.append('contactEmail', formData.emailContacto);
      submitData.append('rules', formData.reglas);
      
      // Convertir características a JSON string
      submitData.append('amenities', JSON.stringify(formData.caracteristicas));

      // Agregar fotos
      uploadedPhotos.forEach((photo) => {
        submitData.append('photos', photo.file);
      });

      console.log('Enviando datos...', {
        name: formData.nombre,
        description: formData.descripcion,
        capacity: formData.capacidad,
        location: formData.ubicacion,
        price: formData.precio,
        contactPhone: formData.telefonoContacto,
        contactEmail: formData.emailContacto,
        amenities: formData.caracteristicas,
        rules: formData.reglas,
        photosCount: uploadedPhotos.length
      });

      // Enviar solicitud
      const response = await api.post('/publication-requests', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 segundos timeout
      });

      if (response.data.success) {
        alert('¡Solicitud enviada exitosamente! Tu terraza está en revisión.');
        
        // Redirigir a Mis Terrazas
        window.location.href = '/host/MyTerraces';
      } else {
        throw new Error(response.data.message || 'Error al enviar la solicitud');
      }

    } catch (error: any) {
      console.error('Error al enviar formulario:', error);
      
      let errorMessage = 'Error al enviar la solicitud. Por favor, intenta nuevamente.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        handleLogout();
      } else if (error.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'El servidor no respondió a tiempo. Por favor, intenta nuevamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
      default: return 'notifications';
    }
  };

  // Obtener inicial para el avatar
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  // Obtener fecha de membresía
  const getMemberSince = () => {
    return user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short' 
    }) : 'Jan 2023';
  };

  return (
    <div className="pt-main-container">
      {/* Header */}
      <header className="pt-header">
        <div className="pt-header-container">
          <div className="pt-logo-section">
            <div className="pt-logo">
              <span className="pt-icon">terrace</span>
              <h1 className="pt-logo-text">TerrazaApp</h1>
            </div>
          </div>
          
          <nav className="pt-nav-section">
            <div className="pt-user-section" ref={userMenuRef}>
              {/* Notificaciones */}
              <div className="pt-notification-container" ref={notificationsRef}>
                <button 
                  className="pt-icon-btn pt-notification-btn"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <span className="pt-icon">notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="pt-notification-badge">{unreadNotifications}</span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className="pt-notification-dropdown">
                    <div className="pt-notification-header">
                      <h3 className="pt-notification-title">Notificaciones</h3>
                      {unreadNotifications > 0 && (
                        <button className="pt-mark-all-read" onClick={markAllAsRead}>
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    <div className="pt-notification-list">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`pt-notification-item ${notification.read ? '' : 'pt-unread'}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="pt-notification-icon">
                            <span className="pt-icon">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                          <div className="pt-notification-content">
                            <p className="pt-notification-message">{notification.message}</p>
                            <span className="pt-notification-time">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {user ? (
                <div 
                  className="pt-user-profile"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="pt-avatar">
                    <span className="pt-avatar-initial">{getInitial()}</span>
                  </div>
                  <span className="pt-user-name">{user.name}</span>
                  
                  {userMenuOpen && (
                    <div className="pt-user-dropdown">
                      <a className="pt-dropdown-item" href="/host/profile">
                        <span className="pt-icon">person</span>
                        Mi Perfil
                      </a>
                      <a 
                        className="pt-dropdown-item" 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setUserMenuOpen(false);
                        }}
                      >
                        <span className="pt-icon">settings</span>
                        Configuración
                      </a>
                      <div className="pt-dropdown-divider"></div>
                      <a className="pt-dropdown-item" onClick={handleLogout}>
                        <span className="pt-icon">logout</span>
                        Cerrar Sesión
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-auth-buttons">
                  <a href="/login" className="pt-login-btn">Iniciar Sesión</a>
                  <a href="/register" className="pt-register-btn">Registrarse</a>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Input de archivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={handleFileUpload}
      />

      {/* Main Content con Sidebar */}
      <div className="pt-layout-with-sidebar">
        {/* Sidebar */}
        <aside className="pt-sidebar">
          <div className="pt-sidebar-content">
            <div className="pt-sidebar-header">
              <div className="pt-sidebar-logo">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
                <h2 className="pt-sidebar-title">TerraceRent</h2>
              </div>
            </div>
            
            {/* Menú de Navegación */}
            <nav className="pt-sidebar-nav">
              <a 
                className={`pt-nav-item ${activeMenu === 'inicio' ? 'pt-nav-active' : ''}`}
                href="/host/dashboard"
                onClick={() => setActiveMenu('inicio')}
              >
                <span className="pt-icon">home</span>
                <span className="pt-nav-text">Inicio</span>
              </a>
              <a 
                className={`pt-nav-item ${activeMenu === 'terrazas' ? 'pt-nav-active' : ''}`}
                href="/host/terraces"
                onClick={() => setActiveMenu('terrazas')}
              >
                <span className="pt-icon">terrace</span>
                <span className="pt-nav-text">Mis Terrazas</span>
              </a>
              <a 
                className={`pt-nav-item ${activeMenu === 'reservaciones' ? 'pt-nav-active' : ''}`}
                href="/host/reservations"
                onClick={() => setActiveMenu('reservaciones')}
              >
                <span className="pt-icon">calendar_month</span>
                <span className="pt-nav-text">Reservaciones</span>
              </a>
              <a 
                className={`pt-nav-item ${activeMenu === 'nueva-terraza' ? 'pt-nav-active' : ''}`}
                href="/host/DocumentVerification"
                onClick={() => setActiveMenu('nueva-terraza')}
              >
                <span className="pt-icon">add</span>
                <span className="pt-nav-text">Subir nueva terraza</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="pt-main-content">
          <div className="pt-content-wrapper">
            
            {/* User Profile Header */}
            {user && (
              <div className="pt-profile-header">
                <div className="pt-profile-info">
                  <div className="pt-avatar-container">
                    <div className="pt-profile-avatar">
                      <span className="pt-profile-avatar-initial">{getInitial()}</span>
                    </div>
                    <button className="pt-edit-avatar-btn">
                      <span className="pt-icon">edit</span>
                    </button>
                  </div>
                  <div className="pt-profile-greeting">
                    <h1 className="pt-greeting-title">¡Hola, {user.name}!</h1>
                    <p className="pt-greeting-subtitle">Bienvenido de nuevo a tu perfil de anfitrión</p>
                    <p className="pt-member-since">Miembro desde: {getMemberSince()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Heading & Progress Bar */}
            <div className="pt-page-header">
              <div className="pt-title-section">
                <h1 className="pt-page-title">Publica tu Terraza</h1>
                <p className="pt-page-subtitle">Completa los siguientes campos para añadir tu espacio a nuestra plataforma.</p>
              </div>
              <div className="pt-progress-section">
                <div className="pt-progress-info">
                  <span className="pt-progress-label">Progreso</span>
                  <span className="pt-progress-count">1 de 4</span>
                </div>
                <div className="pt-progress-bar">
                  <div className="pt-progress-fill" style={{width: '25%'}}></div>
                </div>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="pt-alert pt-alert-error">
                <span className="pt-icon">error</span>
                <div>
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Form Sections */}
            <form className="pt-form" onSubmit={handleSubmit}>
              
              {/* Basic Information */}
              <section className="pt-form-section">
                <h2 className="pt-section-title">1. Información Básica</h2>
                <div className="pt-form-grid">
                  <div className="pt-form-group">
                    <label className="pt-label" htmlFor="terrace-name">
                      Nombre de la terraza *
                    </label>
                    <input
                      className="pt-input"
                      id="terrace-name"
                      name="nombre"
                      placeholder="Ej: Terraza El Mirador"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="pt-form-group">
                    <label className="pt-label" htmlFor="terrace-description">
                      Descripción detallada *
                    </label>
                    <textarea
                      className="pt-textarea"
                      id="terrace-description"
                      name="descripcion"
                      placeholder="Describe qué hace especial a tu espacio. Incluye detalles sobre las vistas, el ambiente y las amenidades únicas."
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="pt-form-group">
                    <label className="pt-label" htmlFor="ubicacion">
                      Ubicación *
                    </label>
                    <input
                      className="pt-input"
                      id="ubicacion"
                      name="ubicacion"
                      placeholder="Ej: Av. Principal #123, Ciudad"
                      value={formData.ubicacion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="pt-form-group">
                    <label className="pt-label" htmlFor="precio">
                      Precio por hora (MXN) *
                    </label>
                    <input
                      className="pt-input"
                      id="precio"
                      name="precio"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Ej: 500"
                      value={formData.precio}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Photo Gallery */}
              <section className="pt-form-section">
                <h2 className="pt-section-title">2. Galería de Fotos</h2>
                <p className="pt-section-description">
                  Sube fotos de alta calidad que muestren todos los ángulos de tu espacio. *
                </p>
                
                {/* Área de subida de fotos */}
                <div 
                  className="pt-upload-area"
                  onClick={triggerFileInput}
                >
                  <span className="pt-icon pt-upload-icon">upload_file</span>
                  <p className="pt-upload-text">
                    Arrastra tus fotos aquí o <span className="pt-upload-cta">haz clic para subirlas</span>
                  </p>
                  <p className="pt-upload-hint">PNG, JPG hasta 10MB (Máximo 10 imágenes)</p>
                </div>

                {/* Fotos subidas */}
                {uploadedPhotos.length > 0 && (
                  <div className="pt-photo-grid">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="pt-photo-item">
                        <img 
                          src={photo.preview} 
                          alt={`Preview ${index + 1}`}
                          className="pt-photo-preview"
                        />
                        <button
                          type="button"
                          className="pt-photo-remove"
                          onClick={() => removeFile(index)}
                        >
                          <span className="pt-icon">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Details & Services */}
              <section className="pt-form-section">
                <h2 className="pt-section-title">3. Detalles y Servicios</h2>
                <div className="pt-details-grid">
                  <div className="pt-form-group">
                    <label className="pt-label">
                      Capacidad máxima (personas) *
                    </label>
                    <div className="pt-capacity-control">
                      <button 
                        type="button"
                        className="pt-capacity-btn pt-capacity-minus"
                        onClick={() => handleCapacidadChange(-1)}
                      >
                        <span className="pt-icon">remove</span>
                      </button>
                      <input
                        className="pt-capacity-input"
                        type="number"
                        value={formData.capacidad}
                        readOnly
                      />
                      <button 
                        type="button"
                        className="pt-capacity-btn pt-capacity-plus"
                        onClick={() => handleCapacidadChange(1)}
                      >
                        <span className="pt-icon">add</span>
                      </button>
                    </div>
                  </div>
                  {/* <div className="pt-form-group">
                    <label className="pt-label">
                      Características principales
                    </label>
                    <div className="pt-features-input-container">
                      <input
                        className="pt-input"
                        placeholder="Ej: Alberca, Asador..."
                        value={nuevaCaracteristica}
                        onChange={(e) => setNuevaCaracteristica(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <span className="pt-input-hint">Enter para añadir</span>
                    </div>
                    <div className="pt-features-tags">
                      {formData.caracteristicas.map((caracteristica, index) => (
                        <span key={index} className="pt-tag">
                          <span className="pt-tag-text">{caracteristica}</span>
                          <button 
                            type="button"
                            className="pt-tag-remove"
                            onClick={() => eliminarCaracteristica(index)}
                          >
                            <span className="pt-icon">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div> */}
                  <div className="pt-form-group">
                    <label className="pt-label" htmlFor="telefonoContacto">
                      Teléfono de contacto *
                    </label>
                    <input
                      className="pt-input"
                      id="telefonoContacto"
                      name="telefonoContacto"
                      type="tel"
                      placeholder="Ej: 5512345678"
                      value={formData.telefonoContacto}
                      onChange={handleInputChange}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                    />
                    <small className="pt-input-help">
                      {formData.telefonoContacto.length}/10 dígitos
                    </small>
                  </div>
                  <div className="pt-form-group">
                    <label className="pt-label" htmlFor="emailContacto">
                      Email de contacto *
                    </label>
                    <input
                      className="pt-input"
                      id="emailContacto"
                      name="emailContacto"
                      type="email"
                      placeholder="Ej: contacto@terraza.com"
                      value={formData.emailContacto}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Rules */}
              <section className="pt-form-section">
                <h2 className="pt-section-title">4. Reglas y Condiciones</h2>
                <div className="pt-form-group">
                  <label className="pt-label" htmlFor="terrace-rules">
                    Reglas del lugar
                  </label>
                  <textarea
                    className="pt-textarea"
                    id="terrace-rules"
                    name="reglas"
                    placeholder="Especifica tus reglas sobre horarios, política de ruido, mascotas, etc."
                    value={formData.reglas}
                    onChange={handleInputChange}
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="pt-form-actions">
                <button 
                  type="button" 
                  className="pt-btn pt-btn-secondary"
                  onClick={() => window.history.back()}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="pt-btn pt-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="pt-loading-spinner"></span>
                      Enviando...
                    </>
                  ) : (
                    'Enviar para Revisión'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicarTerraza;