import Link from 'next/link';

export default function ProfilePage() {
  // 占位符数据，后续替换为真实数据
  const stats = {
    totalLearned: 0,
    mastered: 0,
    reviewsToday: 0,
  };

  return (
    <div className="min-h-screen py-8 px-4">
      {/* 页面标题 */}
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
        Your Learning Progress
      </h1>

      {/* 统计卡片 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 卡片1：总学习单词数 */}
        <div className="bg-[#EFF6FF] rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-lg text-gray-600 mb-4">Total Words Learned</h2>
          <p className="text-5xl font-bold text-blue-600 my-4">
            {stats.totalLearned}
          </p>
        </div>

        {/* 卡片2：已掌握单词数 */}
        <div className="bg-[#ECFDF5] rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-lg text-gray-600 mb-4">Mastered Words</h2>
          <p className="text-5xl font-bold text-green-600 my-4">
            {stats.mastered}
          </p>
        </div>

        {/* 卡片3：今日待复习 */}
        <div className="bg-[#FFFBEB] rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-lg text-gray-600 mb-4">Reviews Today</h2>
          <p className="text-5xl font-bold text-yellow-600 my-4">
            {stats.reviewsToday}
          </p>
        </div>
      </div>

      {/* 底部：快速操作 */}
      <div className="max-w-5xl mx-auto mt-12">
        <div className="text-center">
          <Link
            href="/wordbanks"
            className="inline-block bg-[#165DFF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0E42D2] transition-colors mb-6"
          >
            Continue Learning
          </Link>
        </div>

        {/* 退出登录按钮 - 暂时显示为静态文本，后续实现为客户端组件 */}
        <div className="text-center mt-8">
          <span className="text-red-600 text-lg font-semibold">
            Sign Out (Coming Soon)
          </span>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="max-w-5xl mx-auto mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Start learning to see your progress here!
        </p>
      </div>
    </div>
  );
}

