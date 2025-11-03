import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MessageGroup, SlideScript } from "@/types/slides";
import { playExplosionSound } from "@/utils/audioGenerator";

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
  const [activeAnimation, setActiveAnimation] =
    useState<MessageGroup["animation"]>();
  const lastExplosionKeyRef = useRef<string | null>(null);

  const currentMessageGroups = currentSlideScript.messageGroups;

  const updateActiveAnimation = useCallback(
    (groupIndex: number) => {
      setActiveAnimation(currentMessageGroups[groupIndex]?.animation);
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
      updateActiveAnimation(0);
      return;
    }
    setCurrentGroupIndex(0);
    updateActiveAnimation(0);
    setShowClearEffect(true);
  }, [
    isAutoPlaying,
    currentIndex,
    currentMessageGroups.length,
    updateActiveAnimation,
  ]);

  useEffect(() => {
    if (!isAutoPlaying) {
      onResetTyping();
    }
  }, [currentGroupIndex, isAutoPlaying, onResetTyping]);

  useEffect(() => {
    if (activeAnimation !== "explosion") {
      return;
    }

    const group = currentMessageGroups[currentGroupIndex];
    if (!group) {
      return;
    }

    const groupId =
      group.id ?? `slide-${currentIndex}-group-${currentGroupIndex}`;
    const explosionKey = `${currentIndex}-${groupId}`;

    if (lastExplosionKeyRef.current !== explosionKey) {
      playExplosionSound();
      lastExplosionKeyRef.current = explosionKey;
    }
  }, [activeAnimation, currentIndex, currentGroupIndex, currentMessageGroups]);

  useEffect(() => {
    if (activeAnimation !== "explosion") {
      lastExplosionKeyRef.current = null;
    }
  }, [activeAnimation]);

  const resetGroupState = useCallback(() => {
    setCurrentGroupIndex(0);
    setShowClearEffect(false);
    setActiveAnimation(undefined);
  }, []);

  const goToNextGroup = useCallback(() => {
    const totalGroups = currentMessageGroups.length;
    if (currentGroupIndex < totalGroups - 1) {
      const nextGroupIndex = currentGroupIndex + 1;
      updateActiveAnimation(nextGroupIndex);
      setCurrentGroupIndex(nextGroupIndex);
      return true;
    }
    return false;
  }, [currentGroupIndex, currentMessageGroups, updateActiveAnimation]);

  const goToPrevGroup = useCallback(() => {
    if (currentGroupIndex > 0) {
      const prevGroupIndex = currentGroupIndex - 1;
      updateActiveAnimation(prevGroupIndex);
      setCurrentGroupIndex(prevGroupIndex);
      return true;
    }
    return false;
  }, [currentGroupIndex, updateActiveAnimation]);

  const setGroupIndex = useCallback(
    (index: number) => {
      updateActiveAnimation(index);
      setCurrentGroupIndex(index);
    },
    [updateActiveAnimation],
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
    activeAnimation,
    resetGroupState,
    goToNextGroup,
    goToPrevGroup,
    setGroupIndex,
    getLastGroupIndex,
    setShowClearEffect,
  };
};
