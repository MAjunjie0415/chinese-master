// Review Start 页面加载骨架屏
export default function ReviewStartLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
          {/* 头部渐变背景骨架 */}
          <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4"></div>
              <div className="h-8 bg-white bg-opacity-20 rounded w-64 mx-auto mb-2"></div>
              <div className="h-5 bg-white bg-opacity-20 rounded w-48 mx-auto"></div>
            </div>
          </div>

          {/* 内容区骨架 */}
          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>

            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

