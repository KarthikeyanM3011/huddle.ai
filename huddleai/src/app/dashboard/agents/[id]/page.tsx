import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { trpc, getQueryClient } from '@/trpc/server';
import { AgentDetailView } from '@/modules/agents/ui/views/agent-detail-view';
import { Loading } from '@/components/ui/loading';

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

function AgentDetailLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function AgentDetailContent({ params }: AgentDetailPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  
  await queryClient.prefetchQuery(trpc.agents.getOne.queryOptions({ id }));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AgentDetailView agentId={id} />
    </HydrationBoundary>
  );
}

const AgentDetailPage = ({ params }: AgentDetailPageProps) => {
  return (
    <Suspense fallback={<AgentDetailLoading />}>
      <AgentDetailContent params={params} />
    </Suspense>
  );
};

export default AgentDetailPage;