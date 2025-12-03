import React, { useState, useRef, useEffect } from 'react';
import '../css/hostcss/Verification.css';
import api from '../../api';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  category: string;
  file: File;
}

interface User {
  name: string;
  email: string;
  id: string;
  role: string;
  phone?: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number;
}

// Interface que coincide con tu schema de MongoDB
interface DocumentVerification {
  _id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  uploadDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para agrupar documentos por sesión
interface DocumentSession {
  id: string;
  date: string;
  documents: DocumentVerification[];
}

const DocumentVerification: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string>('nueva-terraza');
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [userDocuments, setUserDocuments] = useState<DocumentVerification[]>([]);
  const [documentSessions, setDocumentSessions] = useState<DocumentSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'under_review'>('all');
  const [previewDocument, setPreviewDocument] = useState<DocumentVerification | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  
  const [notifications] = useState<Notification[]>([
    { id: 1, type: 'reservation', message: 'Nueva reserva recibida', time: 'Hace 2 horas', read: false },
    { id: 2, type: 'verification', message: 'Documentos aprobados', time: 'Hace 1 día', read: true },
    { id: 3, type: 'payment', message: 'Pago procesado', time: 'Hace 3 días', read: false }
  ]);

  const documentCategories: DocumentCategory[] = [
    {
      id: 'identificacion',
      title: 'Identificación Oficial (INE/IFE)',
      description: 'Documento oficial que acredite tu identidad. Debe estar vigente y ser legible.',
      required: true,
      acceptedFormats: ['.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
    {
      id: 'permisos_terrazas',
      title: 'Permisos de Terrazas',
      description: 'Permisos de uso de suelo y licencia de funcionamiento para terrazas.',
      required: true,
      acceptedFormats: ['.jpg', '.jpeg', '.png'],
      maxSize: 5
    },
    {
      id: 'comprobante_domicilio',
      title: 'Comprobante de Domicilio',
      description: 'Recibo de luz, agua o teléfono no mayor a 3 meses.',
      required: true,
      acceptedFormats: ['.jpg', '.jpeg', '.png'],
      maxSize: 5
    }
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Cargar datos al iniciar
  useEffect(() => {
    loadUserData();
  }, []);

  // Cargar documentos cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      loadUserDocuments();
    }
  }, [user]);

  // Agrupar documentos por sesiones cuando cambien los documentos
  useEffect(() => {
    groupDocumentsBySession();
  }, [userDocuments]);

  // Debug de imágenes
  useEffect(() => {
    if (userDocuments.length > 0) {
      debugImages();
    }
  }, [userDocuments]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token:', token ? 'Presente' : 'No encontrado');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // ✅ USAR EL ENDPOINT CORRECTO: /user/profile
      console.log('📡 Llamando a /user/profile...');
      const response = await api.get('/user/profile');
      console.log('📨 Respuesta de /user/profile:', response);
      
      if (response.data && response.data.user) {
        setUser({
          id: response.data.user._id || response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          phone: response.data.user.phone || ''
        });
        console.log('✅ Usuario cargado correctamente:', response.data.user);
      } else {
        console.error('❌ Estructura de respuesta inesperada:', response.data);
        throw new Error('Estructura de respuesta inesperada');
      }
    } catch (error: any) {
      console.error('💥 Error cargando datos del usuario:', error);
      console.error('📊 Detalles del error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Tu interceptor ya maneja 401, solo mostrar otros errores
      if (error.response?.status !== 401) {
        // Intentar cargar desde token como fallback
        await loadUserFromToken();
      }
    }
  };

  // Función de respaldo para cargar desde token
  const loadUserFromToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🔓 Payload del token (fallback):', payload);
        
        setUser({
          id: payload.id || 'unknown',
          name: 'Usuario', // Nombre por defecto
          email: '', // No tenemos email en el token
          role: payload.role || 'user',
          phone: ''
        });
        console.log('⚠️ Usuario cargado desde token (información limitada)');
      }
    } catch (error) {
      console.error('Error en fallback token:', error);
      // Redirigir al login si todo falla
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const loadUserDocuments = async () => {
    try {
      setLoading(true);
      console.log('📡 Cargando documentos del usuario...');
      
      // ✅ Ahora el backend ya filtra correctamente
      const response = await api.get('/document-verification/user-documents');
      console.log('📨 Respuesta de documentos:', response);
      
      if (response.data.success) {
        setUserDocuments(response.data.documents || []);
        console.log(`✅ ${response.data.documents?.length || 0} documentos cargados`);
      } else {
        console.error('❌ Respuesta sin success:', response.data);
        setUserDocuments([]);
      }
    } catch (error: any) {
      console.error('💥 Error al cargar documentos:', error);
      
      if (error.response?.status === 404) {
        console.log('⚠️ Endpoint no encontrado, probablemente no hay documentos');
        setUserDocuments([]);
      } else if (error.response?.status !== 401) {
        alert('Error al cargar los documentos: ' + (error.response?.data?.message || error.message));
        setUserDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función temporal para debuggear las imágenes
  const debugImages = () => {
    console.log('🔍 DEBUG - Información de documentos:');
    userDocuments.forEach((doc, index) => {
      console.log(`📄 Documento ${index + 1}:`, {
        id: doc._id,
        name: doc.fileName,
        type: doc.mimeType,
        url: getDocumentImageUrl(doc._id),
        category: doc.category,
        isImage: doc.mimeType.includes('image')
      });
    });
  };

  // Agrupar documentos por sesiones (por fecha de subida)
  const groupDocumentsBySession = () => {
    const sessionsMap: { [key: string]: DocumentVerification[] } = {};
    
    userDocuments.forEach(doc => {
      // Usar la fecha sin la hora para agrupar por día
      const dateKey = new Date(doc.uploadDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!sessionsMap[dateKey]) {
        sessionsMap[dateKey] = [];
      }
      sessionsMap[dateKey].push(doc);
    });

    // Convertir a array y ordenar por fecha (más reciente primero)
    const sessions = Object.entries(sessionsMap).map(([date, documents]) => ({
      id: `session-${date}`,
      date,
      documents: documents.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setDocumentSessions(sessions);
  };

  // Agrupar documentos por categoría
  const getDocumentsByCategory = (categoryId: string) => {
    return userDocuments.filter(doc => doc.category === categoryId);
  };

  // Filtrar documentos por estado
  const getFilteredDocuments = () => {
    if (filterStatus === 'all') {
      return userDocuments;
    }
    return userDocuments.filter(doc => doc.status === filterStatus);
  };

  // Filtrar sesiones por estado
  const getFilteredSessions = () => {
    const filteredDocs = getFilteredDocuments();
    const sessionsMap: { [key: string]: DocumentVerification[] } = {};
    
    filteredDocs.forEach(doc => {
      const dateKey = new Date(doc.uploadDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!sessionsMap[dateKey]) {
        sessionsMap[dateKey] = [];
      }
      sessionsMap[dateKey].push(doc);
    });

    return Object.entries(sessionsMap).map(([date, documents]) => ({
      id: `session-${date}`,
      date,
      documents: documents.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getFilesByCategory = (categoryId: string) => {
    return files.filter(file => file.category === categoryId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        category: categoryId,
        file: file
      }));
      setFiles([...files, ...selectedFiles]);
    }
  };

  const handleDeleteFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, categoryId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOverCategory(categoryId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, categoryId: string) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverCategory(null);
    
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        category: categoryId,
        file: file
      }));
      setFiles([...files, ...droppedFiles]);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Debes estar autenticado para enviar documentos');
      return;
    }

    const requiredCategories = documentCategories.filter(cat => cat.required);
    const missingRequired = requiredCategories.some(category => 
      getFilesByCategory(category.id).length === 0
    );

    if (missingRequired) {
      alert('Por favor, sube todos los documentos requeridos antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      files.forEach((fileInfo) => {
        formData.append('documents', fileInfo.file);
        formData.append('categories', fileInfo.category);
      });

      // ✅ NO enviar userId - el backend lo obtiene del token automáticamente
      console.log('📤 Enviando documentos...');
      const response = await api.post('/document-verification/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('📨 Respuesta del upload:', response);
      
      if (response.data.success) {
        // Recargar documentos del usuario
        await loadUserDocuments();
        setFiles([]);
        
        alert(`¡Éxito! ${response.data.totalDocuments} documentos subidos correctamente`);
      } else {
        alert(`Error al subir documentos: ${response.data.message || 'Error desconocido'}`);
      }
    } catch (error: any) {
      console.error('Error al subir documentos:', error);
      console.error('Detalles del error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status !== 401) {
        if (error.response) {
          alert(`Error del servidor: ${error.response.data?.message || 'Error desconocido'}`);
        } else if (error.request) {
          alert('Error de conexión. Verifica que el servidor esté ejecutándose.');
        } else {
          alert('Error inesperado: ' + error.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToTerraza = () => {
    window.location.href = '/host/terraza-info';
  };

  // Función para obtener la URL de la imagen con timestamp para evitar cache
  const getDocumentImageUrl = (documentId: string) => {
    const timestamp = new Date().getTime(); // Evitar cache
    return `http://localhost:4000/api/document-verification/download/${documentId}?t=${timestamp}`;
  };

  // Función para previsualizar documento
  const handlePreviewDocument = async (document: DocumentVerification) => {
    try {
      console.log('👁️ Previsualizando documento:', document.fileName);
      setPreviewDocument(document);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error al previsualizar documento:', error);
      alert('Error al cargar la previsualización del documento');
    }
  };

  // Verificar si el usuario actual es administrador
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const getInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || 'U';
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
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

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

  const getCategoryProgress = (categoryId: string) => {
    const categoryDocuments = getDocumentsByCategory(categoryId);
    return categoryDocuments.length > 0 ? 'completed' : 'pending';
  };

  // Verificar si todos los documentos requeridos están aprobados
  const allRequiredDocumentsApproved = documentCategories.every(category => {
    if (!category.required) return true;
    const categoryDocs = getDocumentsByCategory(category.id);
    return categoryDocs.some(doc => doc.status === 'approved');
  });

  // Verificar si TODOS los documentos de una sesión están aprobados
  const isSessionFullyApproved = (session: DocumentSession) => {
    return session.documents.every(doc => doc.status === 'approved');
  };

  if (loading) {
    return (
      <div className="document-verification-container">
        <div className="loading-fullscreen">
          <div className="loading-spinner"></div>
          <p>Cargando documentos...</p>
        </div>
      </div>
    );
  }

  const filteredSessions = getFilteredSessions();

  return (
    <div className="document-verification-container">
      {/* Header y Sidebar */}
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
              <div className="notification-container" ref={notificationsRef}>
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
                        href="/host/profile"
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

      <div className="main-layout">
        <aside className="profile-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                </svg>
                <h2>Resarvation Express</h2>
              </div>
            </div>
            
            <nav className="sidebar-nav">
              <a 
                className={`nav-item ${activeMenu === 'inicio' ? 'active' : ''}`}
                href="/host/dashboard"
                onClick={() => setActiveMenu('inicio')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Inicio</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'terrazas' ? 'active' : ''}`}
                href="/host/MyTerraces"
              >
                <span className="material-symbols-outlined"></span>
                <span>Mis Terrazas</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'reservaciones' ? 'active' : ''}`}
                href="/host/Reservation"
                onClick={() => setActiveMenu('reservaciones')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Reservaciones</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'nueva-terraza' ? 'active' : ''}`}
                href="/host/DocumentVerification"
                onClick={() => setActiveMenu('nueva-terraza')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Subir permisos</span>
              </a>
            </nav>
          </div>
        </aside>

        <main className="main-content">
          <div className="content-container">
            <div className="title-section">
              <h1 className="main-title">Verificación de Documentos de la Propiedad</h1>
              <p className="subtitle">
                Para garantizar la seguridad y legalidad de todos los espacios en nuestra plataforma, por favor, sube los documentos requeridos organizados por categoría.
              </p>
            </div>

            <div className="two-column-layout">
              {/* Columna izquierda - SUBIR DOCUMENTOS */}
              <div className="left-column">
                <div className="section">
                  <h2 className="section-title">Categorías de Documentos</h2>
                  <p className="section-description">
                    Organiza tus documentos según las siguientes categorías. Todos los documentos son obligatorios.
                  </p>
                  
                  <div className="document-categories">
                    {documentCategories.map(category => (
                      <div 
                        key={category.id}
                        className={`document-category ${getCategoryProgress(category.id)} ${
                          dragOverCategory === category.id ? 'drag-over' : ''
                        }`}
                        onDragOver={(e) => handleDragOver(e, category.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, category.id)}
                      >
                        <div className="category-header">
                          <div className="category-title-section">
                            <h3 className="category-title">
                              {category.title}
                              <span className="required-asterisk">*</span>
                            </h3>
                            <span className="category-status">
                              {getDocumentsByCategory(category.id).length > 0 ? (
                                <span className="status-completed">
                                  <span className="material-symbols-outlined"></span>
                                  Completado ({getDocumentsByCategory(category.id).length})
                                </span>
                              ) : (
                                <span className="status-pending">
                                  <span className="material-symbols-outlined">pending</span>
                                  Pendiente
                                </span>
                              )}
                            </span>
                          </div>
                          <p className="category-description">{category.description}</p>
                          <div className="category-meta">
                            <span className="format-info">
                              Formatos: {category.acceptedFormats.join(', ')}
                            </span>
                            <span className="size-info">
                              Máx: {category.maxSize}MB
                            </span>
                          </div>
                        </div>

                        <div 
                          className={`category-drop-zone ${isDragging && dragOverCategory === category.id ? 'dragover' : ''}`}
                        >
                          <span className="material-symbols-outlined drop-zone-icon">Imagen</span>
                          <p className="drop-zone-title">Arrastra archivos aquí</p>
                          <p className="drop-zone-subtitle">
                            o haz clic para seleccionar desde tu dispositivo
                          </p>
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, category.id)}
                            multiple
                            accept={category.acceptedFormats.join(',')}
                            className="file-input-hidden"
                          />
                          <button 
                            className="file-input-button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.multiple = true;
                              input.accept = category.acceptedFormats.join(',');
                              input.onchange = (e) => handleFileChange(e as any, category.id);
                              input.click();
                            }}
                          >
                            Seleccionar Archivos
                          </button>
                        </div>

                        {/* Archivos listos para subir */}
                        <div className="category-file-list">
                          {getFilesByCategory(category.id).map((file, index) => {
                            const globalIndex = files.findIndex(f => f === file);
                            return (
                              <div key={globalIndex} className="file-item">
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
                                  onClick={() => handleDeleteFile(globalIndex)}
                                >
                                  <span className="material-symbols-outlined">Eliminar</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="action-buttons">
                  <button 
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || files.length === 0}
                  >
                    {isSubmitting ? 'Enviando...' : `Enviar ${files.length} Documentos`}
                  </button>
                </div>
              </div>

              {/* Columna derecha - VER DOCUMENTOS AGRUPADOS POR SESIÓN */}
              <div className="right-column">
                <div className="section">
                  <div className="filter-section">
                    <h2 className="section-title">Estado de la Validación</h2>
                    <div className="status-filters">
                      <button 
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                      >
                        Todos ({userDocuments.length})
                      </button>
                      <button 
                        className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                      >
                        Pendientes ({userDocuments.filter(d => d.status === 'pending').length})
                      </button>
                      <button 
                        className={`filter-btn ${filterStatus === 'under_review' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('under_review')}
                      >
                        En Revisión ({userDocuments.filter(d => d.status === 'under_review').length})
                      </button>
                      <button 
                        className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('approved')}
                      >
                        Aprobados ({userDocuments.filter(d => d.status === 'approved').length})
                      </button>
                      <button 
                        className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('rejected')}
                      >
                        Rechazados ({userDocuments.filter(d => d.status === 'rejected').length})
                      </button>
                    </div>
                  </div>
                  
                  {/* Estado actual */}
                  {files.length > 0 && (
                    <div className="validation-status current">
                      <span className="material-symbols-outlined status-icon"></span>
                      <div className="status-content">
                        <span className="status-title">Preparado para Enviar</span>
                        <p className="status-description">
                          Tienes {files.length} documento(s) listo(s) para enviar a validación.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sesiones de documentos agrupadas */}
                  <div className="document-sessions">
                    <h3>Tus Documentos Subidos</h3>
                    
                    {filteredSessions.map((session) => (
                      <div key={session.id} className="session-group">
                        <div className="session-header">
                          <h4 className="session-date">{session.date}</h4>
                          <span className="session-count">
                            {session.documents.length} documento(s)
                          </span>
                        </div>
                        
                        <div className="session-documents">
                          {session.documents.map((document) => (
                            <div key={document._id} className="document-card">
                              <div className="document-category-badge">
                                {documentCategories.find(cat => cat.id === document.category)?.title}
                              </div>
                              <div className="document-content">
                                <div className="document-preview">
                                  {document.mimeType.includes('image') ? (
                                    <div className="image-preview-container">
                                      <img 
                                        src={getDocumentImageUrl(document._id)}
                                        alt={document.fileName}
                                        className="document-image"
                                        onError={(e) => {
                                          console.error('❌ Error cargando imagen:', document.fileName);
                                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0zNy41IDI1LjVMMjIuNSA0MC41IiBzdHJva2U9IiM2MkJFQjIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yMi41IDI1LjVMMzcuNSA0MC41IiBzdHJva2U9IiM2MkJFQjIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                                          e.currentTarget.alt = 'Error al cargar imagen';
                                        }}
                                        onLoad={(e) => {
                                          console.log('✅ Imagen cargada correctamente:', document.fileName);
                                        }}
                                      />
                                      <div className="image-overlay">
                                        <span className="material-symbols-outlined">zoom_in</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="document-icon">
                                      <span className="material-symbols-outlined">description</span>
                                      <span className="file-format">{document.fileType}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="document-info">
                                  <span className="document-name" title={document.fileName}>
                                    {document.fileName.length > 20 
                                      ? `${document.fileName.substring(0, 20)}...` 
                                      : document.fileName
                                    }
                                  </span>
                                  <span className={`document-status ${document.status}`}>
                                    {document.status === 'pending' ? 'Pendiente' :
                                     document.status === 'approved' ? 'Aprobado' :
                                     document.status === 'rejected' ? 'Rechazado' : 'En Revisión'}
                                  </span>
                                  {document.adminNotes && (
                                    <span className="document-notes" title={document.adminNotes}>
                                      Notas: {document.adminNotes.length > 30 
                                        ? `${document.adminNotes.substring(0, 30)}...` 
                                        : document.adminNotes
                                      }
                                    </span>
                                  )}
                                </div>
                                <div className="document-actions">
                                  <button 
                                    className="preview-button"
                                    onClick={() => handlePreviewDocument(document)}
                                    title="Previsualizar documento"
                                  >
                                    <span className="material-symbols-outlined">ver</span>
                                    
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Botón Continuar a Subir Terraza para sesiones completamente aprobadas */}
                        {isSessionFullyApproved(session) && (
                          <div className="session-action-buttons">
                            <a href="/host/addTerraces">
                              <button 
                                className="continue-terraza-button session-continue-btn"
                                onClick={handleContinueToTerraza}
                              >
                                <span className="material-symbols-outlined"></span>
                                Continuar a Subir Terraza
                              </button>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Mensaje cuando no hay documentos */}
                    {userDocuments.length === 0 && files.length === 0 && (
                      <div className="validation-status empty">
                        <span className="material-symbols-outlined status-icon">folder_open</span>
                        <div className="status-content">
                          <span className="status-title">Sin Documentos Enviados</span>
                          <p className="status-description">
                            Aún no has enviado documentos para validación. Sube tus documentos en la sección de la izquierda.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de previsualización mejorado */}
      {showPreviewModal && previewDocument && (
        <div className="preview-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div className="preview-title-section">
                <h3>{previewDocument.fileName}</h3>
                <div className="preview-document-meta">
                  <span className="preview-category">
                    {documentCategories.find(cat => cat.id === previewDocument.category)?.title}
                  </span>
                  <span className="preview-size">
                    {(previewDocument.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button 
                className="close-modal-btn"
                onClick={() => setShowPreviewModal(false)}
                title="Cerrar"
              >
                <span className="material-symbols-outlined">Cerrar</span>
              </button>
            </div>
            
            <div className="preview-modal-body">
              {previewDocument.mimeType.includes('image') ? (
                <div className="image-preview-wrapper">
                  <img 
                    src={getDocumentImageUrl(previewDocument._id)}
                    alt={previewDocument.fileName}
                    className="preview-image"
                    onError={(e) => {
                      console.error('❌ Error cargando imagen en modal:', previewDocument.fileName);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik04MCA2MEwxMjAgMTAwIE04MCAxMDBMMTIwIDYwIiBzdHJva2U9IiM2MkJFQjIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiPkVycm9yIGNhcmdhbmRvIGltYWdlbjwvdGV4dD4KPC9zdmc+';
                      e.currentTarget.alt = 'Error al cargar imagen';
                    }}
                    onLoad={(e) => {
                      console.log('✅ Imagen cargada en modal:', previewDocument.fileName);
                    }}
                  />
                  <div className="preview-image-actions">
                    <a 
                      href={getDocumentImageUrl(previewDocument._id)} 
                      download={previewDocument.fileName}
                      className="download-image-btn"
                    >
                      <span className="material-symbols-outlined"></span>
                      Descargar
                    </a>
                  </div>
                </div>
              ) : (
                <div className="document-preview-placeholder">
                  <span className="material-symbols-outlined file-icon-large">description</span>
                  <p>Vista previa no disponible para este tipo de archivo</p>
                  <p className="file-type-info">Tipo: {previewDocument.fileType}</p>
                  <a 
                    href={getDocumentImageUrl(previewDocument._id)} 
                    download={previewDocument.fileName}
                    className="download-document-btn"
                  >
                    <span className="material-symbols-outlined"></span>
                    Descargar Documento
                  </a>
                </div>
              )}
            </div>
            
            <div className="preview-modal-footer">
              <div className="preview-document-info">
                <div className="preview-status-section">
                  <span className={`document-status-badge ${previewDocument.status}`}>
                    <span className="status-dot"></span>
                    Estado: {previewDocument.status === 'pending' ? 'Pendiente' :
                           previewDocument.status === 'approved' ? 'Aprobado' :
                           previewDocument.status === 'rejected' ? 'Rechazado' : 'En Revisión'}
                  </span>
                  <span className="upload-date">
                    Subido: {new Date(previewDocument.uploadDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
                
                {previewDocument.adminNotes && (
                  <div className="preview-admin-notes">
                    <strong>Notas del administrador:</strong>
                    <p>{previewDocument.adminNotes}</p>
                  </div>
                )}
              </div>
              
              <div className="preview-actions">
                <button 
                  className="close-preview-btn"
                  onClick={() => setShowPreviewModal(false)}
                >
                  <span className="material-symbols-outlined"></span>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;