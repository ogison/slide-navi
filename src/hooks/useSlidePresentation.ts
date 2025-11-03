import { useCallback, useEffect, useState } from "react";
import type { SlideImage } from "@/types/slides";
import { useScriptManager } from "./slidePresentation/useScriptManager";
import { useTypingState } from "./slidePresentation/useTypingState";
import { useSlideNavigation } from "./slidePresentation/useSlideNavigation";
import { useMessageGroupControl } from "./slidePresentation/useMessageGroupControl";
import { useAutoPlay } from "./slidePresentation/useAutoPlay";
import { SCRIPT_PLACEHOLDER } from "@/constants";

export const useSlidePresentation = (slides: SlideImage[]) => {
  const totalPages = slides.length;

  // Auto-play state (managed here to avoid circular dependency)
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Script management
  const {
    scriptInput,
    slideScripts,
    parseError: scriptError,
    handleScriptChange,
  } = useScriptManager(totalPages);

  // Typing state
  const {
    isTypingComplete,
    handleTypingComplete,
    resetTypingState,
    setTypingComplete,
  } = useTypingState();

  // Slide navigation
  const {
    currentIndex,
    setCurrentIndex,
    jumpTo: navJumpTo,
    resetIndex,
  } = useSlideNavigation({
    totalPages,
    onSlideChange: () => {
      // Will be set up after message group control is initialized
    },
  });

  const currentSlide = slides[currentIndex];
  const currentSlideScript = slideScripts[currentIndex] || {
    messageGroups: [],
    transition: { type: "immediate" as const },
  };
  const currentTitle = currentSlideScript.title;

  // Message group control (single instance with correct isAutoPlaying)
  const {
    currentGroupIndex,
    currentMessageGroups,
    displayedMessages,
    messageGroupId,
    showClearEffect,
    showFightAnimation,
    resetGroupState,
    goToNextGroup,
    goToPrevGroup,
    setGroupIndex,
    setShowClearEffect,
  } = useMessageGroupControl({
    currentIndex,
    currentSlideScript,
    isAutoPlaying,
    onResetTyping: resetTypingState,
  });

  // Auto-play
  const {
    autoPlayDelaySeconds,
    handleAutoPlayToggle,
    handleAutoPlayDelayChange,
    stopAutoPlay,
    setPendingSlideTransition,
  } = useAutoPlay({
    totalPages,
    currentIndex,
    isTypingComplete,
    totalGroups: currentMessageGroups.length,
    currentGroupIndex,
    isAutoPlaying,
    setIsAutoPlaying,
    onNextSlide: () => {
      setCurrentIndex((prev) => prev + 1);
    },
    onNextGroup: goToNextGroup,
    onResetTyping: resetTypingState,
    onSetTypingComplete: setTypingComplete,
  });

  const handleMessagePrev = useCallback(() => {
    stopAutoPlay();

    // 現在のスライドに前のメッセージがある場合
    if (goToPrevGroup()) {
      setTypingComplete(true);
      return;
    }

    // 前のスライドがある場合、前のスライドの最後のメッセージに移動
    if (currentIndex > 0) {
      const prevSlideScript = slideScripts[currentIndex - 1];
      const prevSlideLastGroupIndex = Math.max(
        0,
        prevSlideScript.messageGroups.length - 1,
      );

      setCurrentIndex(currentIndex - 1);
      setGroupIndex(prevSlideLastGroupIndex);
      setPendingSlideTransition(false);
      setShowClearEffect(false);
      setTypingComplete(true);
    }
  }, [
    stopAutoPlay,
    goToPrevGroup,
    currentIndex,
    slideScripts,
    setCurrentIndex,
    setGroupIndex,
    setPendingSlideTransition,
    setShowClearEffect,
    setTypingComplete,
  ]);

  const handleMessageNext = useCallback(() => {
    stopAutoPlay();

    // 現在のスライドに次のメッセージがある場合
    if (goToNextGroup()) {
      setTypingComplete(true);
      return;
    }

    // 次のスライドがある場合、次のスライドの最初のメッセージに移動
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1);
      setGroupIndex(0);
      setPendingSlideTransition(false);
      setShowClearEffect(false);
      setTypingComplete(true);
    }
  }, [
    stopAutoPlay,
    goToNextGroup,
    currentIndex,
    totalPages,
    setCurrentIndex,
    setGroupIndex,
    setPendingSlideTransition,
    setShowClearEffect,
    setTypingComplete,
  ]);

  const jumpTo = useCallback(
    (pageIndex: number) => {
      stopAutoPlay();
      navJumpTo(pageIndex);
      resetGroupState();
      setTypingComplete(true);
    },
    [stopAutoPlay, navJumpTo, resetGroupState, setTypingComplete],
  );

  const resetSlideState = useCallback(() => {
    resetIndex();
    resetGroupState();
    stopAutoPlay();
    setTypingComplete(true);
  }, [resetIndex, resetGroupState, stopAutoPlay, setTypingComplete]);

  // 派生状態: 現在のグループのスピーカー情報
  const currentSpeaker =
    currentMessageGroups[currentGroupIndex]?.speaker ?? "axolotl";

  // 派生状態: 現在のスライドのグループ数
  const totalGroups = currentMessageGroups.length;

  // Initialize script placeholder when slides are loaded for the first time
  useEffect(() => {
    if (slides.length > 0 && !scriptInput.trim()) {
      handleScriptChange(SCRIPT_PLACEHOLDER);
    }
  }, [slides.length, scriptInput, handleScriptChange]);

  // Reset slide state when new PDF is loaded
  useEffect(() => {
    if (slides.length > 0) {
      resetSlideState();
    }
  }, [slides.length, resetSlideState]);

  return {
    // State
    currentIndex,
    scriptInput,
    isAutoPlaying,
    autoPlayDelaySeconds,
    currentSlide,
    currentTitle,
    displayedMessages,
    totalPages,
    slideScripts,
    scriptError,
    showClearEffect,
    showFightAnimation,

    // Message group data for SlideViewer
    messageGroupId,

    // Derived state (派生状態)
    currentGroupIndex,
    currentSpeaker,
    totalGroups,

    // Handlers
    handleMessagePrev,
    handleMessageNext,
    jumpTo,
    handleScriptChange,
    handleAutoPlayToggle,
    handleAutoPlayDelayChange,
    resetSlideState,
    handleTypingComplete,
  };
};
