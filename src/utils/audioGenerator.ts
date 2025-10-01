/**
 * 音声ファイル（message-type.mp3）を使用したタイプライター音の再生ユーティリティ
 */

// 音声ファイルのキャッシュ
let audioCache: HTMLAudioElement | null = null;
let isAudioLoaded = false;

/**
 * 音声ファイルをプリロード
 */
const preloadAudio = (): void => {
  if (!audioCache && typeof window !== 'undefined') {
    audioCache = new Audio('/sounds/message-type.mp3');
    audioCache.preload = 'auto';

    // ロード完了時のハンドラ
    audioCache.addEventListener('canplaythrough', () => {
      isAudioLoaded = true;
    }, { once: true });

    // エラーハンドラ
    audioCache.addEventListener('error', (e) => {
      console.warn('Failed to load message-type.mp3:', e);
      isAudioLoaded = false;
    });
  }
};

// 初回アクセス時にプリロード
if (typeof window !== 'undefined') {
  preloadAudio();
}

/**
 * message-type.mp3を再生
 */
export const playTypewriterSound = (volume: number = 0.3): void => {
  try {
    // 音声ファイルがロードされていない場合はプリロード
    if (!audioCache || !isAudioLoaded) {
      preloadAudio();

      // 初回のみ、新しいインスタンスで即座に再生を試みる
      const audio = new Audio('/sounds/message-type.mp3');
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(err => {
        console.warn('Failed to play message-type.mp3:', err);
      });
      return;
    }

    // クローンを作成して複数の音を重ねて再生できるようにする
    const audioClone = audioCache.cloneNode() as HTMLAudioElement;
    audioClone.volume = Math.max(0, Math.min(1, volume));

    // 再生終了後にメモリを解放
    audioClone.addEventListener('ended', () => {
      audioClone.remove();
    });

    audioClone.play().catch(err => {
      console.warn('Failed to play message-type.mp3:', err);
    });
  } catch (error) {
    console.warn('Failed to play typewriter sound:', error);
  }
};

/**
 * あつまれどうぶつの森風の音（互換性のため残す）
 * 実際にはmessage-type.mp3を再生
 */
export const playAnimalCrossingSound = (volume: number = 0.3): void => {
  playTypewriterSound(volume);
};

/**
 * 音声リソースをクリーンアップ
 */
export const cleanupAudioContext = (): void => {
  if (audioCache) {
    audioCache.pause();
    audioCache.src = '';
    audioCache = null;
    isAudioLoaded = false;
  }
};