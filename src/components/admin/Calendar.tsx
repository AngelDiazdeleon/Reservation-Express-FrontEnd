import React, { useState } from 'react';

interface CalendarEvent {
  id: string;
  terraza: string;
  cliente: string;
  tipo: 'renta' | 'visita' | 'evento';
  fecha: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Datos de ejemplo para el calendario (usar events si vienen, si no usar datos de ejemplo)
  const calendarEvents = events.length > 0 ? events : [
    { 
      id: '1',
      fecha: '2024-01-05', 
      terraza: 'El Mirador', 
      cliente: 'Ana Torres', 
      tipo: 'renta' 
    },
    { 
      id: '2',
      fecha: '2024-01-10', 
      terraza: 'Jardín Secreto', 
      cliente: 'Visita - L. Vega', 
      tipo: 'visita' 
    },
    { 
      id: '3',
      fecha: '2024-01-14', 
      terraza: 'Vista al Valle', 
      cliente: 'Carlos Pérez', 
      tipo: 'renta' 
    },
    { 
      id: '4',
      fecha: '2024-01-14', 
      terraza: 'El Mirador', 
      cliente: 'Visita - R. Gil', 
      tipo: 'visita' 
    },
    { 
      id: '5',
      fecha: '2024-01-19', 
      terraza: 'Terraza del Sol', 
      cliente: 'María González', 
      tipo: 'renta' 
    },
    { 
      id: '6',
      fecha: '2024-01-22', 
      terraza: 'Rooftop 360', 
      cliente: 'Juan Martínez', 
      tipo: 'renta' 
    },
  ];

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.fecha === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const getMonthDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true
      });
    }

    // Días del próximo mes
    const totalCells = 42; // 6 semanas
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            className="nav-button"
            onClick={() => navigateMonth('prev')}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="calendar-title">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button 
            className="nav-button"
            onClick={() => navigateMonth('next')}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {/* Headers de días */}
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {/* Días del calendario */}
        {getMonthDays().map((day, index) => {
          const events = getEventsForDate(day.date);
          const isCurrentDay = isToday(day.date);

          return (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                isCurrentDay ? 'today' : ''
              }`}
            >
              <div className="day-number">
                {day.date.getDate()}
              </div>
              
              <div className="day-events">
                {events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`event-item ${event.tipo === 'visita' ? 'event-visita' : 'event-renta'}`}
                    title={`${event.terraza} - ${event.cliente}`}
                  >
                    <div className="event-terraza">{event.terraza}</div>
                    <div className="event-cliente">{event.cliente}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color event-renta"></div>
          <span>Renta</span>
        </div>
        <div className="legend-item">
          <div className="legend-color event-visita"></div>
          <span>Visita</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;