"use client";

import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { 
  Call,
  CallState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { CallUI } from './call-ui';

interface CallConnectProps {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage: string;
}

export const CallConnect = ({ 
  meetingId, 
  meetingName, 
  userId, 
  userName, 
  userImage 
}: CallConnectProps) => {
  const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>();
  const trpc = useTRPC();
  const initRef = useRef(false);

  const generateTokenMutation = useMutation({
    ...trpc.meetings.generateToken.mutationOptions(),
    onError: (error) => {
      console.error('Token generation failed:', error);
      setError('Failed to generate access token');
    }
  });

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) return;
    initRef.current = true;

    const initializeClient = async () => {
      try {
        setError(undefined);
        
        const { token } = await generateTokenMutation.mutateAsync({ meetingId });
        
        const _client = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
          user: {
            id: userId,
            name: userName,
            image: userImage,
          },
          token,
        });

        setClient(_client);
        setIsInitialized(true);

      } catch (error) {
        console.error('Failed to initialize client:', error);
        setError('Failed to initialize video client');
      }
    };

    initializeClient();

    // Cleanup function
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [meetingId, userId, userName, userImage]);

  useEffect(() => {
    if (!client || !isInitialized) return;

    const initializeCall = async () => {
      try {
        const _call = client.call('default', meetingId);
        
        // Disable camera and microphone by default
        await _call.camera.disable();
        await _call.microphone.disable();
        
        setCall(_call);

      } catch (error) {
        console.error('Failed to initialize call:', error);
        setError('Failed to initialize call');
      }
    };

    initializeCall();

    return () => {
      if (call && call.state.callingState !== "left") {
        call.leave().catch(console.error);
        call.endCall().catch(console.error);
      }
    };
  }, [client, isInitialized, meetingId]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!call || !client || !isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {generateTokenMutation.isPending ? 'Authenticating...' : 'Initializing call...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI meetingName={meetingName} />
      </StreamCall>
    </StreamVideo>
  );
};