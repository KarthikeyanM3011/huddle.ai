"use client";

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { CallProvider } from '@/modules/call/ui/components/call-provider';
import { ErrorState } from '@/components/ui/error';
import { useRouter } from 'next/navigation';

interface CallViewProps {
  meetingId: string;
}

export const CallView = ({ meetingId }: CallViewProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  
  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  if (meeting.status === 'completed') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <ErrorState
            title="Meeting has ended"
            message="You cannot join this meeting as it has already been completed."
            variant="default"
            onGoHome={() => router.push('/dashboard/meetings')}
            showHome
            className="bg-gray-900 text-white border-gray-700"
          />
        </div>
      </div>
    );
  }

  if (meeting.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <ErrorState
            title="Meeting cancelled"
            message="This meeting has been cancelled and is no longer available."
            variant="default"
            onGoHome={() => router.push('/dashboard/meetings')}
            showHome
            className="bg-gray-900 text-white border-gray-700"
          />
        </div>
      </div>
    );
  }

  return (
    <CallProvider 
      meetingId={meeting.id} 
      meetingName={meeting.name} 
    />
  );
};