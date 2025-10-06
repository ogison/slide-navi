import { useEffect, useRef, useState } from "react";
import { ICON_ANIMATION_INTERVAL_MS } from "@/constants/typewriter";

const SPEAKER_ICON_DEFAULT = "/speaker.png";
const SPEAKER_ICON_ALTERNATE = "/speaker_2.png";

interface UseSpeakerIconAnimationProps {
  isTyping: boolean;
  isClearing: boolean;
  isSpeaking: boolean;
}

/**
 * Custom hook to manage speaker icon animation during typing/clearing
 * Alternates between two icons at regular intervals while active
 */
export function useSpeakerIconAnimation({
  isTyping,
  isClearing,
  isSpeaking,
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
        ? SPEAKER_ICON_DEFAULT
        : SPEAKER_ICON_ALTERNATE
      : SPEAKER_ICON_DEFAULT;

  return { iconSrc };
}
