import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { trpc, getQueryClient } from '@/trpc/server';
import { CallView } from '@/modules/call/ui/views/call-view';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface CallPageProps {
  params: Promise<{ meetingId: string }>;
}

function CallLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Joining meeting...</p>
      </div>
    </div>
  );
}

async function CallContent({ params }: CallPageProps) {
  const { meetingId } = await params;
  const queryClient = getQueryClient();
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/sign-in');
  }
  
  await queryClient.prefetchQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CallView meetingId={meetingId} />
    </HydrationBoundary>
  );
}

const CallPage = ({ params }: CallPageProps) => {
  return (
    <Suspense fallback={<CallLoading />}>
      <CallContent params={params} />
    </Suspense>
  );
};

export default CallPage;