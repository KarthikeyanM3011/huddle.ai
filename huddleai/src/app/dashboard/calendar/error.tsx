'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, Calendar } from 'lucide-react';

interface CalendarErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CalendarError({ error, reset }: CalendarErrorProps) {
  useEffect(() => {
    console.error('Calendar error:', error);
  }, [error]);

  const handleRetry = () => {
    reset();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const getErrorMessage = () => {
    if (error.message.includes('fetch')) {
      return 'Unable to load calendar data. Please check your internet connection.';
    }
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return 'Your session has expired. Please sign in again.';
    }
    if (error.message.includes('500')) {
      return 'Our servers are experiencing issues. Please try again in a moment.';
    }
    return 'An unexpected error occurred while loading the calendar.';
  };

  const getErrorTitle = () => {
    if (error.message.includes('fetch')) {
      return 'Connection Error';
    }
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return 'Authentication Required';
    }
    if (error.message.includes('500')) {
      return 'Server Error';
    }
    return 'Something went wrong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-8">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border-red-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-red-800 flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>{getErrorTitle()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 leading-relaxed">
              {getErrorMessage()}
            </p>
            {error.digest && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">
                  Error ID: {error.digest}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="w-full hover:bg-gray-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              If the problem persists, please contact support or try refreshing the page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}