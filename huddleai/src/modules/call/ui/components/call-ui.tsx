"use client";

import { useState } from 'react';
import { StreamTheme, useCall } from '@stream-io/video-react-sdk';
import { CallLobby } from './call-lobby';
import { CallActive } from './call-active';
import { CallEnded } from './call-ended';

type ShowState = 'lobby' | 'call' | 'ended';

interface CallUIProps {
  meetingName: string;
}

export const CallUI = ({ meetingName }: CallUIProps) => {
  const [show, setShow] = useState<ShowState>('lobby');
  const call = useCall();

  const handleJoin = async () => {
    if (!call) return;
    
    try {
        console.log('Joining call...');
        await call.join();
        setShow('call');
    } catch (error) {
        console.error('Failed to join call:', error);
    }
  };

  const handleLeave = () => {
    setShow('ended');
  };

  return (
    <StreamTheme>
      <div className="min-h-screen bg-black">
        {show === 'lobby' && (
          <CallLobby onJoin={handleJoin} />
        )}
        
        {show === 'call' && (
          <CallActive 
            onLeave={handleLeave} 
            meetingName={meetingName} 
          />
        )}
        
        {show === 'ended' && (
          <CallEnded />
        )}
      </div>
    </StreamTheme>
  );
};