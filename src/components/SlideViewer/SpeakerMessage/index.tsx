import { useCallback, useEffect, useMemo, useRef } from "react";
import type { MessageLine } from "@/types/slides";
import type { AudioMode } from "@/components/ControlPanel/AudioSettingsSection";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useTypewriterEffect } from "@/hooks/speakerMessage/useTypewriterEffect";
import { useSpeakerIconAnimation } from "@/hooks/speakerMessage/useSpeakerIconAnimation";
import SpeakerIcon from "./SpeakerIcon";
import MessageDisplay from "./MessageDisplay";
import styles from "./SpeakerMessage.module.scss";

type SpeakerMessageProps = {
  speakerName: string;
  messages: MessageLine[];
  messageGroupId: string;
  showClearEffect?: boolean;
  onTypingComplete?: () => void;
  audioMode: AudioMode;
  isAutoPlaying: boolean;
};

/**
 * Component to display speaker messages with typewriter effect
 * Includes speaker icon with animation and message text display
 */
export default function SpeakerMessage({
  speakerName,
  messages,
  messageGroupId,
  showClearEffect = false,
  onTypingComplete,
  audioMode,
  isAutoPlaying,
}: SpeakerMessageProps) {
  // Audio player integration (typewriter sound)
  const { startTypingSound, stopTypingSound } = useAudioPlayer();

  // Speech synthesis integration (text-to-speech)
  const { speak, stop: stopSpeech, isSpeaking } = useSpeechSynthesis();

  // 前回のaudioModeを保存（audioMode変更検出用）
  const prevAudioModeRef = useRef<AudioMode>(audioMode);

  // 前回のisSpeakingを保存（音声読み上げ完了検出用）
  const prevIsSpeakingRef = useRef<boolean>(false);

  // ダミー関数（何もしない）
  const noopStartSound = useCallback(() => {}, []);
  const noopStopSound = useCallback(() => {}, []);
  const noopTypingComplete = useCallback(() => {}, []);

  // タイプライターモードの場合のみ実際の音声関数を使用
  const effectiveStartSound =
    audioMode === "typewriter" ? startTypingSound : noopStartSound;
  const effectiveStopSound =
    audioMode === "typewriter" ? stopTypingSound : noopStopSound;

  // 音声読み上げモードの場合、タイプライター完了コールバックを無効化
  // （音声読み上げ完了時に別途呼び出すため）
  const effectiveTypingComplete =
    audioMode === "speech" ? noopTypingComplete : onTypingComplete;

  // Typewriter effect logic
  const { isTyping, isClearing, animatedLines } = useTypewriterEffect({
    messages,
    messageGroupId,
    showClearEffect,
    onTypingComplete: effectiveTypingComplete,
    startTypingSound: effectiveStartSound,
    stopTypingSound: effectiveStopSound,
    disabled: audioMode === "speech",
  });

  // メッセージの全文を取得
  const fullMessage = useMemo(
    () => messages.map((m) => m.text).join("\n"),
    [messages]
  );

  // 音声モードが変更されたときに既存の音声を停止
  useEffect(() => {
    // audioModeが実際に変更された場合のみ処理を実行
    if (prevAudioModeRef.current === audioMode) {
      return;
    }

    prevAudioModeRef.current = audioMode;

    // 既存の全ての音声を停止
    stopTypingSound();
    stopSpeech();

    // タイプライターモードに切り替えた場合、タイピング中なら音声を開始
    if (audioMode === "typewriter" && isTyping) {
      startTypingSound();
    }
    // 音声読み上げモードの場合、メッセージグループ変更時のeffectで開始される
  }, [audioMode, stopTypingSound, stopSpeech, isTyping, startTypingSound]);

  // メッセージグループが変わったときに音声読み上げを開始
  useEffect(() => {
    // 音声読み上げモードの場合のみ実行
    // showClearEffectは無視（タイプライター効果が無効化されているため）
    if (audioMode === "speech" && fullMessage) {
      // 少し遅延させて音声読み上げを開始（停止処理の後に）
      const timeoutId = setTimeout(() => {
        speak(fullMessage);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [audioMode, messageGroupId, fullMessage, speak, isAutoPlaying]);

  // クリアエフェクトが開始されたときに音声を停止
  useEffect(() => {
    if (isClearing) {
      stopSpeech();
    }
  }, [isClearing, stopSpeech]);

  // 音声読み上げモードの場合、読み上げ完了時にonTypingCompleteを呼び出す
  useEffect(() => {
    if (audioMode !== "speech") {
      prevIsSpeakingRef.current = isSpeaking;
      return;
    }

    // 音声読み上げが完了したとき（trueからfalseになったとき）
    if (prevIsSpeakingRef.current && !isSpeaking) {
      onTypingComplete?.();
    }

    prevIsSpeakingRef.current = isSpeaking;
  }, [audioMode, isSpeaking, onTypingComplete]);

  // Speaker icon animation
  const { iconSrc } = useSpeakerIconAnimation({
    isTyping,
    isClearing,
    isSpeaking,
  });

  // Prepare lines for rendering
  const linesToRender = animatedLines.length
    ? animatedLines
    : messages.map((m) => m.text);

  return (
    <div className={styles.messagePanel}>
      <div className={styles.messageCard}>
        <SpeakerIcon iconSrc={iconSrc} speakerName={speakerName} />
        <MessageDisplay lines={linesToRender} />
      </div>
    </div>
  );
}
