// Practice Result 页面加载骨架屏
export default function PracticeResultLoading() {
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* 鼓励语卡片骨架 */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-300 rounded-2xl p-8 mb-6 text-center animate-pulse">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-3"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
        </div>

        {/* 成绩卡片骨架 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mx-auto mb-6"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="h-10 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>

        {/* 按钮骨架 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

