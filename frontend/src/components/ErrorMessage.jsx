import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3 my-4">
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium">
        <p>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs underline font-semibold text-rose-400 hover:text-rose-200"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
