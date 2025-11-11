// 全局加载骨架屏
export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        {/* Hero Section 骨架 */}
        <section className="min-h-screen flex items-center px-4 py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
              <div className="h-6 bg-gray-200 rounded w-5/6"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 rounded-lg w-40"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

