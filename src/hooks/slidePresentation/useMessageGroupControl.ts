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
  const [showFightAnimation, setShowFightAnimation] = useState<boolean>(false);

  const currentMessageGroups = currentSlideScript.messageGroups;

  const triggerFightAnimation = useCallback(
    (groupIndex: number) => {
      if (currentMessageGroups[groupIndex]?.animation === "fight") {
        setShowFightAnimation(true);
      } else {
        setShowFightAnimation(false);
      }
    },
    [currentMessageGroups],
  );

  const displayedMessages = useMemo(() => {
    if (currentGroupIndex < currentMessageGroups.length) {
      const targetGroup = currentMessageGroups[currentGroupIndex];
      return targetGroup ? targetGroup.messages : [];
    }
    return [];
  }, [currentMessageGroups, currentGroupIndex]);

  const messageGroupId =
    currentMessageGroups[currentGroupIndex]?.id ||
    `slide-${currentIndex}-group-0`;

  useEffect(() => {
    if (!isAutoPlaying) {
      setCurrentGroupIndex(0);
      setShowClearEffect(false);
      triggerFightAnimation(0);
      return;
    }
    setCurrentGroupIndex(0);
    triggerFightAnimation(0);
    setShowClearEffect(true);
  }, [
    isAutoPlaying,
    currentIndex,
    currentMessageGroups.length,
    triggerFightAnimation,
  ]);

  useEffect(() => {
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
      const nextGroupIndex = currentGroupIndex + 1;
      triggerFightAnimation(nextGroupIndex);
      setCurrentGroupIndex(nextGroupIndex);
      return true;
    }
    return false;
  }, [currentGroupIndex, currentMessageGroups, triggerFightAnimation]);

  const goToPrevGroup = useCallback(() => {
    if (currentGroupIndex > 0) {
      const prevGroupIndex = currentGroupIndex - 1;
      triggerFightAnimation(prevGroupIndex);
      setCurrentGroupIndex(prevGroupIndex);
      return true;
    }
    return false;
  }, [currentGroupIndex, triggerFightAnimation]);

  const setGroupIndex = useCallback(
    (index: number) => {
      triggerFightAnimation(index);
      setCurrentGroupIndex(index);
    },
    [triggerFightAnimation],
  );

  const getLastGroupIndex = useCallback(() => {
    return Math.max(0, currentMessageGroups.length - 1);
  }, [currentMessageGroups.length]);

  return {
    currentGroupIndex,
    displayedMessages,
    messageGroupId,
    currentMessageGroups,
    showClearEffect,
    showFightAnimation,
    resetGroupState,
    goToNextGroup,
    goToPrevGroup,
    setGroupIndex,
    getLastGroupIndex,
    setShowClearEffect,
  };
};
