import { useCallback, useEffect, useMemo, useState } from "react";
import type { SlideImage } from "@/types/slides";
import { createSlideScripts } from "@/utils/scriptParser";

export const useSlidePresentation = (slides: SlideImage[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scriptInput, setScriptInput] = useState<string>("");
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlayDelaySeconds, setAutoPlayDelaySeconds] = useState<number>(2);
  const [visibleMessageCount, setVisibleMessageCount] = useState<number | null>(
    null
  );
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(0);
  const [pendingSlideTransition, setPendingSlideTransition] =
    useState<boolean>(false);

  const totalPages = slides.length;
  const currentSlide = slides[currentIndex];

  const slideScripts = useMemo(() => {
    return createSlideScripts(scriptInput, totalPages);
  }, [scriptInput, totalPages]);

  const currentSlideScript = slideScripts[currentIndex] || {
    messages: [],
    messageGroups: [],
    transition: { type: "immediate" },
  };

  const currentMessages = currentSlideScript.messages;
  const currentMessageGroups = currentSlideScript.messageGroups;
  const currentTitle = currentSlideScript.title;

  const displayedMessages = useMemo(() => {
    if (visibleMessageCount === null) {
      return currentMessages;
    }

    // グループベースの表示制御
    if (currentMessageGroups.length > 0) {
      // グループインデックスが範囲内かチェック
      if (currentGroupIndex < currentMessageGroups.length) {
        const targetGroup = currentMessageGroups[currentGroupIndex];

        // Debug logging in development
        if (process.env.NODE_ENV === "development") {
          console.log("DisplayedMessages debug:", {
            slideIndex: currentIndex,
            groupIndex: currentGroupIndex,
            totalGroups: currentMessageGroups.length,
            targetGroupId: targetGroup?.id,
            targetMessages: targetGroup?.messages.map((m) => m.text),
            allGroups: currentMessageGroups.map((g) => ({
              id: g.id,
              messages: g.messages.map((m) => m.text),
            })),
          });
        }

        return targetGroup ? targetGroup.messages : [];
      } else {
        // グループインデックスが範囲外の場合は空配列を返す
        return [];
      }
    }

    return currentMessages.slice(
      0,
      Math.min(visibleMessageCount, currentMessages.length)
    );
  }, [
    currentMessages,
    currentMessageGroups,
    currentGroupIndex,
    visibleMessageCount,
    currentIndex,
  ]);

  // Reset state when switching slides manually or auto-play starts
  useEffect(() => {
    if (!isAutoPlaying) {
      setVisibleMessageCount(null);
      setCurrentGroupIndex(0);
      setPendingSlideTransition(false);
      return;
    }

    // 自動再生時は最初のメッセージグループから開始
    // スライド切り替え時やメッセージ変更時は強制的にリセット
    setCurrentGroupIndex(0);
    setPendingSlideTransition(false);
    setVisibleMessageCount(currentMessageGroups.length > 0 ? 1 : 0);
  }, [isAutoPlaying, currentIndex, currentMessageGroups.length]);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || !totalPages) {
      return;
    }

    const totalGroups = currentMessageGroups.length;

    const scheduleNextAction = () => {
      // スライド遷移が待機中の場合は、次のスライドに移動
      if (pendingSlideTransition) {
        setCurrentIndex((previous) => {
          if (previous >= totalPages - 1) {
            setIsAutoPlaying(false);
            return previous;
          }
          return previous + 1;
        });
        setPendingSlideTransition(false);
        return;
      }

      // グループが存在しない場合は次のスライドへ
      if (totalGroups === 0) {
        setPendingSlideTransition(true);
        return;
      }

      // 次のグループに移動、または次のスライドへの遷移を予約
      setCurrentGroupIndex((previous) => {
        if (previous >= totalGroups - 1) {
          // 最後のグループに達したら次のスライドへの遷移を予約
          setPendingSlideTransition(true);
          return 0;
        }
        return previous + 1;
      });
    };

    // Schedule next action
    const timer = window.setTimeout(
      scheduleNextAction,
      autoPlayDelaySeconds * 1000
    );

    return () => window.clearTimeout(timer);
  }, [
    isAutoPlaying,
    autoPlayDelaySeconds,
    totalPages,
    currentIndex,
    currentMessageGroups,
    currentGroupIndex,
    pendingSlideTransition,
  ]);

  const resetSlideState = useCallback(() => {
    setCurrentIndex(0);
    setVisibleMessageCount(null);
    setCurrentGroupIndex(0);
    setPendingSlideTransition(false);
    setIsAutoPlaying(false);
  }, []);

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const goTo = useCallback(
    (direction: -1 | 1) => {
      setCurrentIndex((previous) => {
        if (!totalPages) {
          return 0;
        }

        const nextIndex = previous + direction;

        if (nextIndex < 0) {
          return totalPages - 1;
        }

        if (nextIndex >= totalPages) {
          return 0;
        }

        return nextIndex;
      });
      // Force reset message display when changing slides
      setVisibleMessageCount(null);
      setCurrentGroupIndex(0);
      setPendingSlideTransition(false);
    },
    [totalPages]
  );

  const handlePrev = useCallback(() => {
    stopAutoPlay();
    goTo(-1);
  }, [goTo, stopAutoPlay]);

  const handleNext = useCallback(() => {
    stopAutoPlay();
    goTo(1);
  }, [goTo, stopAutoPlay]);

  const jumpTo = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalPages) {
        stopAutoPlay();
        setCurrentIndex(pageIndex);
        // Force reset message display when jumping to a slide
        setVisibleMessageCount(null);
        setCurrentGroupIndex(0);
        setPendingSlideTransition(false);
      }
    },
    [stopAutoPlay, totalPages]
  );

  const handleScriptChange = useCallback((value: string) => {
    setScriptInput(value);
  }, []);

  const handleAutoPlayToggle = useCallback(() => {
    if (!totalPages) {
      return;
    }

    setIsAutoPlaying((previous) => {
      const next = !previous;

      if (next) {
        // 自動再生開始時はメッセージを強制リセットしてから開始
        setCurrentGroupIndex(0);
        setPendingSlideTransition(false);
        setVisibleMessageCount(currentMessageGroups.length > 0 ? 1 : 0);
      } else {
        // 自動再生停止時は全メッセージを表示
        setVisibleMessageCount(null);
        setCurrentGroupIndex(0);
        setPendingSlideTransition(false);
      }

      return next;
    });
  }, [currentMessageGroups.length, totalPages]);

  const handleAutoPlayDelayChange = useCallback((value: number) => {
    setAutoPlayDelaySeconds(Math.max(1, Math.floor(value)));
  }, []);

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

    // Message group data for SlideViewer
    messageGroupId:
      currentMessageGroups[currentGroupIndex]?.id ||
      `slide-${currentIndex}-group-0`,

    // Handlers
    handlePrev,
    handleNext,
    jumpTo,
    handleScriptChange,
    handleAutoPlayToggle,
    handleAutoPlayDelayChange,
    resetSlideState,
  };
};