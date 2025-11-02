import { useCallback, useEffect, useState } from "react";

interface UseAutoPlayProps {
  totalPages: number;
  currentIndex: number;
  isTypingComplete: boolean;
  totalGroups: number;
  currentGroupIndex: number;
  isAutoPlaying: boolean;
  setIsAutoPlaying: (value: boolean) => void;
  onNextSlide: () => void;
  onNextGroup: () => boolean;
  onResetTyping: () => void;
  onSetTypingComplete: (complete: boolean) => void;
}

export const useAutoPlay = ({
  totalPages,
  currentIndex,
  isTypingComplete,
  totalGroups,
  currentGroupIndex,
  isAutoPlaying,
  setIsAutoPlaying,
  onNextSlide,
  onNextGroup,
  onResetTyping,
  onSetTypingComplete,
}: UseAutoPlayProps) => {
  const [autoPlayDelaySeconds, setAutoPlayDelaySeconds] = useState<number>(2);
  const [pendingSlideTransition, setPendingSlideTransition] =
    useState<boolean>(false);

  // Reset pending transition when slides change
  useEffect(() => {
    setPendingSlideTransition(false);
  }, [currentIndex]);

  // Auto-play logic - タイプライター完了後に待機時間を開始
  useEffect(() => {
    if (!isAutoPlaying || !totalPages) {
      return;
    }

    // タイプライター実行中は次のアクションを実行しない
    if (!isTypingComplete) {
      return;
    }

    const scheduleNextAction = () => {
      // スライド遷移が待機中の場合は、次のスライドに移動
      if (pendingSlideTransition) {
        if (currentIndex >= totalPages - 1) {
          setIsAutoPlaying(false);
          return;
        }
        // スライド遷移直前にタイプライター状態をリセット
        onResetTyping();
        onNextSlide();
        setPendingSlideTransition(false);
        return;
      }

      // グループが存在しない場合は次のスライドへ
      if (totalGroups === 0) {
        setPendingSlideTransition(true);
        return;
      }

      // 次のグループに移動、または次のスライドへの遷移を予約
      const hasNextGroup = onNextGroup();
      if (!hasNextGroup) {
        // 最後のグループに達したら次のスライドへの遷移を予約
        setPendingSlideTransition(true);
      } else {
        // グループ遷移が成功した場合、タイプライター状態をリセット
        onResetTyping();
      }
    };

    // Schedule next action - タイプライター完了後にディレイを開始
    const timer = window.setTimeout(
      scheduleNextAction,
      autoPlayDelaySeconds * 1000,
    );

    return () => window.clearTimeout(timer);
  }, [
    isAutoPlaying,
    autoPlayDelaySeconds,
    totalPages,
    currentIndex,
    totalGroups,
    currentGroupIndex,
    pendingSlideTransition,
    isTypingComplete,
    setIsAutoPlaying,
    onNextSlide,
    onNextGroup,
    onResetTyping,
  ]);

  const handleAutoPlayToggle = useCallback(() => {
    if (!totalPages) {
      return;
    }

    const next = !isAutoPlaying;

    if (next) {
      // 自動再生開始時
      setPendingSlideTransition(false);
      onResetTyping(); // タイプライター開始のため未完了に設定
    } else {
      // 自動再生停止時
      setPendingSlideTransition(false);
      onSetTypingComplete(true);
    }

    setIsAutoPlaying(next);
  }, [
    totalPages,
    isAutoPlaying,
    setIsAutoPlaying,
    onResetTyping,
    onSetTypingComplete,
  ]);

  const handleAutoPlayDelayChange = useCallback((value: number) => {
    setAutoPlayDelaySeconds(Math.max(1, Math.floor(value)));
  }, []);

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    setPendingSlideTransition(false);
    onSetTypingComplete(true);
  }, [setIsAutoPlaying, onSetTypingComplete]);

  return {
    autoPlayDelaySeconds,
    pendingSlideTransition,
    handleAutoPlayToggle,
    handleAutoPlayDelayChange,
    stopAutoPlay,
    setPendingSlideTransition,
  };
};
