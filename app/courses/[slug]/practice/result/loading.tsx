export default function ResultLoading() {
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Encouragement Card Skeleton */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-4 border-blue-200 rounded-2xl p-8 mb-6 text-center shadow-xl animate-pulse">
          <div className="text-8xl mb-4">🎯</div>
          <div className="h-10 bg-gray-200 rounded-full w-3/4 mx-auto mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>

        {/* Results Card Skeleton */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="h-10 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="h-10 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="h-10 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
          </div>

          {/* Progress bar skeleton */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded-full w-full"></div>
          </div>
        </div>

        {/* Buttons skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-14 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        {/* Info cards skeleton */}
        <div className="h-32 bg-gray-100 rounded-lg mb-6 animate-pulse"></div>
      </div>
    </div>
  );
}
