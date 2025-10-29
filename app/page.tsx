import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
      <div className="flex flex-col items-center text-center">
        {/* 产品Logo */}
        <h1 className="text-4xl font-bold text-[#165DFF]">
          ChineseMaster
        </h1>
        
        {/* 产品简介 */}
        <p className="mt-4 text-lg text-gray-600">
          Learn Mandarin for Business & HSK Exams
        </p>
        
        {/* 按钮组 */}
        <div className="mt-8 flex flex-col gap-4 w-full max-w-xs">
          {/* 按钮1: 商务汉语 */}
          <Link
            href="/app/wordbanks/business"
            className="px-8 py-3 bg-[#165DFF] text-white rounded-lg font-medium transition-colors hover:bg-[#0E42D2]"
          >
            Business Chinese
          </Link>
          
          {/* 按钮2: HSK等级 */}
          <Link
            href="/app/wordbanks/hsk1"
            className="px-8 py-3 bg-[#36D399] text-white rounded-lg font-medium transition-colors hover:bg-[#2BB673]"
          >
            HSK Levels
          </Link>
        </div>
      </div>
    </div>
  );
}
