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
 * 音声合成の設定を管理するカスタムフック
 * localStorageへの永続化と設定値の検証を担当
 */
export const useSpeechSettings = () => {
  // Hydrationエラー回避のため、初期値は常に固定のデフォルト値を使用
  const [settings, setSettings] = useState<SpeechSynthesisSettings>(() => {
    if (typeof window === "undefined") {
      // SSR環境ではlocalStorageが存在しない
      return {
        enabled: false,
        volume: 1.0,
        rate: 1.0,
        pitch: 1.0,
        voiceName: null,
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          enabled: parsed.enabled ?? false,
          volume: Math.max(0, Math.min(1, parsed.volume ?? 1.0)),
          rate: Math.max(0.5, Math.min(2.0, parsed.rate ?? 1.0)),
          pitch: Math.max(0.5, Math.min(2.0, parsed.pitch ?? 1.0)),
          voiceName: parsed.voiceName ?? null,
        };
      }
    } catch (error) {
      console.warn("Failed to load speech synthesis settings:", error);
    }

    // デフォルト設定
    return {
      enabled: false,
      volume: 1.0,
      rate: 1.0,
      pitch: 1.0,
      voiceName: null,
    };
  });

  const isInitializedRef = useRef<boolean>(false);

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
   * 設定を部分的に更新
   */
  const updateSettings = useCallback(
    (updates: Partial<SpeechSynthesisSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  /**
   * 音声読み上げ有効/無効の切り替え
   */
  const toggleEnabled = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

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
  const setVoiceName = useCallback((voiceName: string | null) => {
    setSettings((prev) => ({ ...prev, voiceName }));
  }, []);

  return {
    settings,
    updateSettings,
    toggleEnabled,
    setVolume,
    setRate,
    setPitch,
    setVoiceName,
  };
};
