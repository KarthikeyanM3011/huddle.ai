"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCallStateHooks,
  VideoPreview,
} from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneCall, X, User, Settings } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { generateAvatarUri } from '@/lib/avatar';

interface CallLobbyProps {
  onJoin: () => void;
}

export const CallLobby = ({ onJoin }: CallLobbyProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera, isMute: isCameraMute } = useCameraState();
  const { microphone, isMute: isMicMute } = useMicrophoneState();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPermissionsGranted(true);
      } catch (error) {
        console.error('Failed to get media permissions:', error);
        setPermissionsGranted(false);
      }
    };

    requestPermissions();
  }, []);

  const userImage = session?.user.image || generateAvatarUri({
    seed: session?.user.name || 'User',
    variant: 'initials'
  });

  const handleCancel = () => {
    router.push('/dashboard/meetings');
  };

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await onJoin();
    } catch (error) {
      console.error('Failed to join call:', error);
      setIsLoading(false);
    }
  };

  const toggleCamera = async () => {
    try {
      await camera.toggle();
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  };

  const toggleMicrophone = async () => {
    try {
      await microphone.toggle();
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Ready to join?
            </h1>
            <p className="text-xl text-gray-300">Set up your camera and microphone before joining</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Video Preview */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                {!isCameraMute && permissionsGranted ? (
                  <VideoPreview className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        {session?.user.image ? (
                          <img 
                            src={userImage} 
                            alt={session.user.name || 'User'} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-300" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-200 mb-2">
                        {session?.user.name || 'You'}
                      </h3>
                      {!permissionsGranted && (
                        <p className="text-sm text-gray-400">Camera access needed</p>
                      )}
                      {isCameraMute && permissionsGranted && (
                        <p className="text-sm text-gray-400">Camera is disabled</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Control Buttons Overlay */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <button
                    onClick={toggleCamera}
                    disabled={!permissionsGranted}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                      isCameraMute 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    } ${!permissionsGranted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isCameraMute ? (
                      <VideoOff className="w-6 h-6 text-white" />
                    ) : (
                      <Video className="w-6 h-6 text-white" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleMicrophone}
                    disabled={!permissionsGranted}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                      isMicMute 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    } ${!permissionsGranted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isMicMute ? (
                      <MicOff className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">Device Settings</h3>
                </div>
                
                {!permissionsGranted && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                    <p className="text-amber-200 text-sm font-medium">
                      📹 Camera and microphone access required
                    </p>
                    <p className="text-amber-300/80 text-xs mt-1">
                      Please allow permissions to join the meeting
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isCameraMute ? 'bg-red-500/20' : 'bg-green-500/20'
                      }`}>
                        <Video className={`w-5 h-5 ${
                          isCameraMute ? 'text-red-400' : 'text-green-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Camera</p>
                        <p className="text-xs text-gray-400">
                          {!permissionsGranted ? 'Permission needed' : isCameraMute ? 'Disabled' : 'Enabled'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      !permissionsGranted ? 'bg-yellow-500' : isCameraMute ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isMicMute ? 'bg-red-500/20' : 'bg-green-500/20'
                      }`}>
                        <Mic className={`w-5 h-5 ${
                          isMicMute ? 'text-red-400' : 'text-green-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Microphone</p>
                        <p className="text-xs text-gray-400">
                          {!permissionsGranted ? 'Permission needed' : isMicMute ? 'Muted' : 'Enabled'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      !permissionsGranted ? 'bg-yellow-500' : isMicMute ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleJoin}
                  disabled={!permissionsGranted || isLoading}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Joining...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <PhoneCall className="w-5 h-5 mr-2" />
                      Join Meeting
                    </div>
                  )}
                </Button>
                
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full h-12 bg-transparent border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 rounded-xl transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};