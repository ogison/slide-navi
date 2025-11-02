import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeechSynthesisSettings {
  enabled: boolean;
  volume: number; // 0-1
  rate: number; // 0.5-2.0
  pitch: number; // 0.5-2.0
  voiceName: string | null;
}

const STORAGE_KEY = "slide-navi-speech-settings";

/**
 * Web Speech APIを使用した音声読み上げ機能を管理するカスタムフック
 */
export const useSpeechSynthesis = () => {
  // Hydrationエラー回避のため、初期値は常に固定のデフォルト値を使用
  const [settings, setSettings] = useState<SpeechSynthesisSettings>({
    enabled: false,
    volume: 1.0,
    rate: 1.0,
    pitch: 1.0,
    voiceName: null,
  });

  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // ブラウザがWeb Speech APIをサポートしているかチェック
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  // 利用可能な音声のリストを取得
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // 日本語音声がデフォルト音声として設定されていない場合、自動選択
      if (voices.length > 0 && !settings.voiceName) {
        const japaneseVoice = voices.find((voice) =>
          voice.lang.startsWith("ja"),
        );
        if (japaneseVoice) {
          setSettings((prev) => ({ ...prev, voiceName: japaneseVoice.name }));
        }
      }
    };

    loadVoices();

    // 一部のブラウザでは音声リストの読み込みに時間がかかる
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported, settings.voiceName]);

  // マウント後にローカルストレージから設定を読み込み
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({
          enabled: parsed.enabled ?? false,
          volume: Math.max(0, Math.min(1, parsed.volume ?? 1.0)),
          rate: Math.max(0.5, Math.min(2.0, parsed.rate ?? 1.0)),
          pitch: Math.max(0.5, Math.min(2.0, parsed.pitch ?? 1.0)),
          voiceName: parsed.voiceName ?? null,
        });
      }
    } catch (error) {
      console.warn("Failed to load speech synthesis settings:", error);
    }
  }, []);

  // 設定をローカルストレージに保存
  useEffect(() => {
    if (!isInitializedRef.current) return; // 初回読み込み時はスキップ

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save speech synthesis settings:", error);
    }
  }, [settings]);

  /**
   * テキストを音声で読み上げる
   */
  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !settings.enabled || !text.trim()) {
        return;
      }

      // 既存の読み上げを停止
      window.speechSynthesis.cancel();

      // 新しい読み上げを作成
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = settings.volume;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;

      // 指定された音声を設定
      if (settings.voiceName) {
        const voice = availableVoices.find(
          (v) => v.name === settings.voiceName,
        );
        if (voice) {
          utterance.voice = voice;
        }
      }

      // イベントハンドラを設定
      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, settings, availableVoices],
  );

  /**
   * 読み上げを停止
   */
  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, [isSupported]);

  /**
   * 読み上げを一時停止
   */
  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
  }, [isSupported]);

  /**
   * 読み上げを再開
   */
  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
  }, [isSupported]);

  /**
   * 音声読み上げ有効/無効の切り替え
   */
  const toggleSpeech = useCallback(() => {
    setSettings((prev) => {
      const newEnabled = !prev.enabled;
      // 無効にする場合は読み上げを停止
      if (!newEnabled && isSupported) {
        window.speechSynthesis.cancel();
      }
      return { ...prev, enabled: newEnabled };
    });
  }, [isSupported]);

  /**
   * 音量設定
   */
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setSettings((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  /**
   * 読み上げ速度設定
   */
  const setRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2.0, rate));
    setSettings((prev) => ({ ...prev, rate: clampedRate }));
  }, []);

  /**
   * ピッチ設定
   */
  const setPitch = useCallback((pitch: number) => {
    const clampedPitch = Math.max(0.5, Math.min(2.0, pitch));
    setSettings((prev) => ({ ...prev, pitch: clampedPitch }));
  }, []);

  /**
   * 音声設定
   */
  const setVoice = useCallback((voiceName: string) => {
    setSettings((prev) => ({ ...prev, voiceName }));
  }, []);

  /**
   * 日本語音声のリストを取得（優先表示用）
   */
  const getJapaneseVoices = useCallback(() => {
    return availableVoices.filter((voice) => voice.lang.startsWith("ja"));
  }, [availableVoices]);

  // 音声状態の定期監視（onendイベントの遅延対策）
  useEffect(() => {
    if (!isSupported || !isSpeaking) return;

    // 50msごとに実際の音声状態をチェック（より素早く完了を検出）
    const checkInterval = setInterval(() => {
      const actualSpeaking = window.speechSynthesis.speaking;
      if (!actualSpeaking) {
        setIsSpeaking(false);
      }
    }, 50);

    return () => clearInterval(checkInterval);
  }, [isSupported, isSpeaking]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    settings,
    isSupported,
    isSpeaking,
    availableVoices,
    speak,
    stop,
    pause,
    resume,
    toggleSpeech,
    setVolume,
    setRate,
    setPitch,
    setVoice,
    getJapaneseVoices,
  };
};
