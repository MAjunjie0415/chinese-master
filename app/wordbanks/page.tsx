import Link from 'next/link';

export default function WordBanksPage() {
  // HSK等级配置
  const hskLevels = [
    { level: 1, words: '150 words', description: 'Beginner level' },
    { level: 2, words: '150 words', description: 'Elementary level' },
    { level: 3, words: '300 words', description: 'Pre-intermediate level' },
    { level: 4, words: '600 words', description: 'Intermediate level' },
    { level: 5, words: '1300 words', description: 'Upper-intermediate level' },
    { level: 6, words: '2500 words', description: 'Advanced level' },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      {/* 页面标题 */}
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
        Choose Your Word Bank
      </h1>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* 卡片1：商务汉语 */}
        <div className="bg-[#EFF6FF] rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            {/* 图标 */}
            <div className="text-5xl mb-4">💼</div>

            {/* 标题 */}
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Business Chinese
            </h2>

            {/* 描述 */}
            <p className="text-gray-600 mb-6">
              500+ High-Frequency Words for Work
            </p>

            {/* 按钮 */}
            <Link
              href="/wordbanks/business"
              className="inline-block bg-[#165DFF] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#0E42D2] transition-colors"
            >
              Start Learning
            </Link>
          </div>
        </div>

        {/* 卡片2：HSK分级 */}
        <div className="bg-[#ECFDF5] rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            {/* 图标 */}
            <div className="text-5xl mb-4">📚</div>

            {/* 标题 */}
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              HSK Levels
            </h2>

            {/* 描述 */}
            <p className="text-gray-600 mb-6">
              Systematic Learning from HSK 1 to 6
            </p>

            {/* HSK等级列表 */}
            <div className="w-full space-y-3">
              {hskLevels.map((hsk) => (
                <Link
                  key={hsk.level}
                  href={`/wordbanks/hsk${hsk.level}`}
                  className="block bg-white rounded-lg p-4 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        HSK {hsk.level}
                      </div>
                      <div className="text-sm text-gray-600">
                        {hsk.description}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{hsk.words}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

