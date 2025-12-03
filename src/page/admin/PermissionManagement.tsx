import React, { useState, useEffect } from 'react';
import '../css/admincss/PermissionManagement.css';

interface Document {
  _id: string;
  fileName: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  uploadDate: string;
  adminNotes?: string;
  reviewDate?: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  userId: string;
  downloadUrl?: string;
  fileType?: string;
  description?: string;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Terrace {
  _id: string;
  terraceData: {
    name: string;
    description: string;
    location: string;
    capacity: number;
    price: number;
    contactPhone: string;
    contactEmail: string;
    amenities: string[];
    rules?: string;
  };
  owner: Owner;
  photos: Array<{
    filename: string;
    filePath: string;
    originalName: string;
    mimetype: string;
    size: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  role: string;
}

const PermissionManagement: React.FC = () => {
  const [terraces, setTerraces] = useState<Terrace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Estados para modales
  const [selectedTerrace, setSelectedTerrace] = useState<Terrace | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Documentos del usuario seleccionado
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  // Estados para filtros
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [docStatusFilter, setDocStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [documentAdminNotes, setDocumentAdminNotes] = useState('');
  const [documentNewStatus, setDocumentNewStatus] = useState<'pending' | 'approved' | 'rejected' | 'under_review'>('pending');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debug state
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Cargar usuario
  useEffect(() => {
    console.log('🔄 [DEBUG] useEffect - Cargando usuario');
    loadUserData();
  }, []);

  // Cargar terrazas cuando el usuario esté disponible
  useEffect(() => {
    console.log('🔄 [DEBUG] useEffect - user changed:', { 
      user, 
      hasUser: !!user, 
      isAdmin: user?.role === 'admin' 
    });
    
    if (user && user.role === 'admin') {
      console.log('✅ [DEBUG] Usuario es admin, cargando terrazas');
      loadTerraces();
    } else if (user && user.role !== 'admin') {
      console.log('❌ [DEBUG] Usuario NO es admin');
      setError('No tienes permisos de administrador para acceder a esta página');
      setLoading(false);
    }
  }, [user, refreshTrigger]);

  const loadUserData = async () => {
    try {
      console.log('🔐 [DEBUG] Iniciando loadUserData');
      const token = localStorage.getItem('token');
      console.log('🔐 [DEBUG] Token encontrado:', !!token);
      
      if (!token) {
        console.log('❌ [DEBUG] No hay token, redirigiendo a login');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:4000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('👤 [DEBUG] Respuesta de perfil:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('👤 [DEBUG] Datos de usuario recibidos:', data);
        
        if (data.user) {
          const userData = {
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role
          };
          console.log('👤 [DEBUG] Usuario establecido:', userData);
          setUser(userData);
        }
      } else {
        console.log('❌ [DEBUG] Error en perfil, redirigiendo a login');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error en loadUserData:', error);
      window.location.href = '/login';
    }
  };

  const loadTerraces = async () => {
    try {
      console.log('🏢 [DEBUG] Iniciando loadTerraces');
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('🏢 [DEBUG] Token para terrazas:', !!token);
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      console.log('📡 [DEBUG] Cargando terrazas...');
      
      let response = await fetch('http://localhost:4000/api/publication-requests/pending-terraces', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 [DEBUG] Ruta 1 - Estado:', response.status);
      
      if (!response.ok) {
        console.log('⚠️ [DEBUG] Probando ruta alternativa...');
        response = await fetch('http://localhost:4000/api/admin/pending-terraces', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('📡 [DEBUG] Ruta 2 - Estado:', response.status);
      }
      
      if (!response.ok) {
        console.log('⚠️ [DEBUG] Probando ruta general...');
        response = await fetch('http://localhost:4000/api/publication-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('📡 [DEBUG] Ruta 3 - Estado:', response.status);
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('📨 [DEBUG] Datos de terrazas recibidos:', data);
        
        let terracesData = data.terraces || data.data || [];
        
        if (Array.isArray(data) && !terracesData.length) {
          terracesData = data;
        }
        
        console.log(`✅ [DEBUG] ${terracesData.length} terrazas cargadas`);
        console.log('🏢 [DEBUG] Ejemplo de terraza:', terracesData[0]);
        setTerraces(terracesData);
      } else {
        const errorData = await response.json();
        console.error('❌ [DEBUG] Error cargando terrazas:', errorData);
        setError(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('❌ [DEBUG] Error en loadTerraces:', error);
      setError(error.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN MEJORADA CON MÁS DEBUGGING
  const loadUserDocuments = async (userId: string) => {
    try {
      console.log('📄 [DEBUG] ========== INICIANDO loadUserDocuments ==========');
      console.log('📄 [DEBUG] userId recibido:', userId);
      console.log('📄 [DEBUG] Tipo de userId:', typeof userId);
      
      setLoadingDocuments(true);
      const token = localStorage.getItem('token');
      console.log('📄 [DEBUG] Token disponible:', !!token);
      
      if (!token) {
        console.error('❌ [DEBUG] No hay token disponible');
        return;
      }

      // PRIMERO: Probar la ruta específica para admin
      const adminUrl = `http://localhost:4000/api/document-verification/admin/user-documents/${userId}`;
      console.log('📄 [DEBUG] Intentando URL de admin:', adminUrl);
      
      let response = await fetch(adminUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📄 [DEBUG] Respuesta de admin - Estado:', response.status, response.statusText);
      console.log('📄 [DEBUG] Respuesta de admin - Headers:', Object.fromEntries(response.headers.entries()));
      
      // SI FALLA, PROBAR LA RUTA REGULAR
      if (!response.ok) {
        console.log('⚠️ [DEBUG] Ruta de admin falló, probando ruta regular...');
        const regularUrl = `http://localhost:4000/api/document-verification/user-documents/${userId}`;
        console.log('📄 [DEBUG] Intentando URL regular:', regularUrl);
        
        response = await fetch(regularUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📄 [DEBUG] Respuesta regular - Estado:', response.status, response.statusText);
      }
      
      // SI AÚN FALLA, PROBAR RUTA SIN USERID
      if (!response.ok) {
        console.log('⚠️ [DEBUG] Todas las rutas fallaron, probando ruta general...');
        const generalUrl = `http://localhost:4000/api/document-verification/all-documents`;
        console.log('📄 [DEBUG] Intentando URL general:', generalUrl);
        
        response = await fetch(generalUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📄 [DEBUG] Respuesta general - Estado:', response.status, response.statusText);
      }
      
      const responseText = await response.text();
      console.log('📄 [DEBUG] Respuesta como texto:', responseText.substring(0, 500));
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('❌ [DEBUG] Error parseando JSON:', parseError);
        data = {};
      }
      
      console.log('📄 [DEBUG] Datos parseados:', data);
      
      // Guardar info de debug
      setDebugInfo({
        timestamp: new Date().toISOString(),
        userId,
        responseStatus: response.status,
        responseStatusText: response.statusText,
        data: data
      });
      
      if (response.ok) {
        // Intentar diferentes estructuras de respuesta
        let documents = [];
        
        if (data.documents && Array.isArray(data.documents)) {
          documents = data.documents;
          console.log('📄 [DEBUG] Documentos encontrados en data.documents:', documents.length);
        } else if (Array.isArray(data)) {
          documents = data;
          console.log('📄 [DEBUG] Documentos encontrados como array directo:', documents.length);
        } else if (data.data && Array.isArray(data.data)) {
          documents = data.data;
          console.log('📄 [DEBUG] Documentos encontrados en data.data:', documents.length);
        } else {
          console.log('⚠️ [DEBUG] No se encontraron documentos en la respuesta');
        }
        
        console.log('📄 [DEBUG] Total de documentos a procesar:', documents.length);
        
        if (documents.length > 0) {
          const documentsWithUrl = documents.map((doc: any, index: number) => {
            console.log(`📄 [DEBUG] Procesando documento ${index + 1}:`, {
              id: doc._id,
              name: doc.fileName,
              category: doc.category,
              status: doc.status
            });
            
            return {
              _id: doc._id || `mock-${index}`,
              fileName: doc.fileName || `Documento ${index + 1}`,
              category: doc.category || 'general',
              status: doc.status || 'pending',
              uploadDate: doc.uploadDate || doc.createdAt || new Date().toISOString(),
              adminNotes: doc.adminNotes || '',
              reviewDate: doc.reviewDate,
              mimeType: doc.mimeType || 'image/png',
              fileSize: doc.fileSize || 0,
              filePath: doc.filePath || '',
              userId: doc.userId || userId,
              downloadUrl: doc.downloadUrl || `http://localhost:4000/api/document-verification/download/${doc._id || 'test'}`,
              fileType: doc.fileType,
              description: doc.description
            };
          });
          
          console.log('✅ [DEBUG] Documentos procesados:', documentsWithUrl);
          setUserDocuments(documentsWithUrl);
        } else {
          console.log('📄 [DEBUG] No hay documentos, mostrando datos de prueba');
          
          // DATOS DE PRUEBA PARA DEBUG
          const mockDocuments: Document[] = [
            {
              _id: 'mock-1',
              fileName: 'Principal.png',
              category: 'identificacion',
              status: 'pending',
              uploadDate: new Date().toISOString(),
              mimeType: 'image/png',
              fileSize: 421902,
              filePath: 'img-1764740281349-tjbdul.png',
              userId: userId,
              downloadUrl: '#',
              description: 'Identificación Oficial (MOCK)'
            },
            {
              _id: 'mock-2',
              fileName: 'Banner.png',
              category: 'permisos_terrazas',
              status: 'pending',
              uploadDate: new Date().toISOString(),
              mimeType: 'image/png',
              fileSize: 1318893,
              filePath: 'img-1764740281349-pgvm60.png',
              userId: userId,
              downloadUrl: '#',
              description: 'Permisos de Terrazas (MOCK)'
            }
          ];
          
          console.log('📄 [DEBUG] Estableciendo documentos mock');
          setUserDocuments(mockDocuments);
        }
      } else {
        console.error('❌ [DEBUG] Error en la respuesta:', data);
        
        // Aún así mostrar datos de prueba
        const mockDocuments: Document[] = [
          {
            _id: 'error-mock-1',
            fileName: 'Documento de Prueba 1',
            category: 'identificacion',
            status: 'pending',
            uploadDate: new Date().toISOString(),
            mimeType: 'image/png',
            fileSize: 100000,
            filePath: 'test.png',
            userId: userId,
            downloadUrl: '#',
            description: 'Documento de prueba por error'
          }
        ];
        
        setUserDocuments(mockDocuments);
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error en loadUserDocuments:', error);
      
      // Datos de prueba como fallback
      const mockDocuments: Document[] = [
        {
          _id: 'catch-mock-1',
          fileName: 'Documento Catch',
          category: 'general',
          status: 'pending',
          uploadDate: new Date().toISOString(),
          mimeType: 'application/octet-stream',
          fileSize: 0,
          filePath: '',
          userId: userId,
          downloadUrl: '#',
          description: 'Documento de fallback'
        }
      ];
      
      setUserDocuments(mockDocuments);
    } finally {
      console.log('📄 [DEBUG] ========== FINALIZANDO loadUserDocuments ==========');
      setLoadingDocuments(false);
    }
  };

  const handleUpdateDocumentStatus = async (documentId: string, status: string, notes?: string) => {
    console.log('🔄 [DEBUG] handleUpdateDocumentStatus:', { documentId, status, notes });
    
    if (!confirm(`¿Estás seguro de cambiar el estado del documento a "${status}"?`)) return;
    
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      console.log(`🔄 [DEBUG] Actualizando documento ${documentId} a ${status}...`);
      
      const response = await fetch(`http://localhost:4000/api/document-verification/${documentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status,
          adminNotes: notes || ''
        })
      });
      
      const responseData = await response.json();
      console.log(`📨 [DEBUG] Respuesta de actualización:`, responseData);
      
      if (response.ok && responseData.success) {
        alert(`✅ Documento ${status} exitosamente`);
        
        setUserDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc._id === documentId ? { 
              ...doc, 
              status: status as any,
              adminNotes: notes || doc.adminNotes,
              reviewDate: new Date().toISOString()
            } : doc
          )
        );
        
        setShowStatusModal(false);
        setSelectedDocument(null);
      } else {
        console.error('❌ [DEBUG] Error del servidor:', responseData);
        alert(`❌ Error: ${responseData.message || 'No se pudo actualizar el documento'}`);
      }
    } catch (error: any) {
      console.error('❌ [DEBUG] Error de conexión:', error);
      alert('❌ Error de conexión con el servidor');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenStatusModal = (document: Document) => {
    console.log('📝 [DEBUG] Abriendo modal para documento:', document._id);
    setSelectedDocument(document);
    setDocumentNewStatus(document.status);
    setDocumentAdminNotes(document.adminNotes || '');
    setShowStatusModal(true);
  };

  const handleViewDocuments = async (terrace: Terrace) => {
    console.log('🔍 [DEBUG] ========== CLICK EN VER DOCUMENTOS ==========');
    console.log('🔍 [DEBUG] Terraza seleccionada:', {
      id: terrace._id,
      name: terrace.terraceData.name,
      owner: terrace.owner.name,
      ownerId: terrace.owner._id,
      ownerIdLength: terrace.owner._id?.length
    });
    
    setSelectedTerrace(terrace);
    
    if (terrace.owner._id) {
      console.log('🔍 [DEBUG] Llamando a loadUserDocuments con ID:', terrace.owner._id);
      await loadUserDocuments(terrace.owner._id);
    } else {
      console.error('❌ [DEBUG] ERROR: No hay owner._id en la terraza');
    }
    
    setShowDocumentsModal(true);
    console.log('🔍 [DEBUG] Modal mostrado: true');
  };

  const handleApprove = async (terraceId: string) => {
    console.log('✅ [DEBUG] Aprobando terraza:', terraceId);
    
    if (!confirm('¿Estás seguro de aprobar esta terraza? Esto la hará visible para todos los clientes.')) return;
    
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/publication-requests/${terraceId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: 'Terraza aprobada por administrador'
        })
      });
      
      if (response.ok) {
        alert('✅ Terraza aprobada exitosamente');
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorData = await response.json();
        alert(`❌ Error al aprobar terraza: ${errorData.message}`);
      }
    } catch (error: any) {
      console.error('Error al aprobar terraza:', error);
      alert('Error al aprobar terraza');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (terrace: Terrace) => {
    setSelectedTerrace(terrace);
    setRejectionReason(terrace.adminNotes || '');
    setShowRejectModal(true);
  };

  const handleConfirmRejection = async () => {
    if (!selectedTerrace) {
      alert('No hay terraza seleccionada');
      return;
    }

    if (!rejectionReason.trim()) {
      alert('Por favor, proporciona una razón para el rechazo');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/publication-requests/${selectedTerrace._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: rejectionReason
        })
      });
      
      if (response.ok) {
        alert('✅ Terraza rechazada exitosamente');
        setShowRejectModal(false);
        setSelectedTerrace(null);
        setRejectionReason('');
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorData = await response.json();
        alert(`❌ Error al rechazar terraza: ${errorData.message}`);
      }
    } catch (error: any) {
      console.error('Error al rechazar terraza:', error);
      alert('Error al rechazar terraza');
    } finally {
      setProcessing(false);
    }
  };

  const getDocumentUrl = (documentId: string) => {
    return `http://localhost:4000/api/document-verification/download/${documentId}`;
  };

  const getTerraceImageUrl = (terrace: Terrace) => {
    if (terrace.photos && terrace.photos.length > 0 && terrace.photos[0].filename) {
      return `http://localhost:4000/api/terrace-images/${terrace.photos[0].filename}`;
    }
    return 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=400&auto=format&fit=crop';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge status-approved">✅ Aprobado</span>;
      case 'rejected':
        return <span className="status-badge status-rejected">❌ Rechazado</span>;
      case 'pending':
        return <span className="status-badge status-pending">⏳ Pendiente</span>;
      default:
        return <span className="status-badge status-pending">⏳ Pendiente</span>;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="doc-status-badge doc-approved">✅ Aprobado</span>;
      case 'rejected':
        return <span className="doc-status-badge doc-rejected">❌ Rechazado</span>;
      case 'under_review':
        return <span className="doc-status-badge doc-under-review">🔍 En Revisión</span>;
      default:
        return <span className="doc-status-badge doc-pending">⏳ Pendiente</span>;
    }
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'identificacion': 'Identificación Oficial',
      'permisos_terrazas': 'Permisos de Terrazas',
      'comprobante_domicilio': 'Comprobante de Domicilio',
      'general': 'Documento General'
    };
    return categories[category] || category;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredDocuments = () => {
    if (docStatusFilter === 'all') {
      return userDocuments;
    }
    return userDocuments.filter(doc => doc.status === docStatusFilter);
  };

  const filteredTerraces = terraces.filter(terrace => {
    if (filterStatus !== 'all' && terrace.status !== filterStatus) {
      return false;
    }
    
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        terrace.terraceData.name.toLowerCase().includes(searchLower) ||
        terrace.owner.name.toLowerCase().includes(searchLower) ||
        terrace.owner.email.toLowerCase().includes(searchLower) ||
        terrace.terraceData.location.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const pendingCount = terraces.filter(t => t.status === 'pending').length;
  const rejectedCount = terraces.filter(t => t.status === 'rejected').length;

  // Añadir efecto para debug
  useEffect(() => {
    console.log('📊 [DEBUG] Estado de userDocuments actualizado:', {
      count: userDocuments.length,
      documents: userDocuments.map(d => ({
        id: d._id,
        name: d.fileName,
        category: d.category,
        status: d.status
      }))
    });
  }, [userDocuments]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="permission-management-container">
        <div className="admin-permission-error">
          <h2>🔒 Acceso Restringido</h2>
          <p>Esta página solo está disponible para administradores.</p>
          <a href="/admin/dashboard" className="back-button">Volver al dashboard</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="permission-management-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando solicitudes de terrazas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="permission-management-container">
      {/* Panel de debug (solo desarrollo) */}
{debugInfo && (
  <div className="debug-panel" style={{
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    background: '#f0f0f0',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '5px',
    maxWidth: '400px',
    maxHeight: '300px',
    overflow: 'auto',
    zIndex: 9999,
    fontSize: '12px'
  }}>
    <h4>🔧 Debug Info</h4>
    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    <button onClick={() => setDebugInfo(null)}>Cerrar</button>
  </div>
)}

      {/* Header */}
      <div className="approval-header">
        <div className="header-top-row">
          <div className="header-titles">
            <h1 className="main-title">Gestión de Permisos de Terrazas</h1>
            <p className="subtitle">
              Revisa, aprueba o rechaza las solicitudes de permisos de las nuevas terrazas.
            </p>
          </div>
          <button 
            className="logout-btn"
            onClick={() => window.location.href = '/admin/dashboard'}
            title="Volver al dashboard"
          >
            ← Volver al Dashboard
          </button>
        </div>
        
        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-number">{terraces.length}</span>
            <span className="stat-label">Total Solicitudes</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{rejectedCount}</span>
            <span className="stat-label">Rechazadas</span>
          </div>
        </div>
        
        <div className="controls-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar terraza, propietario o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Todas ({terraces.length})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pendientes ({pendingCount})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilterStatus('rejected')}
            >
              Rechazadas ({rejectedCount})
            </button>
          </div>
          
          <div className="action-buttons-container">
            <button 
              className="refresh-btn"
              onClick={() => {
                console.log('🔄 [DEBUG] Botón refresh clickeado');
                setRefreshTrigger(prev => prev + 1);
              }}
              disabled={processing}
            >
              {processing ? 'Actualizando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="requests-section">
        <div className="section-header">
          <h2 className="section-title">
            Solicitudes en Proceso ({filteredTerraces.length})
          </h2>
          <div className="table-actions">
            <span className="table-info">
              Mostrando {filteredTerraces.length} de {terraces.length} solicitudes
            </span>
          </div>
        </div>
        
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <p>{error}</p>
              <button className="retry-btn" onClick={loadTerraces}>
                Reintentar
              </button>
            </div>
          </div>
        )}
        
        {filteredTerraces.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No hay solicitudes pendientes</h3>
            <p>Todas las solicitudes han sido procesadas o no hay coincidencias con tu búsqueda.</p>
          </div>
        ) : (
          <div className="terraces-table-container">
            <table className="terraces-table">
              <thead>
                <tr>
                  <th>TERRAZA</th>
                  <th>PROPIETARIO</th>
                  <th>FECHA SOLICITUD</th>
                  <th>DOCUMENTOS</th>
                  <th>ESTADO</th>
                  <th>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {filteredTerraces.map(terrace => (
                  <tr key={terrace._id} className={`terrace-row status-${terrace.status}`}>
                    <td className="terrace-cell">
                      <div className="terrace-info">
                        <div className="terrace-image">
                          <img 
                            src={getTerraceImageUrl(terrace)} 
                            alt={terrace.terraceData.name}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=400&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        <div className="terrace-details">
                          <strong className="terrace-name">{terrace.terraceData.name}</strong>
                          <p className="terrace-location">📍 {terrace.terraceData.location}</p>
                          <p className="terrace-capacity">👥 Capacidad: {terrace.terraceData.capacity} personas</p>
                          <p className="terrace-price">💰 ${terrace.terraceData.price.toLocaleString()}/hora</p>
                        </div>
                      </div>
                    </td>
                    <td className="owner-cell">
                      <div className="owner-info">
                        <strong>{terrace.owner.name}</strong>
                        <p className="owner-email">{terrace.owner.email}</p>
                        {terrace.owner.phone && (
                          <p className="owner-phone">📱 {terrace.owner.phone}</p>
                        )}
                        <p className="contact-info">
                          <small>Contacto: {terrace.terraceData.contactPhone || 'No disponible'}</small>
                        </p>
                      </div>
                    </td>
                    <td className="date-cell">
                      <div className="date-info">
                        <strong>Solicitud:</strong>
                        <p>{formatDate(terrace.createdAt)}</p>
                        {terrace.reviewedAt && (
                          <>
                            <strong>Revisión:</strong>
                            <p>{formatDate(terrace.reviewedAt)}</p>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="documents-cell">
                      <div className="documents-info">
                        <button 
                          className="view-documents-btn"
                          onClick={() => {
                            console.log('📄 [DEBUG] Click en Ver Documentos para:', terrace.terraceData.name);
                            handleViewDocuments(terrace);
                          }}
                          title="Ver documentos REALES del propietario"
                        >
                          📄 Ver Documentos
                        </button>
                        <div className="documents-summary">
                          <div className="review-status">
                            <span className="review-badge pending-review">
                              👤 ID: {terrace.owner._id?.substring(0, 8) || 'N/A'}...
                            </span>
                          </div>
                          <p className="documents-hint">
                            <small>Click para ver documentos reales del propietario</small>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="status-cell">
                      {getStatusBadge(terrace.status)}
                      {terrace.adminNotes && (
                        <div className="admin-notes-preview" title={terrace.adminNotes}>
                          📝 Notas: {terrace.adminNotes.substring(0, 30)}...
                        </div>
                      )}
                    </td>
                    <td className="action-cell">
                      <div className="action-buttons">
                        {terrace.status === 'pending' && (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(terrace._id)}
                              disabled={processing}
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleRejectClick(terrace)}
                              disabled={processing}
                            >
                              ❌ Rechazar
                            </button>
                          </>
                        )}
                        {terrace.status === 'rejected' && (
                          <button
                            className="btn-review"
                            onClick={() => handleRejectClick(terrace)}
                            disabled={processing}
                          >
                            ✏️ Editar Rechazo
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de documentos */}
      {showDocumentsModal && selectedTerrace && (
        <div className="modal-overlay" onClick={() => setShowDocumentsModal(false)}>
          <div className="documents-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Documentos de {selectedTerrace.owner.name}</h2>
              <p className="modal-subtitle">Propietario de: {selectedTerrace.terraceData.name}</p>
              <p className="debug-info" style={{ fontSize: '12px', color: '#666' }}>
                UserID: {selectedTerrace.owner._id} | 
                Documentos: {userDocuments.length} | 
                Cargando: {loadingDocuments ? 'Sí' : 'No'}
              </p>
              <button 
                className="close-modal-btn"
                onClick={() => setShowDocumentsModal(false)}
                title="Cerrar"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="owner-info-card">
                <h3>👤 Información del Propietario</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Nombre:</strong>
                    <span>{selectedTerrace.owner.name}</span>
                  </div>
                  <div className="info-item">
                    <strong>Email:</strong>
                    <span>{selectedTerrace.owner.email}</span>
                  </div>
                  <div className="info-item">
                    <strong>Teléfono:</strong>
                    <span>{selectedTerrace.owner.phone || 'No disponible'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Terraza:</strong>
                    <span>{selectedTerrace.terraceData.name}</span>
                  </div>
                  <div className="info-item">
                    <strong>ID Usuario:</strong>
                    <span className="user-id">{selectedTerrace.owner._id}</span>
                  </div>
                </div>
              </div>
              
              <div className="documents-section">
                <div className="section-header-modal">
                  <h3>📄 Documentos Subidos ({getFilteredDocuments().length})</h3>
                  <div className="review-summary">
                    <div className="document-filters">
                      <button 
                        className={`doc-filter-btn ${docStatusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setDocStatusFilter('all')}
                      >
                        Todos <span className="documents-count">{userDocuments.length}</span>
                      </button>
                      <button 
                        className={`doc-filter-btn ${docStatusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setDocStatusFilter('pending')}
                      >
                        Pendientes <span className="documents-count">
                          {userDocuments.filter(d => d.status === 'pending').length}
                        </span>
                      </button>
                      <button 
                        className={`doc-filter-btn ${docStatusFilter === 'approved' ? 'active' : ''}`}
                        onClick={() => setDocStatusFilter('approved')}
                      >
                        Aprobados <span className="documents-count">
                          {userDocuments.filter(d => d.status === 'approved').length}
                        </span>
                      </button>
                      <button 
                        className={`doc-filter-btn ${docStatusFilter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setDocStatusFilter('rejected')}
                      >
                        Rechazados <span className="documents-count">
                          {userDocuments.filter(d => d.status === 'rejected').length}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {loadingDocuments ? (
                  <div className="loading-documents">
                    <div className="small-spinner"></div>
                    <p>Cargando documentos desde la base de datos...</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      (DEBUG: Esta operación está tardando más de lo esperado)
                    </p>
                  </div>
                ) : getFilteredDocuments().length === 0 ? (
                  <div className="no-documents">
                    <span className="no-docs-icon">📭</span>
                    <p>No hay documentos {docStatusFilter !== 'all' ? `con estado "${docStatusFilter}"` : 'disponibles'}.</p>
                    <p className="debug-info" style={{ fontSize: '12px', color: '#666' }}>
                      UserID: {selectedTerrace.owner._id} | 
                      Filtro: {docStatusFilter} | 
                      Total documentos: {userDocuments.length}
                    </p>
                  </div>
                ) : (
                  <div className="documents-grid">
                    {getFilteredDocuments().map(doc => (
                      <div key={doc._id} className="document-card">
                        <div className="document-header">
                          <span className="document-category">
                            {getCategoryName(doc.category)}
                          </span>
                          <div className="document-status-section">
                            <span className={`document-status ${doc.status}`}>
                              {getDocumentStatusBadge(doc.status)}
                            </span>
                            
                            {user && user.role === 'admin' && (
                              <button
                                className="btn-change-status"
                                onClick={() => handleOpenStatusModal(doc)}
                                title="Cambiar estado del documento"
                              >
                                ✏️ Cambiar Estado
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="document-body">
                          <h4 className="document-name">{doc.fileName}</h4>
                          <div className="document-meta">
                            <span className="meta-item">📅 {formatDate(doc.uploadDate)}</span>
                            <span className="meta-item">📏 {(doc.fileSize / 1024).toFixed(1)} KB</span>
                            <span className="meta-item">📄 {doc.mimeType}</span>
                            {doc.reviewDate && (
                              <span className="meta-item">👁️ Revisado: {formatDate(doc.reviewDate)}</span>
                            )}
                          </div>
                          
                          {doc.adminNotes && (
                            <div className="document-notes">
                              <strong>Notas del administrador:</strong>
                              <p>{doc.adminNotes}</p>
                            </div>
                          )}
                          
                          <div className="document-real-actions">
                            <a 
                              href={doc.downloadUrl || getDocumentUrl(doc._id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-view-real-doc"
                              onClick={(e) => {
                                if (doc.downloadUrl === '#') {
                                  e.preventDefault();
                                  alert('Este es un documento de prueba');
                                }
                              }}
                            >
                              👁️ Ver Documento
                            </a>
                            <a 
                              href={doc.downloadUrl || getDocumentUrl(doc._id)}
                              download={doc.fileName}
                              className="btn-download-real-doc"
                              onClick={(e) => {
                                if (doc.downloadUrl === '#') {
                                  e.preventDefault();
                                  alert('Este es un documento de prueba');
                                }
                              }}
                            >
                              ⬇️ Descargar
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="footer-actions">
                <button
                  className="btn-close-modal"
                  onClick={() => setShowDocumentsModal(false)}
                >
                  Cerrar
                </button>
                <button
                  className="btn-debug"
                  onClick={() => {
                    console.log('🔧 [DEBUG] Estado actual:', {
                      userDocuments,
                      selectedTerrace,
                      loadingDocuments
                    });
                  }}
                  style={{ marginLeft: '10px', fontSize: '12px', padding: '5px 10px' }}
                >
                  🔧 Debug
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar estado de documento */}
      {showStatusModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Cambiar Estado del Documento</h2>
              <p className="modal-subtitle">{selectedDocument.fileName}</p>
              <button 
                className="close-modal-btn"
                onClick={() => setShowStatusModal(false)}
                title="Cerrar"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="document-info">
                <p><strong>Categoría:</strong> {getCategoryName(selectedDocument.category)}</p>
                <p><strong>Estado actual:</strong> {getDocumentStatusBadge(selectedDocument.status)}</p>
                <p><strong>Subido:</strong> {formatDate(selectedDocument.uploadDate)}</p>
              </div>
              
              <div className="status-selection">
                <label htmlFor="newStatus">Nuevo estado:</label>
                <select
                  id="newStatus"
                  value={documentNewStatus}
                  onChange={(e) => setDocumentNewStatus(e.target.value as any)}
                  className="status-select"
                >
                  <option value="pending">⏳ Pendiente</option>
                  <option value="under_review">🔍 En Revisión</option>
                  <option value="approved">✅ Aprobado</option>
                  <option value="rejected">❌ Rechazado</option>
                </select>
              </div>
              
              <div className="notes-section">
                <label htmlFor="adminNotes">
                  Notas del administrador:
                  <span className="optional-label">(Opcional)</span>
                </label>
                <textarea
                  id="adminNotes"
                  value={documentAdminNotes}
                  onChange={(e) => setDocumentAdminNotes(e.target.value)}
                  placeholder="Ej: Documento aprobado, foto clara y legible."
                  rows={4}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowStatusModal(false)}
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-status"
                onClick={() => handleUpdateDocumentStatus(
                  selectedDocument._id, 
                  documentNewStatus, 
                  documentAdminNotes
                )}
                disabled={processing}
              >
                {processing ? 'Actualizando...' : 'Confirmar Cambio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rechazo de terraza */}
      {showRejectModal && selectedTerrace && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❌ Rechazar Solicitud: "{selectedTerrace.terraceData.name}"</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="request-info">
                <p><strong>Propietario:</strong> {selectedTerrace.owner.name}</p>
                <p><strong>Email:</strong> {selectedTerrace.owner.email}</p>
                <p><strong>Fecha de solicitud:</strong> {formatDate(selectedTerrace.createdAt)}</p>
                <p><strong>Ubicación:</strong> {selectedTerrace.terraceData.location}</p>
              </div>
              
              <div className="comment-section">
                <label htmlFor="rejectionReason">
                  Razón del rechazo:
                  <span className="optional-label">Este mensaje será enviado al propietario</span>
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder='Ej: La documentación no es clara. Por favor, suba fotos más legibles de sus permisos.'
                  rows={5}
                />
              </div>

              <div className="documents-preview">
                <h4>📄 Documentos del Propietario:</h4>
                <div className="documents-list">
                  {userDocuments.slice(0, 3).map(doc => (
                    <div key={doc._id} className="preview-doc-item">
                      <span className="doc-name">{getCategoryName(doc.category)}</span>
                      <span className={`doc-status ${doc.status}`}>
                        {doc.status === 'approved' ? '✅' :
                         doc.status === 'rejected' ? '❌' :
                         doc.status === 'under_review' ? '🔍' : '⏳'}
                      </span>
                    </div>
                  ))}
                  {userDocuments.length > 3 && (
                    <div className="more-docs-preview">
                      +{userDocuments.length - 3} más documentos
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-reject"
                onClick={handleConfirmRejection}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;