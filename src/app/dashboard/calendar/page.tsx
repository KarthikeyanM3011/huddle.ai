import { Suspense } from 'react';
import { CalendarPageView } from '@/modules/calendar/ui/views/calendar-view';
import { Loading } from '@/components/ui/loading';

function CalendarPageLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

async function CalendarPageContent() {
  return (
    <div className="p-6">
      <CalendarPageView />
    </div>
  );
}

const CalendarPage = () => {
  return (
    <Suspense fallback={<CalendarPageLoading />}>
      <CalendarPageContent />
    </Suspense>
  );
};

export default CalendarPage;