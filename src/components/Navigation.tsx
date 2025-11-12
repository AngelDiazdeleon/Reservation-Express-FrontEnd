import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'host' | 'admin';
  avatar?: string;
}

const Navigation: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Simular obtención del usuario desde el contexto o localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const getRoleBasedLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return (
          <>
            <Link 
              to="/admin/dashboard" 
              className={`nav-link ${isActiveRoute('/admin/dashboard') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
            <Link 
              to="/admin/reservas" 
              className={`nav-link ${isActiveRoute('/admin/reservas') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">calendar_month</span>
              Reservas
            </Link>
            <Link 
              to="/admin/comisiones" 
              className={`nav-link ${isActiveRoute('/admin/comisiones') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">paid</span>
              Comisiones
            </Link>
            <Link 
              to="/admin/solicitudes" 
              className={`nav-link ${isActiveRoute('/admin/solicitudes') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">approval</span>
              Solicitudes
            </Link>
          </>
        );

      case 'host':
        return (
          <>
            <Link 
              to="/host/dashboard" 
              className={`nav-link ${isActiveRoute('/host/dashboard') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
            <Link 
              to="/my-terraces" 
              className={`nav-link ${isActiveRoute('/my-terraces') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">deck</span>
              Mis Terrazas
            </Link>
            <Link 
              to="/publish-terrace" 
              className={`nav-link ${isActiveRoute('/publish-terrace') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">add</span>
              Publicar Terraza
            </Link>
            <Link 
              to="/host/reservations" 
              className={`nav-link ${isActiveRoute('/host/reservations') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">event_available</span>
              Reservas
            </Link>
          </>
        );

      case 'client':
        return (
          <>
            <Link 
              to="/client/home" 
              className={`nav-link ${isActiveRoute('/client/home') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">home</span>
              Inicio
            </Link>
            <Link 
              to="/client/reservations" 
              className={`nav-link ${isActiveRoute('/client/reservations') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">bookmark</span>
              Mis Reservas
            </Link>
            <Link 
              to="/client/profile" 
              className={`nav-link ${isActiveRoute('/client/profile') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">person</span>
              Perfil
            </Link>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            <span className="material-symbols-outlined">terrace</span>
          </div>
          <span className="logo-text">EventSpaces</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          {/* Enlaces públicos */}
          <Link 
            to="/" 
            className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">explore</span>
            Descubrir
          </Link>

          {/* Enlaces según rol */}
          {getRoleBasedLinks()}
        </div>

        {/* User Section */}
        <div className="nav-user-section">
          {user ? (
            <div className="user-menu-container">
              <button 
                className="user-profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                <span className="user-name">{user.name}</span>
                <span className="material-symbols-outlined dropdown-arrow">
                  {isProfileMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <span className="material-symbols-outlined">person</span>
                        )}
                      </div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-role">{user.role}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>

                  <Link 
                    to={user.role === 'client' ? '/client/profile' : 
                        user.role === 'host' ? '/host/dashboard' : 
                        '/admin/dashboard'} 
                    className="dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined">account_circle</span>
                    Mi Perfil
                  </Link>

                  <Link 
                    to="/settings" 
                    className="dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined">settings</span>
                    Configuración
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={handleLogin}>
                <span className="material-symbols-outlined">login</span>
                Iniciar Sesión
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {/* Enlaces públicos */}
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActiveRoute('/') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="material-symbols-outlined">explore</span>
            Descubrir
          </Link>

          {/* Enlaces según rol */}
          {getRoleBasedLinks()?.props.children.map((link: any, index: number) => 
            React.cloneElement(link, {
              className: `mobile-nav-link ${isActiveRoute(link.props.to) ? 'active' : ''}`,
              onClick: () => setIsMenuOpen(false),
              key: index
            })
          )}

          {/* Enlaces adicionales para usuarios no autenticados */}
          {!user && (
            <button 
              className="mobile-nav-link login-btn-mobile"
              onClick={() => {
                handleLogin();
                setIsMenuOpen(false);
              }}
            >
              <span className="material-symbols-outlined">login</span>
              Iniciar Sesión
            </button>
          )}

          {/* Enlaces de usuario para móvil */}
          {user && (
            <>
              <div className="mobile-user-info">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>

              <Link 
                to={user.role === 'client' ? '/client/profile' : 
                    user.role === 'host' ? '/host/dashboard' : 
                    '/admin/dashboard'} 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-symbols-outlined">account_circle</span>
                Mi Perfil
              </Link>

              <Link 
                to="/settings" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-symbols-outlined">settings</span>
                Configuración
              </Link>

              <button 
                className="mobile-nav-link logout-btn"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      )}

      {/* Overlay para cerrar menús */}
      {(isMenuOpen || isProfileMenuOpen) && (
        <div 
          className="overlay"
          onClick={() => {
            setIsMenuOpen(false);
            setIsProfileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navigation;