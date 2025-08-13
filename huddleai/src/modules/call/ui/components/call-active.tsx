"use client";

import { useEffect } from 'react';
import {
  SpeakerLayout,
  CallControls,
  useCall,
  CallingState,
} from '@stream-io/video-react-sdk';

interface CallActiveProps {
  onLeave: () => void;
  meetingName: string;
}

export const CallActive = ({ onLeave, meetingName }: CallActiveProps) => {
  const call = useCall();

  useEffect(() => {
    if (!call) return;

    const handleCallEnd = () => {
      onLeave();
    };

    const handleCallLeft = () => {
      onLeave();
    };

    call.on('call.ended', handleCallEnd);
    call.on('call.session_participant_left', handleCallLeft);

    return () => {
      call.off('call.ended', handleCallEnd);
      call.off('call.session_participant_left', handleCallLeft);
    };
  }, [call, onLeave]);

  const handleLeaveCall = async () => {
    if (call && call.state.callingState !== CallingState.LEFT) {
      try {
        await call.leave();
      } catch (error) {
        console.error('Error leaving call:', error);
      }
    }
    onLeave();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg">
          <h2 className="text-lg font-semibold text-center">{meetingName}</h2>
        </div>
      </div>

      <div className="h-screen flex flex-col">
        <div className="flex-1">
          <SpeakerLayout />
        </div>
        
        <div className="p-4">
          <CallControls onLeave={handleLeaveCall} />
        </div>
      </div>
    </div>
  );
};