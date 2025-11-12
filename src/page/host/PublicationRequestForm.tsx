import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import '../css/PublicationRequestForm.css';

interface FormData {
  name: string;
  description: string;
  capacity: string;
  location: string;
  price: string;
  contactPhone: string;
  contactEmail: string;
  amenities: string[];
  userNotes: string;
}

const PublicationRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    capacity: '',
    location: '',
    price: '',
    contactPhone: '',
    contactEmail: '',
    amenities: [],
    userNotes: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, amenities: options }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.capacity || !formData.location || !formData.price) {
      setMessage('❌ Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          submitData.append(key, JSON.stringify(formData[key as keyof FormData]));
        } else if (formData[key as keyof FormData]) {
          submitData.append(key, formData[key as keyof FormData] as string);
        }
      });

      photos.forEach(photo => submitData.append('photos', photo));
      documents.forEach(doc => submitData.append('documents', doc));

      const response = await axios.post('/publication-requests', submitData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMessage('✅ Solicitud enviada correctamente. Espera la aprobación del administrador.');
      
      setFormData({
        name: '', description: '', capacity: '', location: '', price: '',
        contactPhone: '', contactEmail: '', amenities: [], userNotes: ''
      });
      setPhotos([]);
      setDocuments([]);

      setTimeout(() => {
        navigate('/my-terraces');
      }, 2000);

    } catch (error: any) {
      console.error('Error:', error);
      setMessage('❌ Error al enviar la solicitud: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publication-form-container">
      <div className="form-header">
        <h1>Solicitud de Publicación de Terraza</h1>
        <p>Completa la información de tu terraza para solicitar su publicación</p>
      </div>
      
      {message && (
        <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="publication-form">
        <div className="form-section">
          <h2>Información Básica</h2>
          
          <div className="form-group">
            <label className="form-label">Nombre de la Terraza *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Ej: Terraza del Sol"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="form-textarea"
              placeholder="Describe tu terraza, servicios incluidos, ambiente, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Capacidad (personas) *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="1"
                className="form-input"
                placeholder="50"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Precio por hora ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="form-input"
                placeholder="5000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ubicación (Dirección completa) *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Calle, número, ciudad, código postal"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Información de Contacto</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono de Contacto *</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email de Contacto *</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="contacto@terraza.com"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Comodidades y Servicios</h2>
          
          <div className="form-group">
            <label className="form-label">Comodidades Disponibles</label>
            <select
              multiple
              name="amenities"
              value={formData.amenities}
              onChange={handleAmenitiesChange}
              className="form-select-multiple"
            >
              <option value="wifi">WiFi Gratuito</option>
              <option value="parking">Estacionamiento</option>
              <option value="air-conditioning">Aire Acondicionado</option>
              <option value="sound-system">Sistema de Sonido</option>
              <option value="projector">Proyector/Pantalla</option>
              <option value="catering">Servicio de Catering</option>
              <option value="bar">Bar/Licorería</option>
              <option value="garden">Jardín/Área Verde</option>
              <option value="pool">Piscina</option>
              <option value="kitchen">Cocina Equipada</option>
              <option value="tables">Mesas y Sillas</option>
              <option value="lighting">Iluminación Especial</option>
              <option value="security">Seguridad/Valet Parking</option>
              <option value="restrooms">Baños Múltiples</option>
              <option value="accessibility">Acceso para Discapacitados</option>
            </select>
            <small className="form-help">Mantén CTRL (Cmd en Mac) para seleccionar múltiples opciones</small>
          </div>
        </div>

        <div className="form-section">
          <h2>Archivos Requeridos</h2>
          
          <div className="form-group">
            <label className="form-label">Fotos de la Terraza (Máx. 5) *</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, setPhotos)}
              className="form-file-input"
              required
            />
            <small className="form-help">Imágenes que muestren diferentes áreas de la terraza</small>
            {photos.length > 0 && (
              <div className="file-selected">
                <strong>Archivos seleccionados:</strong> {photos.length}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Documentos Requeridos (Máx. 5) *</label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, setDocuments)}
              className="form-file-input"
              required
            />
            <small className="form-help">Contrato, identificación, certificados de negocio</small>
            {documents.length > 0 && (
              <div className="file-selected">
                <strong>Archivos seleccionados:</strong> {documents.length}
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Información Adicional</h2>
          
          <div className="form-group">
            <label className="form-label">Notas para el Administrador</label>
            <textarea
              name="userNotes"
              value={formData.userNotes}
              onChange={handleInputChange}
              rows={3}
              className="form-textarea"
              placeholder="Información adicional que quieras proporcionar, horarios preferidos, restricciones, etc."
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? '📨 Enviando Solicitud...' : '📨 Enviar Solicitud'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/my-terraces')}
            className="cancel-btn"
          >
            ↩️ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicationRequestForm;