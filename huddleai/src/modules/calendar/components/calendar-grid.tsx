"use client";

import { EventCard } from "./event-card";
import { CalendarEvent } from "../schema";

interface CalendarGridProps {
  days: Array<{
    date: Date;
    isCurrentMonth: boolean;
    events: CalendarEvent[];
  }>;
  currentDate: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarGrid = ({ days, currentDate }: CalendarGridProps) => {
  const today = new Date();
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === currentDate.toDateString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS.map((day) => (
          <div 
            key={day} 
            className="p-4 text-center text-sm font-semibold text-gray-600 bg-gray-50 border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <div 
            key={index}
            className={`min-h-32 p-2 border-r border-b border-gray-200 last:border-r-0 ${
              !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
            } ${
              isSelected(day.date) ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex flex-col h-full">
              <div className={`text-sm font-medium mb-2 ${
                !day.isCurrentMonth ? 'text-gray-400' : 
                isToday(day.date) ? 'text-white bg-blue-600 w-7 h-7 rounded-full flex items-center justify-center' :
                'text-gray-900'
              }`}>
                {day.date.getDate()}
              </div>
              
              <div className="flex-1 space-y-1 overflow-hidden">
                {day.events.slice(0, 3).map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    compact 
                  />
                ))}
                {day.events.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{day.events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};