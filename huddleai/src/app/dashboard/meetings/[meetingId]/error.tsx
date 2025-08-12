'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/ui/error';
import { Video, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MeetingDetailError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Meeting detail page error:', error);
  }, [error]);

  const handleRetry = () => {
    reset();
  };

  const handleGoToMeetings = () => {
    router.push('/dashboard/meetings');
  };

  const getErrorVariant = (errorMessage: string) => {
    if (errorMessage.toLowerCase().includes('not found')) {
      return 'default';
    }
    if (errorMessage.toLowerCase().includes('unauthorized')) {
      return 'permission';
    }
    return 'default';
  };

  const errorVariant = getErrorVariant(error.message);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border-2 border-red-200">
            <Video className="w-10 h-10 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Unable to Load Meeting
            </h1>
            <p className="text-gray-600">
              {error.message.includes('not found') 
                ? "This meeting doesn't exist or you don't have permission to view it."
                : "We encountered an error while loading this meeting."
              }
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Error Details:
            </h3>
            <p className="text-sm text-red-700 font-mono">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleRetry}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoToMeetings}
              className="w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Meetings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}