import type { SlideImage, MessageLine } from "../../types/slides";
import type { AudioMode } from "@/components/ControlPanel/AudioSettingsSection";
import styles from "./SlideViewer.module.scss";
import SlideViewerHeader from "./SlideViewerHeader";
import SlideDisplay from "./SlideDisplay";
import SpeakerMessage from "./SpeakerMessage";
import PageJumpSection from "./PageJumpSection";

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
  slides: SlideImage[];
  onPageJump: (pageIndex: number) => void;
  audioMode: AudioMode;
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
  slides,
  onPageJump,
  audioMode,
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
        audioMode={audioMode}
        isAutoPlaying={isAutoPlaying}
      />

      <PageJumpSection
        slides={slides}
        currentIndex={currentIndex}
        onPageJump={onPageJump}
      />
    </section>
  );
}
