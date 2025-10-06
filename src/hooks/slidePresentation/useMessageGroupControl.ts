import { useCallback, useEffect, useMemo, useState } from "react";
import type { SlideScript } from "@/types/slides";

interface UseMessageGroupControlProps {
  currentIndex: number;
  currentSlideScript: SlideScript;
  isAutoPlaying: boolean;
  onResetTyping: () => void;
}

export const useMessageGroupControl = ({
  currentIndex,
  currentSlideScript,
  isAutoPlaying,
  onResetTyping,
}: UseMessageGroupControlProps) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(0);
  const [showClearEffect, setShowClearEffect] = useState<boolean>(false);

  const currentMessageGroups = currentSlideScript.messageGroups;

  const displayedMessages = useMemo(() => {
    // グループベースの表示制御
    if (currentGroupIndex < currentMessageGroups.length) {
      const targetGroup = currentMessageGroups[currentGroupIndex];

      return targetGroup ? targetGroup.messages : [];
    }

    // グループインデックスが範囲外の場合は空配列を返す
    return [];
  }, [currentMessageGroups, currentGroupIndex, currentIndex]);

  const messageGroupId =
    currentMessageGroups[currentGroupIndex]?.id ||
    `slide-${currentIndex}-group-0`;

  // Reset state when switching slides manually or auto-play starts
  useEffect(() => {
    if (!isAutoPlaying) {
      setCurrentGroupIndex(0);
      setShowClearEffect(false);
      return;
    }

    // 自動再生時は最初のメッセージグループから開始
    // スライド切り替え時やメッセージ変更時は強制的にリセット
    setCurrentGroupIndex(0);
    setShowClearEffect(true); // 自動再生時はクリア効果を有効にする
  }, [isAutoPlaying, currentIndex, currentMessageGroups.length]);

  // メッセージグループが変更されたときにタイプライター状態をリセット（手動操作時のみ）
  useEffect(() => {
    // 手動操作時のみタイプライター状態をリセット
    // 自動進行中はuseAutoPlayがタイプライター状態を管理する
    if (!isAutoPlaying) {
      onResetTyping();
    }
  }, [currentGroupIndex, isAutoPlaying, onResetTyping]);

  const resetGroupState = useCallback(() => {
    setCurrentGroupIndex(0);
    setShowClearEffect(false);
  }, []);

  const goToNextGroup = useCallback(() => {
    const totalGroups = currentMessageGroups.length;
    if (currentGroupIndex < totalGroups - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      return true;
    }
    return false;
  }, [currentGroupIndex, currentMessageGroups.length]);

  const goToPrevGroup = useCallback(() => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      return true;
    }
    return false;
  }, [currentGroupIndex]);

  const setGroupIndex = useCallback((index: number) => {
    setCurrentGroupIndex(index);
  }, []);

  const getLastGroupIndex = useCallback(() => {
    return Math.max(0, currentMessageGroups.length - 1);
  }, [currentMessageGroups.length]);

  return {
    currentGroupIndex,
    displayedMessages,
    messageGroupId,
    currentMessageGroups,
    showClearEffect,
    resetGroupState,
    goToNextGroup,
    goToPrevGroup,
    setGroupIndex,
    getLastGroupIndex,
    setShowClearEffect,
  };
};
