import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { trpc, getQueryClient } from '@/trpc/server';
import { MeetingsView } from "@/modules/meetings/ui/views/meetings-view";
import { parseMeetingsSearchParams } from '@/modules/meetings/params';
import { Loading } from '@/components/ui/loading';

interface MeetingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function MeetingsPageLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      
      <div className="mb-6">
        <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function MeetingsPageContent({ searchParams }: MeetingsPageProps) {
  const params = await searchParams;
  const filtersRaw = parseMeetingsSearchParams(params);
  const queryClient = getQueryClient();

  // Explicitly cast status to the allowed type
  const allowedStatuses = ["upcoming", "active", "completed", "cancelled", "processing"] as const;
  type StatusType = typeof allowedStatuses[number];

  const filters = {
    ...filtersRaw,
    status: allowedStatuses.includes(filtersRaw.status as StatusType)
      ? (filtersRaw.status as StatusType)
      : undefined,
  };

  await queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions(filters));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6">
        <MeetingsView />
      </div>
    </HydrationBoundary>
  );
}

const MeetingsPage = ({ searchParams }: MeetingsPageProps) => {
  return (
    <Suspense fallback={<MeetingsPageLoading />}>
      <MeetingsPageContent searchParams={searchParams} />
    </Suspense>
  );
};

export default MeetingsPage;