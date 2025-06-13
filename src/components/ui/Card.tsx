import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  title?: string | ReactNode;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function Card({
  title,
  subtitle,
  footer,
  children,
  className,
  contentClassName,
  loading,
  error,
  onRetry,
}: CardProps) {
  const hasError = Boolean(error);

  return (
    <div
      className={twMerge(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        'overflow-hidden transition-shadow hover:shadow-md',
        hasError && 'border-red-300 bg-red-50',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-gray-200">
          {title && (
            <div className="text-lg font-semibold text-gray-900">
              {title}
            </div>
          )}
          {subtitle && (
            <div className="mt-1 text-sm text-gray-500">
              {subtitle}
            </div>
          )}
        </div>
      )}

      <div
        className={twMerge(
          'p-4',
          hasError && 'bg-red-50',
          contentClassName
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : hasError ? (
          <div className="text-center py-4">
            <div className="text-red-600 mb-2">
              {error}
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Tentar novamente
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>

      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}