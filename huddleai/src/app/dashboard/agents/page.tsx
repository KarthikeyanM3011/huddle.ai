// src/app/dashboard/agents/page.tsx
import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { trpc, getQueryClient } from '@/trpc/server';
import { AgentsView } from "@/modules/agents/ui/views/agents-view";
import { Loading } from '@/components/ui/loading';

// Loading component for the agents page
function AgentsPageLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
              </div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main agents page component
async function AgentsPageContent() {
  const queryClient = getQueryClient();
  
  await queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI Agents
          </h1>
        </div>
        
        <Suspense fallback={<AgentsPageLoading />}>
          <AgentsView />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}

const AgentsPage = () => {
  return (
    <Suspense fallback={<AgentsPageLoading />}>
      <AgentsPageContent />
    </Suspense>
  );
};

export default AgentsPage;