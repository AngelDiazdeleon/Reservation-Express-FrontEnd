// src/page/admin/components/AdminRegister.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff, MdClose } from 'react-icons/md';
import "../css/admincss/AdminRegister.css";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (!formData.email.trim()) {
      setError("El email es requerido");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email inválido");
      return false;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  // Función para iniciar sesión automáticamente
  const autoLogin = async (email: string, password: string) => {
    try {
      const loginRes = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        console.warn("Registro exitoso pero no se pudo hacer login automático");
        return false;
      }

      // Guardar datos en localStorage
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      localStorage.setItem("role", loginData.user.role);

      console.log("✅ Login automático exitoso");
      return true;
    } catch (error) {
      console.error("Error en login automático:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No estás autenticado. Vuelve a iniciar sesión.");
        navigate("/login");
        return;
      }

      const body = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "admin", // Siempre admin
        phone: formData.phone || undefined
      };

      console.log("Registrando nuevo administrador:", body);

      // 1. Registrar al admin
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al registrar administrador");
        setLoading(false);
        return;
      }

      // 2. Éxito en el registro
      setSuccess("✅ Administrador registrado exitosamente!");
      
      // 3. Intentar login automático (opcional pero recomendado)
      setTimeout(async () => {
        const loginSuccess = await autoLogin(formData.email, formData.password);
        
        if (loginSuccess) {
          // Redirigir al perfil del nuevo admin
          navigate("/admin/profile");
        } else {
          // Si falla el login automático, mostrar mensaje
          setSuccess("✅ Administrador registrado. Ahora puede iniciar sesión manualmente.");
          
          // Limpiar formulario
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: ""
          });
        }
      }, 1500);

    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  // OPCIÓN ALTERNATIVA: Redirigir directo al perfil sin esperar
  const handleSubmitAndGoToProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No estás autenticado. Vuelve a iniciar sesión.");
        navigate("/login");
        return;
      }

      const body = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "admin",
        phone: formData.phone || undefined
      };

      // 1. Registrar
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al registrar administrador");
        setLoading(false);
        return;
      }

      // 2. Login automático inmediato
      const loginRes = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        // Guardar sesión
        localStorage.setItem("token", loginData.token);
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.setItem("role", loginData.user.role);
        
        // Redirigir al perfil
        navigate("/admin/profile");
      } else {
        // Si falla el login, al menos limpiar y mostrar éxito
        setSuccess("✅ Administrador registrado exitosamente!");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: ""
        });
      }

    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  // Nueva función para cerrar/volver
  const handleExit = () => {
    if (window.confirm("¿Estás seguro de que quieres salir? Los datos no guardados se perderán.")) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-register-card">
        {/* HEADER CON BOTÓN DE SALIR */}
        <div className="admin-register-header-with-close">
          <div className="admin-icon-header">
            <span className="admin-crown">👑</span>
            <div className="header-title-container">
              <h1>Registrar Nuevo Administrador</h1>
              <p className="admin-subtitle">
                Creará una nueva cuenta de administrador e iniciará sesión automáticamente
              </p>
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={handleExit}
            className="close-button"
            title="Salir"
            disabled={loading}
          >
            <MdClose size={24} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmitAndGoToProfile} className="admin-register-form">
          <div className="form-section">
            <h3 className="section-title">Información Personal</h3>
            
            <div className="form-group">
              <label className="form-label">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@ejemplo.com"
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Teléfono (Opcional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+52 55 1234 5678"
                className="form-input"
                disabled={loading}
              />
              <small className="form-help">Para contacto de emergencia</small>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Credenciales de Acceso</h3>
            
            <div className="form-group">
              <label className="form-label">
                Contraseña *
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className="form-input password-input"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={loading}
                >
                  {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                </button>
              </div>
              <small className="form-help">
                Se usará para iniciar sesión automáticamente
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirmar Contraseña *
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                  className="form-input password-input"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  disabled={loading}
                >
                  {showConfirmPassword ? <MdVisibility /> : <MdVisibilityOff />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-section auto-login-notice">
            <h3 className="section-title">⚠️ Acceso Automático</h3>
            <p className="auto-login-text">
              Después del registro, el sistema iniciará sesión automáticamente 
              con esta cuenta y será redirigido al perfil del administrador.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="submit-btn admin-submit-btn"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Registrando y accediendo...
                </>
              ) : (
                <>
                  <span className="submit-icon">🚀</span>
                  Registrar y Acceder
                </>
              )}
            </button>
          </div>

          <div className="security-notice">
            <p className="notice-title">📋 Lo que sucederá:</p>
            <ul className="notice-list">
              <li>✅ Se creará la cuenta de administrador</li>
              <li>✅ Se iniciará sesión automáticamente</li>
              <li>✅ Serás redirigido al perfil del administrador</li>
              <li>✅ La sesión actual permanecerá activa</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;