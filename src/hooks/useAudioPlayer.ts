import { useCallback, useEffect, useRef, useState } from "react";
import {
  playTypewriterSound,
  cleanupAudioContext,
} from "@/utils/audioGenerator";

export type SoundType = "typewriter";

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  soundType: SoundType;
}

const STORAGE_KEY = "slide-navi-audio-settings";

/**
 * 音声再生機能を管理するカスタムフック
 */
export const useAudioPlayer = () => {
  // Hydrationエラー回避のため、初期値は常に固定のデフォルト値を使用
  const [settings, setSettings] = useState<AudioSettings>({
    enabled: true,
    volume: 0.3,
    soundType: "typewriter" as SoundType,
  });

  const isTypingRef = useRef<boolean>(false);
  const soundIntervalRef = useRef<number | null>(null);
  const maxSoundTimerRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // マウント後にローカルストレージから設定を読み込み
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);

        // 新形式からの移行処理（複雑な設定から簡単な設定へ）
        if (parsed.typewriterEnabled !== undefined) {
          setSettings({
            enabled: parsed.typewriterEnabled,
            volume: Math.max(0, Math.min(1, parsed.typewriterVolume ?? 0.3)),
            soundType: "typewriter" as SoundType,
          });
          return;
        }

        // 既存の設定形式
        setSettings({
          enabled: parsed.enabled ?? true,
          volume: Math.max(0, Math.min(1, parsed.volume ?? 0.3)),
          soundType: "typewriter" as SoundType,
        });
      }
    } catch (error) {
      console.warn("Failed to load audio settings:", error);
    }
  }, []);

  // 設定をローカルストレージに保存
  useEffect(() => {
    if (!isInitializedRef.current) return; // 初回読み込み時はスキップ

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save audio settings:", error);
    }
  }, [settings]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (soundIntervalRef.current) {
        window.clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
      if (maxSoundTimerRef.current) {
        window.clearTimeout(maxSoundTimerRef.current);
        maxSoundTimerRef.current = null;
      }
      cleanupAudioContext();
    };
  }, []);

  /**
   * 設定に応じた音声を再生
   */
  const playSound = useCallback(() => {
    if (settings.enabled && settings.volume > 0) {
      // 常にmessage-type.mp3を使用
      playTypewriterSound(settings.volume);
    }
  }, [settings.enabled, settings.volume]);

  /**
   * タイプライター効果の開始
   */
  const startTypingSound = useCallback(() => {
    if (!settings.enabled || isTypingRef.current) return;

    isTypingRef.current = true;

    // 最初の音を即座に再生
    playSound();

    // 300ms間隔で音を再生
    soundIntervalRef.current = window.setInterval(() => {
      if (isTypingRef.current) {
        playSound();
      }
    }, 300);

    // 2秒後に音声を自動停止（長いメッセージ対策）
    maxSoundTimerRef.current = window.setTimeout(() => {
      if (soundIntervalRef.current) {
        window.clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
      isTypingRef.current = false;
    }, 2000);
  }, [settings.enabled, playSound]);

  /**
   * タイプライター効果の停止
   */
  const stopTypingSound = useCallback(() => {
    if (soundIntervalRef.current) {
      window.clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    if (maxSoundTimerRef.current) {
      window.clearTimeout(maxSoundTimerRef.current);
      maxSoundTimerRef.current = null;
    }
    isTypingRef.current = false;
  }, []);

  /**
   * 音声有効/無効の切り替え
   */
  const toggleAudio = useCallback(() => {
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
   * 音声タイプ設定
   */
  const setSoundType = useCallback((soundType: SoundType) => {
    setSettings((prev) => ({ ...prev, soundType }));
  }, []);

  /**
   * 単発音の再生（完了音など）
   */
  const playSingleSound = useCallback(() => {
    if (settings.enabled) {
      playSound();
    }
  }, [settings.enabled, playSound]);

  return {
    settings,
    startTypingSound,
    stopTypingSound,
    playSingleSound,
    toggleAudio,
    setVolume,
    setSoundType,
  };
};
