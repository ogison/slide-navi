import { useCallback } from "react";
import { useSpeechSettings } from "./useSpeechSettings";
import { useSpeechPlayback } from "./useSpeechPlayback";

// 型定義を再エクスポート
export type { SpeechSynthesisSettings } from "./useSpeechSettings";

/**
 * Web Speech APIを使用した音声読み上げ機能を管理するカスタムフック
 *
 * このフックは互換性レイヤーとして機能し、useSpeechSettingsとuseSpeechPlaybackを
 * 統合したインターフェースを提供します。
 *
 * 新規実装では、useSpeechSettingsとuseSpeechPlaybackを直接使用することを推奨します。
 */
export const useSpeechSynthesis = () => {
  const {
    settings,
    updateSettings,
    toggleEnabled,
    setVolume,
    setRate,
    setPitch,
    setVoiceName,
  } = useSpeechSettings();

  const {
    isSupported,
    isSpeaking,
    availableVoices,
    speak,
    stop,
    pause,
    resume,
    getJapaneseVoices,
  } = useSpeechPlayback(settings);

  /**
   * 音声読み上げ有効/無効の切り替え
   * enabledをfalseにする場合は読み上げを停止
   */
  const toggleSpeech = useCallback(() => {
    if (settings.enabled && isSupported) {
      stop();
    }
    toggleEnabled();
  }, [settings.enabled, isSupported, stop, toggleEnabled]);

  /**
   * 音声設定（後方互換性のため）
   */
  const setVoice = useCallback(
    (voiceName: string) => {
      setVoiceName(voiceName);
    },
    [setVoiceName],
  );

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
    // 新しいAPI
    updateSettings,
    toggleEnabled,
    setVoiceName,
  };
};
