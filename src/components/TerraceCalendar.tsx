import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../page/css/TerraceCalendar.css';

interface Reservation {
  _id: string;
  terraceId: string;
  terraceName: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  totalAmount: number;
}

interface Terrace {
  _id: string;
  name: string;
}

const TerraceCalendar: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [terraces, setTerraces] = useState<Terrace[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTerrace, setFilterTerrace] = useState<string>('all');

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      const terracesRes = await axios.get('/terraces');
      setTerraces(terracesRes.data.data || []);
      
      const mockReservations: Reservation[] = [
        {
          _id: '1',
          terraceId: terracesRes.data.data?.[0]?._id || '1',
          terraceName: terracesRes.data.data?.[0]?.name || 'Terraza Jardín',
          date: new Date(Date.now() + 86400000).toISOString(),
          startTime: '14:00',
          endTime: '18:00',
          customerName: 'Juan Pérez',
          customerEmail: 'juan@email.com',
          customerPhone: '+1234567890',
          status: 'confirmed',
          totalAmount: 200
        },
        {
          _id: '2',
          terraceId: terracesRes.data.data?.[1]?._id || '2',
          terraceName: terracesRes.data.data?.[1]?.name || 'Salón Principal',
          date: new Date(Date.now() + 2 * 86400000).toISOString(),
          startTime: '20:00',
          endTime: '23:00',
          customerName: 'María García',
          customerEmail: 'maria@email.com',
          customerPhone: '+0987654321',
          status: 'pending',
          totalAmount: 350
        }
      ];
      
      setReservations(mockReservations);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    let filteredReservations = reservations;
    
    if (filterTerrace !== 'all') {
      filteredReservations = reservations.filter(res => res.terraceId === filterTerrace);
    }
    
    return filteredReservations.filter(reservation => {
      const reservationDate = new Date(reservation.date).toDateString();
      return reservationDate === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      confirmed: '#28a745',
      pending: '#ffc107', 
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      confirmed: '✅ Confirmada',
      pending: '⏳ Pendiente',
      cancelled: '❌ Cancelada'
    };
    return texts[status] || status;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startDay = firstDay.getDay();

    const weeks = [];
    let days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayEvents = getEventsForDate(currentDate);
      const isToday = new Date().toDateString() === currentDate.toDateString();
      
      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}>
          <div className="day-number">
            {day}
            {isToday && <span className="today-badge">Hoy</span>}
          </div>
          {dayEvents.map(event => (
            <div 
              key={event._id} 
              className="calendar-event"
              style={{ backgroundColor: getStatusColor(event.status) }}
              title={`${event.terraceName} - ${event.startTime} a ${event.endTime} - ${event.customerName}`}
            >
              {event.startTime} {event.terraceName}
            </div>
          ))}
        </div>
      );

      if ((day + startDay) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={weeks.length} className="calendar-week">
            {days}
          </div>
        );
        days = [];
      }
    }

    return weeks;
  };

  if (loading) return (
    <div className="calendar-loading">
      <div className="loading-spinner"></div>
      <p>Cargando calendario...</p>
    </div>
  );

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>📅 Calendario de Reservas</h1>
        
        <div className="calendar-controls">
          <label className="filter-label">Filtrar por terraza:</label>
          <select
            value={filterTerrace}
            onChange={(e) => setFilterTerrace(e.target.value)}
            className="terrace-filter"
          >
            <option value="all">Todas las terrazas</option>
            {terraces.map(terrace => (
              <option key={terrace._id} value={terrace._id}>
                {terrace.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calendar-content">
        <div className="calendar-main">
          <div className="calendar-nav">
            <button onClick={() => navigateMonth(-1)} className="nav-btn prev-btn">
              ◀ Mes Anterior
            </button>
            
            <h2 className="calendar-title">
              {selectedDate.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              }).toUpperCase()}
            </h2>
            
            <div className="nav-buttons">
              <button onClick={() => setSelectedDate(new Date())} className="today-btn">
                Hoy
              </button>
              <button onClick={() => navigateMonth(1)} className="nav-btn next-btn">
                Mes Siguiente ▶
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {renderCalendar()}
          </div>
        </div>

        <div className="calendar-sidebar">
          <div className="sidebar-section legend-section">
            <h3>📊 Leyenda</h3>
            <div className="legend-list">
              <div className="legend-item">
                <div className="legend-color confirmed"></div>
                <span>Confirmada</span>
              </div>
              <div className="legend-item">
                <div className="legend-color pending"></div>
                <span>Pendiente</span>
              </div>
              <div className="legend-item">
                <div className="legend-color cancelled"></div>
                <span>Cancelada</span>
              </div>
              <div className="legend-item">
                <div className="legend-color today-legend"></div>
                <span>Hoy</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section upcoming-section">
            <h3>🕐 Próximas Reservas</h3>
            
            {reservations.length === 0 ? (
              <p className="no-reservations">No hay reservas próximas</p>
            ) : (
              <div className="upcoming-list">
                {reservations
                  .filter(res => new Date(res.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 6)
                  .map(reservation => (
                  <div key={reservation._id} className="upcoming-item">
                    <div className="upcoming-header">
                      <strong>{reservation.terraceName}</strong>
                    </div>
                    <div className="upcoming-details">
                      <span>📅 {new Date(reservation.date).toLocaleDateString('es-ES')}</span>
                      <span>🕐 {reservation.startTime} - {reservation.endTime}</span>
                      <span>👤 {reservation.customerName}</span>
                    </div>
                    <div className={`upcoming-status status-${reservation.status}`}>
                      {getStatusText(reservation.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerraceCalendar;