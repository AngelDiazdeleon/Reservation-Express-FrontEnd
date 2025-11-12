import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './page/common/Login';
import PublicationRequestForm from './page/host/PublicationRequestForm';
import AdminDashboard from './page/admin/Dashboard';
import ComissionPanel from './page/admin/ComissionPanel';
import PermissionPanel from './page/admin/PermissionPanel';
import BookingsPanel from './page/admin/BookingsPanel';
import TerrazaPanel from './page/admin/TerrazaPanel';
import PropietariosPanel from './page/admin/PropietariosPanel'; // ✅ Import real
import ReportesPanel from './page/admin/ReportesPanel'; // ✅ Nuevo import
import MyTerraces from './page/host/MyTerraces';
import TerraceCalendar from './components/TerraceCalendar';
import Home from './page/client/home';
import Profile from './page/client/Profile';
import TerraceDetails from './page/client/terraceDetails';
import MyReservation from './page/client/MyReservation';
import ProtectedRoute from './routers/ProtectedRoute';
import './App.css';

// Componentes placeholder para host
const HostDashboard = () => (
  <div className="host-dashboard-placeholder">
    <h1>Dashboard del Host</h1>
    <p>Gestiona tus terrazas y reservas</p>
    <div className="host-actions">
      <a href="/publish-terrace" className="host-action-btn">
        Publicar Nueva Terraza
      </a>
      <a href="/my-terraces" className="host-action-btn">
        Ver Mis Terrazas
      </a>
    </div>
  </div>
);

const HostReservations = () => (
  <div className="admin-panel">
    <div className="panel-header">
      <div className="panel-title">
        <h1>Mis Reservas</h1>
        <p>Gestiona las reservas de tus terrazas</p>
      </div>
    </div>
    <div className="empty-state">
      <span className="material-symbols-outlined">event_available</span>
      <p>Panel de reservas del host - En desarrollo</p>
    </div>
  </div>
);

const PendingRequests = () => (
  <div className="admin-panel">
    <div className="panel-header">
      <div className="panel-title">
        <h1>Solicitudes Pendientes</h1>
        <p>Revisa el estado de tus solicitudes de publicación</p>
      </div>
    </div>
    <div className="empty-state">
      <span className="material-symbols-outlined">pending_actions</span>
      <p>Panel de solicitudes pendientes - En desarrollo</p>
    </div>
  </div>
);

const UploadDocuments = () => (
  <div className="admin-panel">
    <div className="panel-header">
      <div className="panel-title">
        <h1>Subir Documentos</h1>
        <p>Gestiona los documentos de tus terrazas</p>
      </div>
    </div>
    <div className="empty-state">
      <span className="material-symbols-outlined">folder_open</span>
      <p>Panel de documentos - En desarrollo</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terrace/:id" element={<TerraceDetails />} />
            <Route path="/calendar" element={<TerraceCalendar />} />
            
            {/* Rutas protegidas - Cliente */}
            <Route 
              path="/client/home" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client/profile" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client/reservations" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <MyReservation />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas protegidas - Host */}
            <Route 
              path="/host/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <HostDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/publish-terrace" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <PublicationRequestForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-terraces" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <MyTerraces />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/reservations" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <HostReservations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/pending" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <PendingRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/documents" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <UploadDocuments />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas protegidas - Admin */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reservas" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BookingsPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/comisiones" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ComissionPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/solicitudes" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PermissionPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/terrazas" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TerrazaPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/propietarios" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PropietariosPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reportes" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportesPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;