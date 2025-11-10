/**
 * 练习工具函数
 * 统一处理练习进度和复习记录的创建
 */

interface WordResult {
  wordId: number;
  isCorrect: boolean;
}

/**
 * 批量创建 user_progress 记录（用于复习系统）
 * @param wordResults 单词练习结果数组
 * @returns Promise<void>
 */
export async function createReviewRecords(wordResults: WordResult[]): Promise<void> {
  try {
    // 为每个单词创建/更新 user_progress 记录
    const promises = wordResults.map(({ wordId, isCorrect }) => {
      return fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId,
          known: isCorrect, // 答对 = known, 答错 = !known
          isReview: false, // 这是学习模式，不是复习模式
        }),
      });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error creating review records:', error);
    // 不抛出错误，避免影响用户体验
  }
}

