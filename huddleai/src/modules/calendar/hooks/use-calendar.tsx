import { useState, useMemo } from 'react';
import { CalendarEvent } from '@/modules/calendar/schema';

export function useCalendarNavigation(initialDate = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const navigateToDate = (date: Date) => {
    setCurrentDate(date);
  };

  const navigateToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const navigateToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  return {
    currentDate,
    navigateToDate,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,
  };
}

export function useCalendarEvents(events: CalendarEvent[], currentDate: Date, showCompleted: boolean) {
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      const sameMonth = eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear();
      
      const statusMatch = showCompleted ? 
        event.status === 'completed' : 
        event.status === 'upcoming';
        
      return sameMonth && statusMatch;
    });
  }, [events, currentDate, showCompleted]);

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: getEventsForDate(prevDate)
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date)
      });
    }

    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: getEventsForDate(nextDate)
      });
    }

    return days;
  };

  return {
    filteredEvents,
    getEventsForDate,
    getDaysInMonth,
  };
}