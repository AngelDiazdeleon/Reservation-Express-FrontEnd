// MembershipPlans.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../css/hostcss/MembershipPlans.css';
import api from '../../api';

const MembershipPlans = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('membresia');
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    memberSince: ''
  });

  // Notificaciones de ejemplo
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'reserva', 
      message: 'Nueva reserva para Terraza El Mirador', 
      time: 'Hace 2 horas',
      read: false
    },
    { 
      id: 2, 
      type: 'mensaje', 
      message: 'Tienes un nuevo mensaje', 
      time: 'Hace 5 horas',
      read: false
    },
    { 
      id: 3, 
      type: 'sistema', 
      message: 'Tu terraza ha sido publicada', 
      time: 'Ayer',
      read: true
    }
  ]);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short' 
          }) : 'Jan 2023'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
  }, []);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setNotificationsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reserva': return 'event_available';
      case 'mensaje': return 'chat';
      case 'sistema': return 'info';
      default: return 'notifications';
    }
  };

  // Obtener inicial para el avatar
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  // Datos de los planes
  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      popular: false,
      buttonText: 'Seleccionar Plan',
      features: [
        '10 fotos permitidas',
        'Visibilidad normal',
        'Acceso a analíticas básicas',
        'Soporte por email'
      ]
    },
    {
      id: 'plus',
      name: 'Plus',
      monthlyPrice: 299,
      yearlyPrice: 2870,
      popular: true,
      buttonText: 'Comprar Ahora',
      features: [
        '25 fotos permitidas',
        'Listado destacado',
        'Acceso a analíticas avanzadas',
        'Soporte por chat',
        'Opción de video tour'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 499,
      yearlyPrice: 4788,
      popular: false,
      buttonText: 'Seleccionar Plan',
      features: [
        'Fotos ilimitadas',
        'Listado prioritario',
        'Acceso a analíticas completas',
        'Soporte telefónico prioritario',
        'Opción de video tour'
      ]
    }
  ];

  // Función para manejar la compra
  const handlePurchase = async (planId) => {
    setLoading(true);
    try {
      const selectedPlan = plans.find(plan => plan.id === planId);
      const price = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
      
      const response = await fetch('http://localhost:4000/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          price: price,
          billingCycle: billingCycle,
          currency: 'MXN'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.session.url;
      } else {
        alert('Error al procesar el pago: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  // FAQ data
  const faqs = [
    {
      question: '¿Cómo funciona la facturación?',
      answer: 'La facturación se realiza de forma automática al inicio de cada ciclo, ya sea mensual o anual, según el plan que hayas seleccionado. Puedes actualizar tu método de pago en cualquier momento desde tu panel de control.'
    },
    {
      question: '¿Puedo cancelar mi plan en cualquier momento?',
      answer: 'Sí, puedes cancelar tu suscripción en cualquier momento. Tu plan permanecerá activo hasta el final del ciclo de facturación actual, y no se te cobrará nuevamente.'
    },
    {
      question: '¿Qué plan es el adecuado para mí?',
      answer: 'El plan "Plus" es nuestra opción más popular y ofrece un gran equilibrio entre precio y características. Si recién estás comenzando, el plan "Básico" es una excelente opción. Para máxima visibilidad y beneficios, te recomendamos el plan "Premium".'
    }
  ];

  return (
    <div className="mis-terrazas">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">
              <span className="material-symbols-outlined">terrace</span>
              <h1>TerrazaApp</h1>
            </div>
          </div>
          
          <nav className="nav-section">
            <div className="user-section" ref={userMenuRef}>
              {/* Notificaciones */}
              <div className="notification-container" ref={notificationsRef}>
                <button 
                  className="icon-btn notification-btn"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notificaciones</h3>
                      {unreadNotifications > 0 && (
                        <button className="mark-all-read" onClick={markAllAsRead}>
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.read ? '' : 'unread'}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="notification-icon">
                            <span className="material-symbols-outlined">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                          <div className="notification-content">
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {user ? (
                <div 
                  className="user-profile"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="avatar">
                    <span>{getInitial()}</span>
                  </div>
                  <span className="user-name">{user.name}</span>
                  
                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <a className="dropdown-item" href="/host/profile">
                        <span className="material-symbols-outlined"></span>
                        Mi Perfil
                      </a>
                      <a 
                        className="dropdown-item" 
                        href="/host/configuracion"
                      >
                        <span className="material-symbols-outlined"></span>
                        Configuración
                      </a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item" onClick={handleLogout}>
                        <span className="material-symbols-outlined"></span>
                        Cerrar Sesión
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <a href="/login" className="login-btn">Iniciar Sesión</a>
                  <a href="/register" className="register-btn">Registrarse</a>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content con Sidebar */}
      <div className="profile-main-with-sidebar">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
                <h2>TerraceRent</h2>
              </div>
            </div>
            
            {/* Menú de Navegación */}
            <nav className="sidebar-nav">
              <a 
                className={`nav-item ${activeMenu === 'inicio' ? 'active' : ''}`}
                href="/host/dashboard"
                onClick={() => setActiveMenu('inicio')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Inicio</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'terrazas' ? 'active' : ''}`}
                href="/host/MyTerraces"
                onClick={() => setActiveMenu('terrazas')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Mis Terrazas</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'reservaciones' ? 'active' : ''}`}
                href="/host/reservations"
                onClick={() => setActiveMenu('reservaciones')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Reservaciones</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'nueva-terraza' ? 'active' : ''}`}
                href="/host/DocumentVerification"
                onClick={() => setActiveMenu('nueva-terraza')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Subir nueva terraza</span>
              </a>
              <a 
                className={`nav-item ${activeMenu === 'membresia' ? 'active' : ''}`}
                href="/host/membership"
                onClick={() => setActiveMenu('membresia')}
              >
                <span className="material-symbols-outlined"></span>
                <span>Planes de Membresía</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main-content">
          <div className="profile-container">
            {/* Page Content */}
            <div className="content-container membership-plans-content">
              
              {/* Page Heading */}
              <div className="membership-page-heading">
                <h1>Elige tu Plan de Membresía</h1>
                <p>Obtén más visibilidad y reservas con nuestros planes premium.</p>
              </div>

              {/* Billing Toggle */}
              <div className="billing-toggle">
                <div className="toggle-container">
                  <button 
                    className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
                    onClick={() => setBillingCycle('monthly')}
                  >
                    Pago Mensual
                  </button>
                  <button 
                    className={`toggle-option ${billingCycle === 'yearly' ? 'active' : ''}`}
                    onClick={() => setBillingCycle('yearly')}
                  >
                    Pago Anual
                  </button>
                </div>
              </div>

              {/* Plans Grid - Los 3 juntos en una fila */}
              <div className="membership-plans-container">
                <div className="plans-row">
                  {plans.map((plan) => {
                    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                    const period = billingCycle === 'monthly' ? 'mes' : 'año';
                    
                    return (
                      <div 
                        key={plan.id} 
                        className={`plan-card ${plan.popular ? 'popular' : ''}`}
                      >
                        {plan.popular && <div className="popular-badge">MÁS POPULAR</div>}
                        
                        <div className="plan-header">
                          <h3 className="plan-name">{plan.name}</h3>
                          <div className="plan-price">
                            <span className="price-amount">${price}</span>
                            <span className="price-period">/ {period}</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <p className="savings-text">
                              ¡Ahorras ${(plan.monthlyPrice * 12) - plan.yearlyPrice} al año!
                            </p>
                          )}
                        </div>

                        <button 
                          className={`plan-button ${plan.popular ? 'popular-button' : ''}`}
                          onClick={() => handlePurchase(plan.id)}
                          disabled={loading}
                        >
                          {loading ? 'Procesando...' : plan.buttonText}
                        </button>

                        <div className="plan-features">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="feature-item">
                              <span className="material-symbols-outlined feature-icon">check_circle</span>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="membership-faq-section">
                <h2>Preguntas Frecuentes</h2>
                <div className="faq-container">
                  {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <h3 className="faq-question">{faq.question}</h3>
                      <p className="faq-answer">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MembershipPlans;