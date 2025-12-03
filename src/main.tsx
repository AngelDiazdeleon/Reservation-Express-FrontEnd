// main.tsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Páginas
// -------------LOGIN PARA TODOS LOS USUARIOS-----------
import Login from './page/common/Login';

// ---------PAGINAS DE CLIENTE--------------
import ClientHome from './page/client/home';
import ClientProfile from './page/client/Profile';
// ---------PAGINAS DE HOST--------------
import HostDashboard from './page/host/Dashboard';
import HostProfile from './page/host/profile';
import DocumentVerification from './page/host/DocumentVerification';
import MisTerrazas from './page/host/MyTerraces';
import PublicarTerraza from './page/host/addTerrace';
import MembershipPlans from './page/host/MembershipPlans';
// ---------PAGINAS DE ADMIN--------------
import AdminDashboard from './page/admin/Dashboard';
import AdminProfile from './page/admin/Profile';
import AdminPermission from './page/admin/PermissionManagement';
import AdminRegister from './page/admin/RegisterAdmin';

// Rutas protegidas
import ProtectedRoute from './routers/ProtectedRoute';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />
{/* -------------------------------------CLIENTES QUE RENTAN TERRAZAS-------------------------------------------------------------------------------------- */}
        {/* Cliente */}
        <Route
          path="/client/home"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientHome/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/Profile"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientProfile/>
            </ProtectedRoute>
          }
        />

{/* -------------------------------------HOST DUEÑOS DE LAS TERRAZAS-------------------------------------------------------------------------------------- */}
        {/* Host */}
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/profile"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostProfile/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/DocumentVerification"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <DocumentVerification/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/MyTerraces"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <MisTerrazas/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/addTerraces"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <PublicarTerraza/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/MembershipPlans"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <MembershipPlans/>
            </ProtectedRoute>
          }
        />
       
{/* -------------------------------------ADMINISTRADORES DE LA PWA-------------------------------------------------------------------------------------- */}
        {/* Admin */}
         <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        /> 
         <Route
          path="/admin/RegisterAdmin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRegister />
            </ProtectedRoute>
          }
        /> 
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProfile/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/PermissionMagement"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPermission/>
            </ProtectedRoute>
          }
        />
        

        {/* Si intenta entrar a una ruta que no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
