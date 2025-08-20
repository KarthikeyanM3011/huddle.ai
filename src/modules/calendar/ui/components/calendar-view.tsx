"use client";

import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Bot, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    meetingId?: string;
    type: string;
    status: string;
    meetingStatus?: string;
    agentName?: string;
  };
}

interface CalendarViewProps {
  onEventSelect?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
}

export function CalendarView({ onEventSelect, onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const trpc = useTRPC();

  const startDate = useMemo(() => {
    if (currentView === Views.MONTH) {
      return startOfMonth(currentDate);
    }
    return startOfWeek(currentDate);
  }, [currentDate, currentView]);

  const endDate = useMemo(() => {
    if (currentView === Views.MONTH) {
      return endOfMonth(currentDate);
    }
    return addDays(startOfWeek(currentDate), 6);
  }, [currentDate, currentView]);

  const { data: events = [], isLoading } = useQuery(
    trpc.calendar.getEvents.queryOptions({
      startDate,
      endDate,
    })
  );

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      resource: event.resource,
    }));
  }, [events]);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onEventSelect?.(event);
  }, [onEventSelect]);

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    onDateSelect?.(start);
  }, [onDateSelect]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const { resource } = event;
    let backgroundColor = '#3b82f6'; // Default blue
    let borderColor = '#2563eb';
    let color = '#ffffff';

    if (resource.type === 'meeting') {
      switch (resource.meetingStatus || resource.status) {
        case 'upcoming':
        case 'scheduled':
          backgroundColor = '#3b82f6'; // Blue
          borderColor = '#2563eb';
          break;
        case 'active':
          backgroundColor = '#f59e0b'; // Orange
          borderColor = '#d97706';
          break;
        case 'completed':
          backgroundColor = '#10b981'; // Green
          borderColor = '#059669';
          break;
        case 'cancelled':
          backgroundColor = '#ef4444'; // Red
          borderColor = '#dc2626';
          break;
        case 'processing':
          backgroundColor = '#8b5cf6'; // Purple
          borderColor = '#7c3aed';
          break;
        default:
          backgroundColor = '#6b7280'; // Gray
          borderColor = '#4b5563';
      }
    } else {
      backgroundColor = '#06b6d4'; // Cyan for regular events
      borderColor = '#0891b2';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color,
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        padding: '2px 6px',
      },
    };
  }, []);

  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const { resource } = event;
    const isMeeting = resource.type === 'meeting';

    return (
      <div className="flex items-center space-x-1 text-xs">
        {isMapping && <Video className="w-3 h-3 flex-shrink-0" />}
        {!isMapping && <CalendarIcon className="w-3 h-3 flex-shrink-0" />}
        <span className="truncate font-medium">{event.title}</span>
      </div>
    );
  };

  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('PREV')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('TODAY')}
              className="h-8 px-3 text-sm font-medium"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('NEXT')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">{label}</h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === Views.MONTH ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.MONTH)}
            className="h-8 px-3 text-sm"
          >
            Month
          </Button>
          <Button
            variant={currentView === Views.WEEK ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.WEEK)}
            className="h-8 px-3 text-sm"
          >
            Week
          </Button>
          <Button
            variant={currentView === Views.DAY ? "default" : "outline"}
            size="sm"
            onClick={() => onView(Views.DAY)}
            className="h-8 px-3 text-sm"
          >
            Day
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          view={currentView}
          date={currentDate}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
            event: CustomEvent,
          }}
          className="calendar-custom"
        />
      </div>

      {/* Legend */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Event Types</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-600"></div>
              <span className="text-sm text-gray-700">Scheduled Meetings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded border-2 border-orange-600"></div>
              <span className="text-sm text-gray-700">Active Meetings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
              <span className="text-sm text-gray-700">Completed Meetings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
              <span className="text-sm text-gray-700">Cancelled Meetings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded border-2 border-purple-600"></div>
              <span className="text-sm text-gray-700">Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-cyan-500 rounded border-2 border-cyan-600"></div>
              <span className="text-sm text-gray-700">Regular Events</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}