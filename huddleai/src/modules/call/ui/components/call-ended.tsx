"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PhoneOff, BarChart3, ArrowLeft } from 'lucide-react';

export const CallEnded = () => {
  const router = useRouter();

  const handleBackToMeetings = () => {
    router.push('/dashboard/meetings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Call Ended</h1>
          <p className="text-gray-400">
            You have ended the call. Your call insights will be available in a few minutes.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center space-x-2 text-blue-400 mb-2">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Call Analytics</span>
          </div>
          <p className="text-sm text-gray-300">
            Meeting summary, transcription, and recording will be processed and made available shortly.
          </p>
        </div>

        <Button
          onClick={handleBackToMeetings}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meetings
        </Button>
      </div>
    </div>
  );
};