// ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user"); // guardas esto al hacer login

  // Si no hay token o no hay datos del usuario, lo manda al login
  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }

  // Verificamos el rol del usuario
  const user = JSON.parse(userData);
  const userRole = user.role; // ← esto viene del backend (por ejemplo: "client", "host", "admin")

  // Si la ruta tiene restricciones de rol y el usuario no está autorizado, redirige
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Si pasa todas las validaciones, muestra el contenido
  return <>{children}</>;
}
