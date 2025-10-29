import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/drizzle';
import { words } from '@/db/schema/words';
import { eq } from 'drizzle-orm';
import WordLearningComponent from './WordLearningComponent';

// 定义合法的category列表
const VALID_CATEGORIES = [
  'business',
  'hsk1',
  'hsk2',
  'hsk3',
  'hsk4',
  'hsk5',
  'hsk6',
];

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function WordBankPage({ params }: PageProps) {
  // 等待params解析
  const { category } = await params;

  // 创建Supabase服务端客户端
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 验证用户登录状态
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/wordbanks/' + category);
  }

  const userId = session.user.id;

  // 验证category合法性
  if (!VALID_CATEGORIES.includes(category)) {
    redirect('/wordbanks');
  }

  // 从数据库查询对应category的词汇
  const wordsList = await db
    .select()
    .from(words)
    .where(eq(words.category, category))
    .orderBy(words.frequency)
    .limit(10);

  // 如果没有单词数据，显示提示
  if (wordsList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No words found
          </h1>
          <p className="text-gray-600 mb-6">
            This word bank is empty. Please try another category.
          </p>
          <a
            href="/wordbanks"
            className="inline-block bg-[#165DFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Word Banks
          </a>
        </div>
      </div>
    );
  }

  // 渲染客户端组件
  return <WordLearningComponent words={wordsList} userId={userId} />;
}

