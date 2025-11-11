// Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css"


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // Guardar token y rol
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      // Redirigir según el rol
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
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error del servidor o conexión fallida");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Iniciando sesión con ${provider}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-white size-8">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">TerrazaApp</h1>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Iniciar Sesión</h2>
          <p className="text-white/80 text-sm">
            El lugar perfecto para tu próximo evento
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Tipo de usuario */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Quiero iniciar sesión como:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "client", label: "Cliente", icon: "person" },
                { value: "host", label: "Anfitrión", icon: "storefront" },
                { value: "admin", label: "Administrador", icon: "admin_panel_settings" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUserType(type.value)}
                  className={`flex flex-col items-center p-3 border rounded-xl ${
                    userType === type.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-300 hover:border-primary/50"
                  }`}
                >
                  <span className="material-symbols-outlined mb-1">
                    {type.icon}
                  </span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
