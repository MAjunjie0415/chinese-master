// Practice Mode Selection 页面加载骨架屏
export default function PracticeModeLoading() {
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮骨架 */}
        <div className="h-6 bg-gray-200 rounded w-24 mb-6 animate-pulse"></div>

        {/* 标题骨架 */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-96"></div>
        </div>

        {/* 练习模式卡片骨架 */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div className="h-6 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
              <div className="p-4 bg-white">
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

