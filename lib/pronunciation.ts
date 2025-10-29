/**
 * 发音工具函数
 * 使用浏览器原生 Web Speech API 播放中文发音
 */

/**
 * 播放拼音发音
 * @param text - 要朗读的中文文本（可以是汉字或拼音）
 * @returns Promise<string | null> - 成功返回null，失败返回错误信息
 */
export async function playPinyinPronunciation(
  text: string
): Promise<string | null> {
  try {
    // 检查浏览器是否支持 Web Speech API
    if (!('speechSynthesis' in window)) {
      return 'Your browser does not support text-to-speech. Please use Chrome, Safari, or Edge.';
    }

    // 停止之前可能正在播放的语音
    window.speechSynthesis.cancel();

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(text);

    // 设置语言为中文（普通话）
    utterance.lang = 'zh-CN';

    // 设置语速（0.1-10，默认1）
    utterance.rate = 0.9; // 稍慢一点，方便学习

    // 设置音量（0-1，默认1）
    utterance.volume = 1;

    // 设置音调（0-2，默认1）
    utterance.pitch = 1;

    // 创建 Promise 来处理异步发音
    return new Promise((resolve) => {
      utterance.onend = () => {
        resolve(null); // 发音成功
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        resolve(`Pronunciation failed: ${event.error}`);
      };

      // 开始发音
      window.speechSynthesis.speak(utterance);
    });
  } catch (error) {
    console.error('Pronunciation error:', error);
    return 'An unexpected error occurred while trying to pronounce.';
  }
}

/**
 * 停止当前正在播放的发音
 */
export function stopPronunciation(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * 检查浏览器是否支持语音合成
 * @returns boolean - 支持返回true，不支持返回false
 */
export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * 获取可用的中文语音列表
 * @returns Promise<SpeechSynthesisVoice[]> - 中文语音列表
 */
export async function getChineseVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const getVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const chineseVoices = voices.filter(
        (voice) =>
          voice.lang.startsWith('zh-') || voice.lang.startsWith('cmn-')
      );
      resolve(chineseVoices);
    };

    // 某些浏览器需要等待voices加载完成
    if (window.speechSynthesis.getVoices().length > 0) {
      getVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = getVoices;
    }
  });
}

