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
  playSingleSound: () => void;
}

/**
 * Custom hook to manage typewriter effect for displaying messages
 * Handles character-by-character animation with clear effects and audio integration
 */
export function useTypewriterEffect({
  messages,
  messageGroupId,
  showClearEffect,
  onTypingComplete,
  startTypingSound,
  stopTypingSound,
  playSingleSound,
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
    // Clear any pending timeouts
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

    // Handle empty message
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

    // Determine typing behavior based on context
    if (isNewGroup) {
      // New group - check if we need clear effect
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
      // Continuation of previous message in same group
      startIndex = previousFullMessage.length;
      setVisibleText(previousFullMessage);
    } else {
      // New message within same group - clear first, then start typing
      if (showClearEffect && previousFullMessage) {
        shouldShowClearEffect = true;
      }
      shouldClearFirst = true;
      setVisibleText("");
    }

    previousFullMessageRef.current = fullMessage;
    previousGroupIdRef.current = messageGroupId;

    // Check if typing is already complete
    if (startIndex >= fullMessage.length) {
      setVisibleText(fullMessage);
      setIsTyping(false);
      onTypingComplete?.();
      return;
    }

    let index = startIndex;
    setIsTyping(true);

    // Start typing sound
    startTypingSound();

    // Standard typing tick function
    const tick = () => {
      index += 1;
      setVisibleText(fullMessage.slice(0, index));
      if (index < fullMessage.length) {
        timeoutRef.current = window.setTimeout(tick, TYPEWRITER_DELAY_MS);
      } else {
        timeoutRef.current = null;
        setIsTyping(false);
        stopTypingSound();
        playSingleSound();
        onTypingComplete?.();
      }
    };

    // Handle different typing scenarios
    if (shouldShowClearEffect) {
      // Show clear effect with animation
      setIsClearing(true);
      setVisibleText("");

      clearTimeoutRef.current = window.setTimeout(() => {
        setIsClearing(false);
        setIsTyping(true);
        startTypingSound();

        // Start typing after clear effect
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
            playSingleSound();
            onTypingComplete?.();
          }
        };
        typingTick();
      }, CLEAR_EFFECT_DURATION_MS);
    } else if (shouldClearFirst) {
      // For new messages/groups, clear first then start after a brief delay
      setVisibleText("");
      const delay = isNewGroup ? NEW_GROUP_DELAY_MS : SAME_GROUP_DELAY_MS;
      timeoutRef.current = window.setTimeout(() => {
        setIsTyping(true);
        startTypingSound();

        // Start from beginning
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
            playSingleSound();
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

    // Cleanup function
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
    playSingleSound,
    onTypingComplete,
  ]);

  // Calculate animated lines for display
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
