import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Processing...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-lg font-medium text-gray-900">{message}</p>
          <p className="text-sm text-gray-500">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
