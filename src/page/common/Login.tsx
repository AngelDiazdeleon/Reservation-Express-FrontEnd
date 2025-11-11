import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

// Si quieres usar una imagen local, descomenta esta línea y coloca tu imagen en src/assets/
// import terrazaImage from '../assets/terraza-image.jpg';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "login" : "register";
      const body = isLogin 
        ? { email, password }
        : { email, password, role: userType };

      const res = await fetch(`http://localhost:4000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || `Error al ${isLogin ? 'iniciar sesión' : 'registrarse'}`);
        setLoading(false);
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        switch (data.user.role) {
          case "client":
            navigate("/client/home");
            break;
          case "host":
            navigate("/host/dashboard");
            break;
          case "admin":
            navigate("/admin/dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        alert("Registro exitoso! Ahora puedes iniciar sesión.");
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error del servidor o conexión fallida");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Iniciando sesión con ${provider}`);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Imagen lateral */}
        <div className="login-image">
          <div className="image-content">
            <img 
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
              alt="TerrazaPerfecta - El lugar perfecto para tu evento"
              className="side-image"
            />
            <div className="image-overlay">
              <h2>TerrazaPerfecta</h2>
              <p>Descubre el lugar ideal para tus eventos especiales</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">TerrazaPerfecta</h1>
            <p className="login-subtitle">El lugar perfecto para tu próximo evento</p>
            
            <div className="login-tabs">
              <button 
                className={`tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Iniciar Sesión
              </button>
              <button 
                className={`tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Registrarse
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="form-input"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                 <span>
                      {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña (solo en registro) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirmar Contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    <span>
                      {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Tipo de usuario (solo en registro) */}
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Quiero registrarme como:</label>
                <div className="user-type-grid">
                  {[
                    { value: "client", label: "Cliente", icon: "Usuario" },
                    { value: "host", label: "Terrazas", icon: "Propietario" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setUserType(type.value)}
                      className={`user-type-btn ${
                        userType === type.value ? "active" : ""
                      }`}
                    >
                      <span className="material-symbols-outlined user-type-icon">
                        {type.icon}
                      </span>
                      <span className="user-type-label">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? "Cargando..." : (isLogin ? "Iniciar Sesión" : "Crear Cuenta")}
            </button>

            {/* Enlaces adicionales */}
            <div className="form-links">
              {isLogin ? (
                <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
              ) : (
                <p className="terms-text">
                  Al registrarte, aceptas nuestros <a href="#">Términos y Condiciones</a>
                </p>
              )}
            </div>

            {/* Separador */}
            <div className="separator">
              <span>o {isLogin ? 'inicia sesión' : 'regístrate'} con</span>
            </div>

            {/* Botones sociales */}
            <div className="social-buttons">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="social-btn google-btn"
              >
                <span className="social-icon">G</span>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                className="social-btn facebook-btn"
              >
                <span className="social-icon">f</span>
                Facebook
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;