import { Suspense } from 'react';
import { CalendarView } from '@/modules/calendar/views/calendar-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | HuddleAI',
  description: 'View and manage your meeting schedule',
};

function CalendarSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
        
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 bg-gray-50 border-r border-gray-200 last:border-r-0">
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse mx-auto" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-32 p-2 border-r border-b border-gray-200 last:border-r-0">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-4 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="p-8 max-w-7xl mx-auto">
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarView />
        </Suspense>
      </div>
    </div>
  );
}