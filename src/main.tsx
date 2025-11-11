// main.tsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Páginas
import Login from './page/common/Login';
import ClientHome from './page/client/home';
import HostDashboard from './page/host/Dashboard';
import AdminDashboard from './page/admin/Dashboard';

// Rutas protegidas
import ProtectedRoute from './routers/ProtectedRoute';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Cliente */}
        <Route
          path="/client/home"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientHome />
            </ProtectedRoute>
          }
        />

        {/* Host */}
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Si intenta entrar a una ruta que no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
