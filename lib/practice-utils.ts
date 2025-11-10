/**
 * 练习工具函数
 * 用于处理练习完成后的复习记录创建
 */

interface WordResult {
  wordId: number;
  isCorrect: boolean;
}

/**
 * 为练习的单词创建复习记录（user_progress）
 * @param wordResults 单词答题结果数组
 * @returns Promise<void>
 */
export async function createReviewRecords(wordResults: WordResult[]): Promise<void> {
  if (!wordResults || wordResults.length === 0) {
    return;
  }

  try {
    // 批量创建复习记录
    // 为每个单词调用 /api/progress 创建 user_progress
    const promises = wordResults.map((result) =>
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: result.wordId,
          known: result.isCorrect, // 答对 = known, 答错 = !known
          isReview: false, // 这是学习模式，不是复习模式
        }),
      })
    );

    // 等待所有请求完成（不阻塞，允许部分失败）
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error creating review records:', error);
    // 不抛出错误，允许练习记录保存成功，即使复习记录创建失败
  }
}
