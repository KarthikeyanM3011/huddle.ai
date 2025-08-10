// src/components/ui/error.tsx
'use client';

import { AlertTriangle, RefreshCw, Home, Bug, Wifi, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  variant?: 'default' | 'network' | 'permission' | 'validation' | 'server';
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
  className?: string;
  fullPage?: boolean;
}

const errorVariants = {
  default: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: Wifi,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
  },
  permission: {
    icon: Shield,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
  },
  validation: {
    icon: Bug,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: 'Validation Error',
    message: 'The provided data is invalid. Please check your input.',
  },
  server: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Server Error',
    message: 'The server encountered an error. Our team has been notified.',
  },
};

export function ErrorState({
  title,
  message,
  variant = 'default',
  onRetry,
  onGoHome,
  showRetry = true,
  showHome = false,
  className,
  fullPage = false,
}: ErrorStateProps) {
  const config = errorVariants[variant];
  const IconComponent = config.icon;

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center text-center space-y-4 p-8',
      fullPage && 'min-h-[400px]',
      className
    )}>
      <div className={cn(
        'w-16 h-16 rounded-full flex items-center justify-center',
        config.bgColor,
        config.borderColor,
        'border-2'
      )}>
        <IconComponent className={cn('w-8 h-8', config.color)} />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {title || config.title}
        </h3>
        <p className="text-gray-600 max-w-md">
          {message || config.message}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {showHome && onGoHome && (
          <Button variant="outline" onClick={onGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-md w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Inline error for forms and smaller components
export function InlineError({ 
  message, 
  onRetry, 
  className 
}: { 
  message: string; 
  onRetry?: () => void; 
  className?: string; 
}) {
  return (
    <Alert className={cn('border-red-200 bg-red-50', className)}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-auto p-0 text-red-600 hover:text-red-700 hover:bg-transparent"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Error boundary fallback
export function ErrorBoundaryFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void; 
}) {
  return (
    <ErrorState
      title="Application Error"
      message={error.message || 'An unexpected error occurred in the application.'}
      onRetry={resetErrorBoundary}
      fullPage
      showRetry
      showHome
      onGoHome={() => window.location.href = '/'}
    />
  );
}

// Network error specific component
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      variant="network"
      onRetry={onRetry}
      showRetry
    />
  );
}

// Permission error component
export function PermissionError() {
  return (
    <ErrorState
      variant="permission"
      showHome
      onGoHome={() => window.location.href = '/'}
    />
  );
}