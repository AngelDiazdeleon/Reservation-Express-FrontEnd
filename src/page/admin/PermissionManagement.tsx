import React, { useState, useEffect } from 'react';
import '../css/admincss/PermissionManagement.css';

interface PermissionRequest {
  id: string;
  terraceName: string;
  owner: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  documents?: {
    type: string;
    url: string;
    status: 'approved' | 'rejected' | 'pending';
  }[];
}

interface User {
  name: string;
  email: string;
  id: string;
  role: string;
}

const PermissionManagement: React.FC = () => {
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([
    {
      id: '1',
      terraceName: 'El Jardín Secreto',
      owner: 'Ana Torres',
      submissionDate: '15/07/2024',
      status: 'in_review',
      documents: [
        { type: 'Licencia de funcionamiento', url: '#', status: 'pending' },
        { type: 'Permiso de uso de suelo', url: '#', status: 'approved' },
        { type: 'Identificación oficial', url: '#', status: 'approved' }
      ]
    },
    {
      id: '2',
      terraceName: 'Mirador del Sol',
      owner: 'Carlos Cómez',
      submissionDate: '14/07/2024',
      status: 'in_review',
      documents: [
        { type: 'Licencia de funcionamiento', url: '#', status: 'pending' },
        { type: 'Permiso de uso de suelo', url: '#', status: 'pending' },
        { type: 'Identificación oficial', url: '#', status: 'rejected' }
      ]
    },
    {
      id: '3',
      terraceName: 'Rooftop 5 Estrellas',
      owner: 'Lucía Fernández',
      submissionDate: '12/07/2024',
      status: 'in_review',
      documents: [
        { type: 'Licencia de funcionamiento', url: '#', status: 'approved' },
        { type: 'Permiso de uso de suelo', url: '#', status: 'approved' },
        { type: 'Identificación oficial', url: '#', status: 'approved' }
      ]
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Simular carga de usuario
  useEffect(() => {
    setUser({
      id: 'admin1',
      name: 'Administrador',
      email: 'admin@terracerent.com',
      role: 'admin'
    });
  }, []);

  const handleApprove = async (requestId: string) => {
    setLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPermissionRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );
      
      alert('Solicitud aprobada exitosamente');
    } catch (error) {
      alert('Error al aprobar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (request: PermissionRequest) => {
    setSelectedRequest(request);
    setRejectionComment('');
    setShowRejectModal(true);
  };

  const handleConfirmRejection = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPermissionRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id 
            ? { ...req, status: 'rejected', rejectionComment } 
            : req
        )
      );
      
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionComment('');
      alert('Solicitud rechazada exitosamente');
    } catch (error) {
      alert('Error al rechazar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: PermissionRequest['status']) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge status-approved">Aprobado</span>;
      case 'rejected':
        return <span className="status-badge status-rejected">Rechazado</span>;
      case 'in_review':
        return <span className="status-badge status-in-review">En Proceso</span>;
      default:
        return <span className="status-badge status-pending">Pendiente</span>;
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '⏳';
    }
  };

  const inProcessRequests = permissionRequests.filter(req => req.status === 'in_review');
  const approvedRequests = permissionRequests.filter(req => req.status === 'approved');
  const rejectedRequests = permissionRequests.filter(req => req.status === 'rejected');

  return (
    <div className="permission-management-container">
      <div className="header-section">
        <h1 className="main-title">Gestión de Permisos</h1>
        <p className="subtitle">
          Revisa, aprueba o rechaza las solicitudes de permisos de las nuevas terrazas.
        </p>
      </div>

      <div className="requests-grid">
        {/* Columna izquierda: Solicitudes en proceso */}
        <div className="requests-column">
          <div className="requests-section">
            <h2 className="section-title">Solicitudes en Proceso ({inProcessRequests.length})</h2>
            
            <div className="requests-table-container">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>NOMBRE DE LA TERRAZA</th>
                    <th>PROPIETARIO</th>
                    <th>FECHA DE ENVÍO</th>
                    <th>ESTADO</th>
                    <th>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {inProcessRequests.map(request => (
                    <tr key={request.id}>
                      <td className="terrace-name-cell">
                        <strong>{request.terraceName}</strong>
                        {request.documents && (
                          <div className="document-status-list">
                            {request.documents.map((doc, index) => (
                              <div key={index} className="document-status-item">
                                <span className="doc-status-icon">
                                  {getDocumentStatusIcon(doc.status)}
                                </span>
                                <span className="doc-type">{doc.type}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{request.owner}</td>
                      <td>{request.submissionDate}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td className="action-cell">
                        <div className="action-buttons">
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(request.id)}
                            disabled={loading}
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleRejectClick(request)}
                            disabled={loading}
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Solicitudes Aprobadas */}
          {approvedRequests.length > 0 && (
            <div className="requests-section approved-section">
              <h2 className="section-title">Solicitudes Aprobadas ({approvedRequests.length})</h2>
              <div className="approved-list">
                {approvedRequests.map(request => (
                  <div key={request.id} className="approved-item">
                    <div className="approved-info">
                      <h4>{request.terraceName}</h4>
                      <p>{request.owner} • {request.submissionDate}</p>
                    </div>
                    <span className="approved-badge">✅ Aprobado</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solicitudes Rechazadas */}
          {rejectedRequests.length > 0 && (
            <div className="requests-section rejected-section">
              <h2 className="section-title">Solicitudes Rechazadas ({rejectedRequests.length})</h2>
              <div className="rejected-list">
                {rejectedRequests.map(request => (
                  <div key={request.id} className="rejected-item">
                    <div className="rejected-info">
                      <h4>{request.terraceName}</h4>
                      <p>{request.owner} • {request.submissionDate}</p>
                    </div>
                    <span className="rejected-badge">❌ Rechazado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Estadísticas */}
        <div className="stats-column">
          <div className="stats-card">
            <h3>Resumen de Solicitudes</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{permissionRequests.length}</span>
                <span className="stat-label">Total Solicitudes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{inProcessRequests.length}</span>
                <span className="stat-label">En Proceso</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{approvedRequests.length}</span>
                <span className="stat-label">Aprobadas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{rejectedRequests.length}</span>
                <span className="stat-label">Rechazadas</span>
              </div>
            </div>
          </div>

          <div className="instructions-card">
            <h3>📋 Instrucciones</h3>
            <ul className="instructions-list">
              <li>Revisa cuidadosamente cada documento</li>
              <li>Verifica que la información sea legible</li>
              <li>Confirma que todos los documentos requeridos estén presentes</li>
              <li>Si hay documentos faltantes, rechaza la solicitud con un comentario explicativo</li>
              <li>Las solicitudes aprobadas pueden ser editadas posteriormente</li>
            </ul>
          </div>

          <div className="timeline-card">
            <h3>📅 Actividad Reciente</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-date">Hoy</div>
                <div className="timeline-content">
                  <strong>Nueva solicitud recibida</strong>
                  <p>"Terraza Vista al Mar" enviada por María González</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">Ayer</div>
                <div className="timeline-content">
                  <strong>Solicitud aprobada</strong>
                  <p>"El Balcón Verde" aprobada correctamente</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-date">15/07/2024</div>
                <div className="timeline-content">
                  <strong>Solicitud rechazada</strong>
                  <p>"La Azotea" rechazada por documentación incompleta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="reject-modal">
            <div className="modal-header">
              <h2>Rechazar Solicitud: "{selectedRequest.terraceName}"</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="request-info">
                <p><strong>Propietario:</strong> {selectedRequest.owner}</p>
                <p><strong>Fecha de envío:</strong> {selectedRequest.submissionDate}</p>
              </div>
              
              <div className="comment-section">
                <label htmlFor="rejectionComment">
                  Añade un comentario para que el propietario sepa qué debe corregir.
                  <span className="optional-label">Este campo es opcional, pero recomendado.</span>
                </label>
                <textarea
                  id="rejectionComment"
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  placeholder='Ej: La identificación oficial del propietario no es legible. Por favor, suba una foto más clara.'
                  rows={4}
                />
                <p className="example-text">
                  Ej: La identificación oficial del propietario no es legible. Por favor, suba una foto más clara.
                </p>
              </div>

              <div className="document-status-section">
                <h4>Estado de Documentos:</h4>
                {selectedRequest.documents?.map((doc, index) => (
                  <div key={index} className="document-status-row">
                    <span className="doc-name">{doc.type}</span>
                    <span className={`doc-status ${doc.status}`}>
                      {doc.status === 'approved' ? '✅ Aprobado' :
                       doc.status === 'rejected' ? '❌ Rechazado' : '⏳ Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-reject"
                onClick={handleConfirmRejection}
                disabled={loading || !rejectionComment.trim()}
              >
                {loading ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;