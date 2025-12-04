// HostPermissions.tsx
import React, { useState, useEffect } from 'react';
import '../css/admincss/Documents.css';

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
  fileType?: string;
  description?: string;
  userInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface User {
  name: string;
  email: string;
  id: string;
  role: string;
}

const HostPermissions: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Estados para filtros
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'under_review'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para vista detallada y edición
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected' | 'under_review'>('pending');
  const [updating, setUpdating] = useState(false);
  
  // Estado para información de usuarios
  const [usersInfo, setUsersInfo] = useState<Record<string, { name: string; email: string; phone?: string }>>({});

  // Cargar usuario y documentos
  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAllDocuments();
    } else if (user && user.role !== 'admin') {
      setError('No tienes permisos de administrador para acceder a esta página');
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:4000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser({
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role
          });
        }
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      window.location.href = '/login';
    }
  };

  const loadAllDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Primero, obtener todos los documentos (necesitarás una ruta específica para admin)
      const response = await fetch('http://localhost:4000/api/document-verification/admin/all-documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allDocuments = data.documents || [];
        
        // Obtener información de usuarios para cada documento
        const uniqueUserIds = [...new Set(allDocuments.map(doc => doc.userId))];
        await loadUsersInfo(uniqueUserIds);
        
        // Combinar información de usuarios con documentos
        const documentsWithUserInfo = allDocuments.map(doc => ({
          ...doc,
          userInfo: usersInfo[doc.userId] || { name: 'Usuario no encontrado', email: 'N/A' }
        }));
        
        setDocuments(documentsWithUserInfo);
      } else {
        // Si la ruta de admin no existe, intentar obtener documentos de cada usuario manualmente
        // Esto es menos eficiente pero funciona como respaldo
        console.log('Ruta de admin no disponible, cargando documentos manualmente...');
        await loadDocumentsManually();
      }
    } catch (error) {
      console.error('Error cargando documentos:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentsManually = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Primero obtener todos los usuarios (necesitarás una ruta para esto)
      const usersResponse = await fetch('http://localhost:4000/api/admin/all-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const allUsers = usersData.users || [];
        
        // Para cada usuario, obtener sus documentos
        const allDocuments: Document[] = [];
        for (const user of allUsers) {
          try {
            const docsResponse = await fetch(`http://localhost:4000/api/document-verification/admin/user-documents/${user._id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (docsResponse.ok) {
              const docsData = await docsResponse.json();
              const userDocs = docsData.documents || [];
              
              // Agregar información del usuario a cada documento
              const docsWithUserInfo = userDocs.map((doc: Document) => ({
                ...doc,
                userInfo: {
                  name: user.name,
                  email: user.email,
                  phone: user.phone
                }
              }));
              
              allDocuments.push(...docsWithUserInfo);
            }
          } catch (error) {
            console.error(`Error cargando documentos de usuario ${user._id}:`, error);
          }
        }
        
        setDocuments(allDocuments);
      }
    } catch (error) {
      console.error('Error en carga manual:', error);
      setError('No se pudieron cargar los documentos de los hosts');
    }
  };

  const loadUsersInfo = async (userIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      const usersMap: Record<string, { name: string; email: string; phone?: string }> = {};
      
      for (const userId of userIds) {
        try {
          const response = await fetch(`http://localhost:4000/api/admin/user-info/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            usersMap[userId] = {
              name: userData.name || 'Usuario no encontrado',
              email: userData.email || 'N/A',
              phone: userData.phone
            };
          }
        } catch (error) {
          console.error(`Error cargando info de usuario ${userId}:`, error);
          usersMap[userId] = { name: 'Error al cargar', email: 'N/A' };
        }
      }
      
      setUsersInfo(usersMap);
    } catch (error) {
      console.error('Error cargando información de usuarios:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedDocument) return;
    
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/document-verification/update-status/${selectedDocument._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Estado actualizado exitosamente');
        
        // Actualizar el documento en el estado local
        setDocuments(prevDocs =>
          prevDocs.map(doc =>
            doc._id === selectedDocument._id
              ? {
                  ...doc,
                  status: newStatus,
                  adminNotes: adminNotes,
                  reviewDate: new Date().toISOString()
                }
              : doc
          )
        );
        
        setShowStatusModal(false);
        setSelectedDocument(null);
        setAdminNotes('');
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado del documento');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenStatusModal = (document: Document) => {
    setSelectedDocument(document);
    setNewStatus(document.status);
    setAdminNotes(document.adminNotes || '');
    setShowStatusModal(true);
  };

  const getDocumentImageUrl = (document: Document) => {
    // Usar la ruta correcta para las imágenes en uploads/images
    if (document.filePath) {
      return `http://localhost:4000/uploads/images/${document.filePath}`;
    }
    return 'https://via.placeholder.com/300x400?text=Documento';
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

  const getStatusBadge = (status: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    // Filtrar por estado
    if (filterStatus !== 'all' && doc.status !== filterStatus) {
      return false;
    }
    
    // Filtrar por categoría
    if (filterCategory !== 'all' && doc.category !== filterCategory) {
      return false;
    }
    
    // Filtrar por búsqueda
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.fileName.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        getCategoryName(doc.category).toLowerCase().includes(searchLower) ||
        doc.userInfo?.name.toLowerCase().includes(searchLower) ||
        doc.userInfo?.email.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Estadísticas
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;
  const underReviewCount = documents.filter(d => d.status === 'under_review').length;
  const totalHosts = new Set(documents.map(d => d.userId)).size;

  // Categorías disponibles
  const availableCategories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'identificacion', label: 'Identificación Oficial' },
    { value: 'permisos_terrazas', label: 'Permisos de Terrazas' },
    { value: 'comprobante_domicilio', label: 'Comprobante de Domicilio' },
    { value: 'general', label: 'Documento General' }
  ];

  if (!user) {
    return (
      <div className="host-permissions-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="host-permissions-container">
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
      <div className="host-permissions-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando documentos de hosts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-permissions-container">
      {/* Header */}
      <div className="host-permissions-header">
        <div className="header-titles">
          <h1 className="main-title">👑 Permisos de Hosts</h1>
          <p className="subtitle">
            Gestiona y revisa todos los documentos de verificación de los hosts
          </p>
        </div>
        
        <button 
          className="btn-refresh"
          onClick={loadAllDocuments}
          disabled={loading}
        >
          🔄 Actualizar
        </button>
      </div>
      
      {/* Estadísticas */}
      <div className="host-permissions-stats">
        <div className="stat-card">
          <span className="stat-number">{documents.length}</span>
          <span className="stat-label">Total Documentos</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalHosts}</span>
          <span className="stat-label">Hosts Totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{pendingCount}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{approvedCount}</span>
          <span className="stat-label">Aprobados</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{rejectedCount}</span>
          <span className="stat-label">Rechazados</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{underReviewCount}</span>
          <span className="stat-label">En Revisión</span>
        </div>
      </div>
      
      {/* Controles de filtro */}
      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por documento, host, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-buttons">
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">⏳ Pendientes</option>
            <option value="under_review">🔍 En Revisión</option>
            <option value="approved">✅ Aprobados</option>
            <option value="rejected">❌ Rechazados</option>
          </select>
          
          <select 
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {availableCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Tabla de documentos */}
      <div className="documents-table-container">
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <p>{error}</p>
              <button className="retry-btn" onClick={loadAllDocuments}>
                Reintentar
              </button>
            </div>
          </div>
        )}
        
        {filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No hay documentos</h3>
            <p>{documents.length === 0 
              ? 'No hay documentos de hosts para mostrar.' 
              : 'No hay documentos que coincidan con los filtros.'}</p>
          </div>
        ) : (
          <div className="documents-table-wrapper">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Host</th>
                  <th>Categoría</th>
                  <th>Fecha Subida</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map(document => (
                  <tr key={document._id} className={`document-row status-${document.status}`}>
                    <td className="document-cell">
                      <div className="document-info-cell">
                        <div className="document-thumbnail">
                          <img 
                            src={getDocumentImageUrl(document)} 
                            alt={document.fileName}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Doc';
                            }}
                          />
                        </div>
                        <div className="document-details-cell">
                          <strong className="document-name">{document.fileName}</strong>
                          <div className="document-meta-cell">
                            <span className="meta-item">📏 {formatFileSize(document.fileSize)}</span>
                            <span className="meta-item">📄 {document.mimeType}</span>
                          </div>
                          {document.description && (
                            <p className="document-description-cell">
                              {document.description.length > 50 
                                ? `${document.description.substring(0, 50)}...` 
                                : document.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="host-cell">
                      <div className="host-info">
                        <strong>{document.userInfo?.name || 'Usuario no encontrado'}</strong>
                        <p className="host-email">{document.userInfo?.email || 'N/A'}</p>
                        {document.userInfo?.phone && (
                          <p className="host-phone">📱 {document.userInfo.phone}</p>
                        )}
                        <p className="host-id">
                          <small>ID: {document.userId?.substring(0, 8)}...</small>
                        </p>
                      </div>
                    </td>
                    <td className="category-cell">
                      <span className="category-badge">
                        {getCategoryName(document.category)}
                      </span>
                    </td>
                    <td className="date-cell">
                      <div className="date-info">
                        <strong>Subido:</strong>
                        <p>{formatDate(document.uploadDate)}</p>
                        {document.reviewDate && (
                          <>
                            <strong>Revisado:</strong>
                            <p>{formatDate(document.reviewDate)}</p>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="status-cell">
                      {getStatusBadge(document.status)}
                      {document.adminNotes && (
                        <div className="admin-notes-preview" title={document.adminNotes}>
                          📝 {document.adminNotes.length > 30 
                            ? `${document.adminNotes.substring(0, 30)}...` 
                            : document.adminNotes}
                        </div>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="document-actions">
                        <button 
                          className="btn-view-doc"
                          onClick={() => {
                            setSelectedDocument(document);
                            setShowDetailModal(true);
                          }}
                        >
                          👁️ Ver
                        </button>
                        <button 
                          className="btn-change-status"
                          onClick={() => handleOpenStatusModal(document)}
                        >
                          ✏️ Cambiar Estado
                        </button>
                        <a 
                          href={getDocumentImageUrl(document)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-download-doc"
                          download={document.fileName}
                        >
                          ⬇️ Descargar
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal para ver detalles del documento */}
      {showDetailModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Detalles del Documento</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="document-detail-view">
                <div className="document-image-large">
                  <img 
                    src={getDocumentImageUrl(selectedDocument)} 
                    alt={selectedDocument.fileName}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/500x600?text=Documento';
                    }}
                  />
                </div>
                
                <div className="document-details">
                  <div className="detail-section">
                    <h3>{selectedDocument.fileName}</h3>
                    <div className="status-info">
                      {getStatusBadge(selectedDocument.status)}
                    </div>
                  </div>
                  
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Host:</strong>
                      <span>{selectedDocument.userInfo?.name || 'Usuario no encontrado'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{selectedDocument.userInfo?.email || 'N/A'}</span>
                    </div>
                    {selectedDocument.userInfo?.phone && (
                      <div className="detail-item">
                        <strong>Teléfono:</strong>
                        <span>{selectedDocument.userInfo.phone}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <strong>ID Usuario:</strong>
                      <span className="user-id">{selectedDocument.userId}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Categoría:</strong>
                      <span>{getCategoryName(selectedDocument.category)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Tipo de archivo:</strong>
                      <span>{selectedDocument.mimeType}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Tamaño:</strong>
                      <span>{formatFileSize(selectedDocument.fileSize)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Subido el:</strong>
                      <span>{formatDate(selectedDocument.uploadDate)}</span>
                    </div>
                    {selectedDocument.reviewDate && (
                      <div className="detail-item">
                        <strong>Revisado el:</strong>
                        <span>{formatDate(selectedDocument.reviewDate)}</span>
                      </div>
                    )}
                    {selectedDocument.description && (
                      <div className="detail-item full-width">
                        <strong>Descripción:</strong>
                        <span>{selectedDocument.description}</span>
                      </div>
                    )}
                    {selectedDocument.adminNotes && (
                      <div className="detail-item full-width">
                        <strong>Notas del administrador:</strong>
                        <span className="admin-notes-text">{selectedDocument.adminNotes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="detail-actions">
                    <button 
                      className="btn-change-status-large"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenStatusModal(selectedDocument);
                      }}
                    >
                      ✏️ Cambiar Estado
                    </button>
                    <a 
                      href={getDocumentImageUrl(selectedDocument)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download-large"
                      download={selectedDocument.fileName}
                    >
                      ⬇️ Descargar Documento
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para cambiar estado */}
      {showStatusModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Cambiar Estado del Documento</h2>
              <p className="modal-subtitle">{selectedDocument.fileName}</p>
              <button 
                className="close-modal-btn"
                onClick={() => setShowStatusModal(false)}
                disabled={updating}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="document-info">
                <p><strong>Host:</strong> {selectedDocument.userInfo?.name || 'Usuario no encontrado'}</p>
                <p><strong>Categoría:</strong> {getCategoryName(selectedDocument.category)}</p>
                <p><strong>Estado actual:</strong> {getStatusBadge(selectedDocument.status)}</p>
              </div>
              
              <div className="status-selection">
                <label htmlFor="newStatus">Nuevo estado:</label>
                <select
                  id="newStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="status-select"
                  disabled={updating}
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
                  <span className="optional-label">(Opcional, serán visibles para el host)</span>
                </label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ej: Documento aprobado, foto clara y legible. / Documento rechazado, por favor suba una versión más reciente."
                  rows={4}
                  disabled={updating}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowStatusModal(false)}
                disabled={updating}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-status"
                onClick={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? 'Actualizando...' : 'Confirmar Cambio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostPermissions;