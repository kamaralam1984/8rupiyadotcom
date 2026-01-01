/**
 * ⚡ Global Loading Component
 * Shows while pages are loading
 */

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Text */}
        <h2 className="mt-6 text-xl font-semibold text-gray-800">
          Loading...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait a moment
        </p>
      </div>
    </div>
  );
}

