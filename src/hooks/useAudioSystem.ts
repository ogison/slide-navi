import { useCallback, useMemo } from "react";
import { useAudioPlayer } from "./useAudioPlayer";
import { useSpeechSettings } from "./useSpeechSettings";
import { useSpeechPlayback } from "./useSpeechPlayback";

export type AudioMode = "typewriter" | "speech" | "none";

/**
 * 音声システム全体を統合管理するカスタムフック
 * タイプライター音声と音声合成の両方を管理し、排他的な動作を保証する
 */
export const useAudioSystem = () => {
  // タイプライター音声
  const audioPlayer = useAudioPlayer();

  // 音声合成設定
  const speechSettings = useSpeechSettings();

  // 音声合成再生
  const speechPlayback = useSpeechPlayback(speechSettings.settings);

  /**
   * 現在の音声モードを決定
   */
  const audioMode: AudioMode = useMemo(() => {
    if (audioPlayer.settings.enabled) return "typewriter";
    if (speechSettings.settings.enabled) return "speech";
    return "none";
  }, [audioPlayer.settings.enabled, speechSettings.settings.enabled]);

  /**
   * 音声モード変更ハンドラ（排他的な動作を保証）
   */
  const handleAudioModeChange = useCallback(
    (mode: AudioMode) => {
      switch (mode) {
        case "typewriter":
          if (!audioPlayer.settings.enabled) audioPlayer.toggleAudio();
          if (speechSettings.settings.enabled) speechSettings.toggleEnabled();
          break;
        case "speech":
          if (audioPlayer.settings.enabled) audioPlayer.toggleAudio();
          if (!speechSettings.settings.enabled) speechSettings.toggleEnabled();
          break;
        case "none":
          if (audioPlayer.settings.enabled) audioPlayer.toggleAudio();
          if (speechSettings.settings.enabled) speechSettings.toggleEnabled();
          break;
      }
    },
    [audioPlayer, speechSettings],
  );

  return {
    // 現在のモード
    audioMode,

    // タイプライター音声（グループ化）
    typewriter: {
      settings: audioPlayer.settings,
      toggleAudio: audioPlayer.toggleAudio,
      setVolume: audioPlayer.setVolume,
      setSoundType: audioPlayer.setSoundType,
      startTypingSound: audioPlayer.startTypingSound,
      stopTypingSound: audioPlayer.stopTypingSound,
    },

    // 音声合成（グループ化）
    speech: {
      settings: speechSettings.settings,
      isSupported: speechPlayback.isSupported,
      isSpeaking: speechPlayback.isSpeaking,
      availableVoices: speechPlayback.availableVoices,
      toggleEnabled: speechSettings.toggleEnabled,
      setVolume: speechSettings.setVolume,
      setRate: speechSettings.setRate,
      setPitch: speechSettings.setPitch,
      setVoiceName: speechSettings.setVoiceName,
      speak: speechPlayback.speak,
      stop: speechPlayback.stop,
      pause: speechPlayback.pause,
      resume: speechPlayback.resume,
      getJapaneseVoices: speechPlayback.getJapaneseVoices,
    },

    // モード変更ハンドラ
    handleAudioModeChange,
  };
};
