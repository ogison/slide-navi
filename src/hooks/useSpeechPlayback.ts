import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechSynthesisSettings } from "./useSpeechSettings";

/**
 * Web Speech APIを使用した音声再生を管理するカスタムフック
 * 音声設定を引数として受け取り、再生制御のみを担当
 */
export const useSpeechPlayback = (settings: SpeechSynthesisSettings) => {
  // ブラウザがWeb Speech APIをサポートしているかチェック
  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 利用可能な音声のリストを取得
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
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
  }, [isSupported]);

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
    isSupported,
    isSpeaking,
    availableVoices,
    speak,
    stop,
    pause,
    resume,
    getJapaneseVoices,
  };
};
