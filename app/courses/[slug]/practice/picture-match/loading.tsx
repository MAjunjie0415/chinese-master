// Picture Match 页面加载骨架屏
export default function PictureMatchLoading() {
  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto">
        {/* 进度条骨架 */}
        <div className="mb-6 animate-pulse">
          <div className="h-2 bg-gray-200 rounded-full"></div>
        </div>

        {/* 单词卡片骨架 */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 animate-pulse">
          <div className="text-center mb-8">
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>

          {/* 选项骨架 */}
          <div className="space-y-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>

          {/* 按钮骨架 */}
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

