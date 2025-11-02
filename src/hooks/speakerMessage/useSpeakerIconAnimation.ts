import { useEffect, useRef, useState } from "react";
import { ICON_ANIMATION_INTERVAL_MS } from "@/constants/typewriter";

interface UseSpeakerIconAnimationProps {
  isTyping: boolean;
  isClearing: boolean;
  isSpeaking: boolean;
  baseIcon: string;
  talkingIcon: string;
}

/**
 * Custom hook to manage speaker icon animation during typing/clearing
 * Alternates between two icons at regular intervals while active
 */
export function useSpeakerIconAnimation({
  isTyping,
  isClearing,
  isSpeaking,
  baseIcon,
  talkingIcon,
}: UseSpeakerIconAnimationProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const iconIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (iconIntervalRef.current) {
      window.clearInterval(iconIntervalRef.current);
      iconIntervalRef.current = null;
    }

    if (isTyping || isClearing || isSpeaking) {
      // Start icon animation
      iconIntervalRef.current = window.setInterval(() => {
        setCurrentIconIndex((prev) => (prev === 0 ? 1 : 0));
      }, ICON_ANIMATION_INTERVAL_MS);
    } else {
      // Reset to default icon
      setCurrentIconIndex(0);
    }

    return () => {
      if (iconIntervalRef.current) {
        window.clearInterval(iconIntervalRef.current);
        iconIntervalRef.current = null;
      }
    };
  }, [isTyping, isClearing, isSpeaking]);

  const iconSrc =
    isTyping || isClearing || isSpeaking
      ? currentIconIndex === 0
        ? baseIcon
        : talkingIcon
      : baseIcon;

  return { iconSrc };
}
