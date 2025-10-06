import { useEffect, useMemo, useRef, useState } from "react";
import type { MessageLine } from "@/types/slides";
import {
  TYPEWRITER_DELAY_MS,
  CLEAR_EFFECT_DURATION_MS,
  NEW_GROUP_DELAY_MS,
  SAME_GROUP_DELAY_MS,
} from "@/constants/typewriter";

interface UseTypewriterEffectProps {
  messages: MessageLine[];
  messageGroupId: string;
  showClearEffect: boolean;
  onTypingComplete?: () => void;
  startTypingSound: () => void;
  stopTypingSound: () => void;
}

/**
 * メッセージ表示のためのタイプライター効果を管理するカスタムフック
 * クリアエフェクトと音声統合を伴う文字単位のアニメーションを処理
 */
export function useTypewriterEffect({
  messages,
  messageGroupId,
  showClearEffect,
  onTypingComplete,
  startTypingSound,
  stopTypingSound,
}: UseTypewriterEffectProps) {
  const [visibleText, setVisibleText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const clearTimeoutRef = useRef<number | null>(null);
  const previousFullMessageRef = useRef<string>("");
  const previousGroupIdRef = useRef<string>("");

  const fullMessage = useMemo(
    () => messages.map((m) => m.text).join("\n"),
    [messages]
  );

  useEffect(() => {
    // 保留中のタイムアウトをクリア
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (clearTimeoutRef.current) {
      window.clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }

    const previousFullMessage = previousFullMessageRef.current;
    const previousGroupId = previousGroupIdRef.current;
    const isNewGroup = previousGroupId !== messageGroupId;

    // 空メッセージの処理
    if (!fullMessage) {
      setVisibleText("");
      setIsClearing(false);
      previousFullMessageRef.current = "";
      previousGroupIdRef.current = messageGroupId;
      setIsTyping(false);
      onTypingComplete?.();
      return;
    }

    let startIndex = 0;
    let shouldClearFirst = false;
    let shouldShowClearEffect = false;

    // コンテキストに基づいてタイピング動作を決定
    if (isNewGroup) {
      // 新しいグループ - クリアエフェクトが必要かチェック
      if (showClearEffect && previousFullMessage) {
        shouldShowClearEffect = true;
        shouldClearFirst = true;
      } else {
        shouldClearFirst = true;
      }
      setVisibleText("");
      previousFullMessageRef.current = "";
    } else if (
      previousFullMessage &&
      fullMessage.startsWith(previousFullMessage)
    ) {
      // 同じグループ内の前のメッセージの続き
      startIndex = previousFullMessage.length;
      setVisibleText(previousFullMessage);
    } else {
      // 同じグループ内の新しいメッセージ - まずクリアしてからタイピング開始
      if (showClearEffect && previousFullMessage) {
        shouldShowClearEffect = true;
      }
      shouldClearFirst = true;
      setVisibleText("");
    }

    previousFullMessageRef.current = fullMessage;
    previousGroupIdRef.current = messageGroupId;

    // タイピングがすでに完了しているかチェック
    if (startIndex >= fullMessage.length) {
      setVisibleText(fullMessage);
      setIsTyping(false);
      onTypingComplete?.();
      return;
    }

    let index = startIndex;
    setIsTyping(true);

    // タイピング音を開始
    startTypingSound();

    // 標準タイピングティック関数
    const tick = () => {
      index += 1;
      setVisibleText(fullMessage.slice(0, index));
      if (index < fullMessage.length) {
        timeoutRef.current = window.setTimeout(tick, TYPEWRITER_DELAY_MS);
      } else {
        timeoutRef.current = null;
        setIsTyping(false);
        stopTypingSound();
        onTypingComplete?.();
      }
    };

    // 異なるタイピングシナリオを処理
    if (shouldShowClearEffect) {
      // アニメーション付きクリアエフェクトを表示
      setIsClearing(true);
      setVisibleText("");

      clearTimeoutRef.current = window.setTimeout(() => {
        setIsClearing(false);
        setIsTyping(true);
        startTypingSound();

        // クリアエフェクト後にタイピング開始
        let currentIndex = 0;
        const typingTick = () => {
          currentIndex += 1;
          setVisibleText(fullMessage.slice(0, currentIndex));
          if (currentIndex < fullMessage.length) {
            timeoutRef.current = window.setTimeout(
              typingTick,
              TYPEWRITER_DELAY_MS
            );
          } else {
            timeoutRef.current = null;
            setIsTyping(false);
            stopTypingSound();
            onTypingComplete?.();
          }
        };
        typingTick();
      }, CLEAR_EFFECT_DURATION_MS);
    } else if (shouldClearFirst) {
      // 新しいメッセージ/グループの場合、まずクリアして短い遅延後に開始
      setVisibleText("");
      const delay = isNewGroup ? NEW_GROUP_DELAY_MS : SAME_GROUP_DELAY_MS;
      timeoutRef.current = window.setTimeout(() => {
        setIsTyping(true);
        startTypingSound();

        // 最初から開始
        let currentIndex = 0;
        const typingTick = () => {
          currentIndex += 1;
          setVisibleText(fullMessage.slice(0, currentIndex));
          if (currentIndex < fullMessage.length) {
            timeoutRef.current = window.setTimeout(
              typingTick,
              TYPEWRITER_DELAY_MS
            );
          } else {
            timeoutRef.current = null;
            setIsTyping(false);
            stopTypingSound();
            onTypingComplete?.();
          }
        };
        typingTick();
      }, delay);
    } else if (startIndex === 0) {
      tick();
    } else {
      timeoutRef.current = window.setTimeout(tick, TYPEWRITER_DELAY_MS);
    }

    // クリーンアップ関数
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (clearTimeoutRef.current) {
        window.clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }
      setIsTyping(false);
      setIsClearing(false);
      stopTypingSound();
    };
  }, [
    fullMessage,
    messageGroupId,
    showClearEffect,
    startTypingSound,
    stopTypingSound,
    onTypingComplete,
  ]);

  // 表示用のアニメーション行を計算
  const animatedLines = useMemo(() => {
    if (!fullMessage) {
      return [];
    }

    if (!visibleText) {
      return [""];
    }

    return visibleText.split("\n");
  }, [fullMessage, visibleText]);

  return {
    visibleText,
    isTyping,
    isClearing,
    animatedLines,
  };
}
