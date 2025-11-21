import React, { useState, useRef, useEffect } from 'react';
import '../css/hostcss/Verification.css';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface User {
  name: string;
  email: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

const DocumentVerification: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string>('nueva-terraza');
  const [user] = useState<User>({
    name: 'pedro',
    email: 'pedro@example.com'
  });
  
  const [notifications] = useState<Notification[]>([
    { id: 1, type: 'reservation', message: 'Nueva reserva recibida', time: 'Hace 2 horas', read: false },
    { id: 2, type: 'verification', message: 'Documentos aprobados', time: 'Hace 1 día', read: true },
    { id: 3, type: 'payment', message: 'Pago procesado', time: 'Hace 3 días', read: false }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setFiles([...files, ...selectedFiles]);
    }
  };

  const handleDeleteFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setFiles([...files, ...droppedFiles]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/document-verification/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: files,
          additionalNotes
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        window.location.href = `/confirmation?requestId=${result.requestId}`;
      } else {
        console.error('Error al subir documentos');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitial = () => {
    return user.name.charAt(0).toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation': return 'event_available';
      case 'verification': return 'verified';
      case 'payment': return 'payments';
      default: return 'notifications';
    }
  };

  const markAllAsRead = () => {
    // Implementar lógica para marcar todas como leídas
  };

  const markNotificationAsRead = (id: number) => {
    // Implementar lógica para marcar notificación como leída
  };

  const handleLogout = () => {
    // Implementar lógica de logout
  };

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

  return (
    <div className="document-verification-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <span className="material-symbols-outlined">terrace</span>
              <h1>TerraceRent</h1>
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
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setUserMenuOpen(false);
                        }}
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

      <div className="main-layout">
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
                <span className="material-symbols-outlined">home</span>
                <span>Inicio</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'terrazas' ? 'active' : ''}`}
                href="/host/terraces"
                onClick={() => setActiveMenu('terrazas')}
              >
                <span className="material-symbols-outlined">apartment</span>
                <span>Mis Terrazas</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'reservaciones' ? 'active' : ''}`}
                href="/host/reservations"
                onClick={() => setActiveMenu('reservaciones')}
              >
                <span className="material-symbols-outlined">calendar_month</span>
                <span>Reservaciones</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'nueva-terraza' ? 'active' : ''}`}
                href="/host/DocumentVerification"
                onClick={() => setActiveMenu('nueva-terraza')}
              >
                <span className="material-symbols-outlined">add</span>
                <span>Subir nueva terraza</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-container">
            <div className="title-section">
              <h1 className="main-title">Verificación de Documentos de la Propiedad</h1>
              <p className="subtitle">
                Para garantizar la seguridad y legalidad de todos los espacios en nuestra plataforma, por favor, sube los permisos requeridos de tu propiedad.
              </p>
            </div>

            <div className="content-sections">
              {/* Documentos Requeridos */}
              <div className="section">
                <h2 className="section-title">Documentos Requeridos</h2>
                <p className="section-description">
                  Sube los siguientes documentos para validar tu propiedad: Licencia de funcionamiento, Permiso de uso de suelo, Identificación oficial del propietario. Archivos aceptados: PDF, JPG, PNG (máx. 5MB).
                </p>
                
                {/* Drop Zone */}
                <div 
                  className={`drop-zone ${isDragging ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <span className="material-symbols-outlined drop-zone-icon">cloud_upload</span>
                  <p className="drop-zone-title">Arrastra tus archivos aquí</p>
                  <p className="drop-zone-subtitle">
                    o haz clic en el botón para seleccionar los archivos desde tu dispositivo
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="file-input-hidden"
                  />
                  <button 
                    className="file-input-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar Archivos
                  </button>
                </div>

                {/* File List */}
                <div className="file-list">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="material-symbols-outlined file-icon">
                          {file.type.includes('image') ? 'image' : 'description'}
                        </span>
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                      </div>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteFile(index)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas Adicionales */}
              <div className="section">
                <label className="section-title" htmlFor="additional-notes">
                  Notas Adicionales (Opcional)
                </label>
                <p className="section-description">
                  Añade aquí cualquier aclaración relevante para el equipo de validación.
                </p>
                <textarea 
                  className="textarea" 
                  id="additional-notes" 
                  name="additional-notes" 
                  placeholder="Por ejemplo: 'El permiso de uso de suelo está en proceso de renovación, adjunto el comprobante de trámite.'" 
                  rows={4}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Botones de Acción */}
              <div className="action-buttons">
                <button className="save-button">
                  Guardar y Continuar Más Tarde
                </button>
                <button 
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar para Validación'}
                </button>
              </div>

              {/* Estado de la Validación */}
              <div className="section">
                <h2 className="section-title">Estado de la Validación</h2>
                <div className="validation-status">
                  <span className="material-symbols-outlined status-icon">hourglass_top</span>
                  <div className="status-content">
                    <span className="status-title">Pendiente de Revisión</span>
                    <p className="status-description">
                      ¡Gracias! Hemos recibido tus documentos. Nuestro equipo los revisará en las próximas 48 horas hábiles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentVerification;