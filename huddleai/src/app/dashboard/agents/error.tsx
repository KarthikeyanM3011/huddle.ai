// src/app/dashboard/agents/error.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/ui/error';
import { Bot, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AgentsError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log error to your error reporting service
    console.error('Agents page error:', error);
  }, [error]);

  const handleRetry = () => {
    reset();
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // Determine error variant based on error message
  const getErrorVariant = (errorMessage: string) => {
    if (errorMessage.toLowerCase().includes('network') || 
        errorMessage.toLowerCase().includes('fetch') ||
        errorMessage.toLowerCase().includes('connection')) {
      return 'network';
    }
    if (errorMessage.toLowerCase().includes('permission') || 
        errorMessage.toLowerCase().includes('unauthorized')) {
      return 'permission';
    }
    if (errorMessage.toLowerCase().includes('server') || 
        errorMessage.toLowerCase().includes('500')) {
      return 'server';
    }
    return 'default';
  };

  const errorVariant = getErrorVariant(error.message);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Custom error state for agents page */}
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border-2 border-red-200">
            <Bot className="w-10 h-10 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Unable to Load AI Agents
            </h1>
            <p className="text-gray-600">
              We encountered an error while loading your AI agents. This might be a temporary issue.
            </p>
          </div>

          {/* Error details */}
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

          {/* Action buttons */}
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
              onClick={handleGoToDashboard}
              className="w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Help section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Need Help?
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Check your internet connection</p>
              <p>• Try refreshing the page</p>
              <p>• Contact support if the problem persists</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}