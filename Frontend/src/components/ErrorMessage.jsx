import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md animate-slideDown">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-900 mb-1">Error</h3>
            <p className="text-sm text-red-800">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
