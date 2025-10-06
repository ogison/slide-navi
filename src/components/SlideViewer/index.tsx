import type { SlideImage, MessageLine } from "../../types/slides";
import styles from "./SlideViewer.module.scss";
import SlideViewerHeader from "./SlideViewerHeader";
import SlideDisplay from "./SlideDisplay";
import SpeakerMessage from "./SpeakerMessage";

type SlideViewerProps = {
  currentSlide?: SlideImage;
  totalPages: number;
  currentIndex: number;
  documentName: string;
  isLoading: boolean;
  speakerName: string;
  messages: MessageLine[];
  slideTitle?: string;
  messageGroupId: string;
  onMessagePrev: () => void;
  onMessageNext: () => void;
  currentGroupIndex: number;
  totalGroups: number;
  showClearEffect?: boolean;
  onTypingComplete?: () => void;
  isAutoPlaying: boolean;
  onAutoPlayToggle: () => void;
};

export default function SlideViewer({
  currentSlide,
  totalPages,
  currentIndex,
  documentName,
  isLoading,
  speakerName,
  messages,
  slideTitle,
  messageGroupId,
  onMessagePrev,
  onMessageNext,
  currentGroupIndex,
  totalGroups,
  showClearEffect = false,
  onTypingComplete,
  isAutoPlaying,
  onAutoPlayToggle,
}: SlideViewerProps) {
  return (
    <section className={styles.container}>
      <SlideViewerHeader
        documentName={documentName}
        currentIndex={currentIndex}
        totalPages={totalPages}
        slideTitle={slideTitle}
        isLoading={isLoading}
        isAutoPlaying={isAutoPlaying}
        onAutoPlayToggle={onAutoPlayToggle}
        onMessagePrev={onMessagePrev}
        onMessageNext={onMessageNext}
        currentGroupIndex={currentGroupIndex}
        totalGroups={totalGroups}
      />

      <SlideDisplay currentSlide={currentSlide} isLoading={isLoading} />

      <SpeakerMessage
        speakerName={speakerName}
        messages={messages}
        messageGroupId={messageGroupId}
        showClearEffect={showClearEffect}
        onTypingComplete={onTypingComplete}
      />
    </section>
  );
}
