"use client";

import { useState, useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CalendarHeader } from "../components/calendar-header";
import { CalendarGrid } from "../components/calendar-grid";
import { useCalendarNavigation, useCalendarEvents } from "../hooks/use-calendar";
import { CalendarEvent } from "../schema";

export const CalendarView = () => {
  const [showCompleted, setShowCompleted] = useState(false);
  const trpc = useTRPC();
  
  const {
    currentDate,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,
  } = useCalendarNavigation();

  const { data: meetingsData, isLoading } = useQuery(
    trpc.meetings.getMany.queryOptions({
      page: 1,
      pageSize: 100,
      search: '',
      status: undefined,
      agentId: '',
    })
  );

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!meetingsData?.meetings) return [];
    
    return meetingsData.meetings
      .filter(meeting => meeting.scheduledStartTime)
      .map(meeting => ({
        id: meeting.id,
        title: meeting.name,
        description: meeting.instructions,
        startTime: new Date(meeting.scheduledStartTime!),
        endTime: new Date(new Date(meeting.scheduledStartTime!).getTime() + 60 * 60 * 1000),
        type: 'meeting' as const,
        status: meeting.status === 'completed' ? 'completed' as const : 
                meeting.status === 'cancelled' ? 'cancelled' as const : 
                'upcoming' as const,
        meetingId: meeting.id,
        agentName: meeting.agentName,
      }));
  }, [meetingsData]);

  const {
    getDaysInMonth,
  } = useCalendarEvents(calendarEvents, currentDate, showCompleted);

  const days = getDaysInMonth(currentDate);

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter(event => {
      return showCompleted ? event.status === 'completed' : event.status === 'upcoming';
    });
  }, [calendarEvents, showCompleted]);

  const upcomingCount = calendarEvents.filter(e => e.status === 'upcoming').length;
  const completedCount = calendarEvents.filter(e => e.status === 'completed').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        onPreviousMonth={navigateToPreviousMonth}
        onNextMonth={navigateToNextMonth}
        onToday={navigateToToday}
      />

      <div className="flex justify-between items-center">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Upcoming ({upcomingCount})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Completed ({completedCount})
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredEvents.length} {showCompleted ? 'completed' : 'upcoming'} events
        </div>
      </div>

      <CalendarGrid 
        days={days} 
        currentDate={currentDate} 
      />

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {showCompleted ? 'completed' : 'upcoming'} events
            </h3>
            <p className="text-gray-600">
              {showCompleted 
                ? 'No completed meetings to display in this month.' 
                : 'Schedule your first meeting to see it appear on the calendar.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};