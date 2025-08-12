import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { trpc, getQueryClient } from '@/trpc/server';
import { AgentsView } from "@/modules/agents/ui/views/agents-view";
import { parseAgentsSearchParams } from '@/modules/agents/params';
import { Loading } from '@/components/ui/loading';

interface AgentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function AgentsPageLoading() {
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

async function AgentsPageContent({ searchParams }: AgentsPageProps) {
  const params = await searchParams;
  const filters = parseAgentsSearchParams(params);
  const queryClient = getQueryClient();
  
  await queryClient.prefetchQuery(trpc.agents.getMany.queryOptions(filters));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6">
        <AgentsView />
      </div>
    </HydrationBoundary>
  );
}

const AgentsPage = ({ searchParams }: AgentsPageProps) => {
  return (
    <Suspense fallback={<AgentsPageLoading />}>
      <AgentsPageContent searchParams={searchParams} />
    </Suspense>
  );
};

export default AgentsPage;