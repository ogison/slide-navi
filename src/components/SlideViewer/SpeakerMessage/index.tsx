import type { MessageLine } from "@/types/slides";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useTypewriterEffect } from "@/hooks/speakerMessage/useTypewriterEffect";
import { useSpeakerIconAnimation } from "@/hooks/speakerMessage/useSpeakerIconAnimation";
import SpeakerIcon from "./SpeakerIcon";
import MessageDisplay from "./MessageDisplay";
import styles from "./SpeakerMessage.module.scss";

type SpeakerMessageProps = {
  speakerName: string;
  messages: MessageLine[];
  messageGroupId: string;
  showClearEffect?: boolean;
  onTypingComplete?: () => void;
};

/**
 * Component to display speaker messages with typewriter effect
 * Includes speaker icon with animation and message text display
 */
export default function SpeakerMessage({
  speakerName,
  messages,
  messageGroupId,
  showClearEffect = false,
  onTypingComplete,
}: SpeakerMessageProps) {
  // Audio player integration
  const { startTypingSound, stopTypingSound } = useAudioPlayer();

  // Typewriter effect logic
  const { isTyping, isClearing, animatedLines } = useTypewriterEffect({
    messages,
    messageGroupId,
    showClearEffect,
    onTypingComplete,
    startTypingSound,
    stopTypingSound,
  });

  // Speaker icon animation
  const { iconSrc } = useSpeakerIconAnimation({
    isTyping,
    isClearing,
  });

  // Prepare lines for rendering
  const linesToRender = animatedLines.length
    ? animatedLines
    : messages.map((m) => m.text);

  console.log("Rendering SpeakerMessage with lines:", linesToRender);
  return (
    <div className={styles.messagePanel}>
      <div className={styles.messageCard}>
        <SpeakerIcon iconSrc={iconSrc} speakerName={speakerName} />
        <MessageDisplay lines={linesToRender} />
      </div>
    </div>
  );
}
