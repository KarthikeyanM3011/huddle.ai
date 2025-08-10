// src/components/ui/loading.tsx
import { Loader2, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'spinner' | 'dots' | 'pulse' | 'brain';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function Loading({ 
  size = 'md', 
  variant = 'default', 
  text, 
  className,
  fullScreen = false 
}: LoadingProps) {
  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2 className={cn(sizeClasses[size], 'animate-spin text-blue-600')} />
        );
      
      case 'brain':
        return (
          <div className="relative">
            <Brain className={cn(sizeClasses[size], 'text-blue-600 animate-pulse')} />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3 h-3 text-indigo-500 animate-ping" />
            </div>
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-blue-600',
                  size === 'sm' ? 'w-1 h-1' : 
                  size === 'md' ? 'w-2 h-2' :
                  size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
                )}
                style={{
                  animation: `loading-dots 1.4s ease-in-out ${i * 0.16}s infinite both`,
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            'rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse',
            sizeClasses[size]
          )} />
        );
      
      default:
        return (
          <div className="relative">
            <div className={cn(
              'rounded-full border-2 border-gray-200 animate-spin',
              sizeClasses[size]
            )}>
              <div className={cn(
                'rounded-full border-2 border-transparent border-t-blue-600',
                sizeClasses[size]
              )} />
            </div>
          </div>
        );
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-3',
      fullScreen && 'min-h-[400px]',
      className
    )}>
      {renderSpinner()}
      {text && (
        <p className={cn(
          'text-gray-600 font-medium animate-pulse',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Inline spinner for buttons and small spaces
export function InlineSpinner({ 
  size = 'sm', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  return (
    <Loader2 className={cn(
      'animate-spin',
      sizeClasses[size],
      className
    )} />
  );
}

// Page loading skeleton
export function PageLoading({ title }: { title?: string }) {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        {title ? (
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        ) : (
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse" />
        )}
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              </div>
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add CSS for dots animation
const style = `
@keyframes loading-dots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = style;
  document.head.appendChild(styleSheet);
}