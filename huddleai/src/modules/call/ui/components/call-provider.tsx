"use client";

import { authClient } from '@/lib/auth-client';
import { generateAvatarUri } from '@/lib/avatar';
import { CallConnect } from './call-connect';

interface CallProviderProps {
  meetingId: string;
  meetingName: string;
}

export const CallProvider = ({ meetingId, meetingName }: CallProviderProps) => {
  const { data: session } = authClient.useSession();

  if (!session) {
    return null;
  }

  const userImage = session.user.image || generateAvatarUri({
    seed: session.user.name || session.user.email,
    variant: 'initials'
  });

  return (
    <CallConnect
      meetingId={meetingId}
      meetingName={meetingName}
      userId={session.user.id}
      userName={session.user.name || session.user.email}
      userImage={userImage}
    />
  );
};