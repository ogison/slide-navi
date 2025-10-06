"use client";

import { useEffect } from "react";
import HeaderSection from "../components/HeaderSection";
import SlideViewer from "./SlideViewer";
import ControlsPanel from "@/components/ControlPanel";
import { usePdfUpload } from "@/hooks/usePdfUpload";
import { useSlidePresentation } from "@/hooks/useSlidePresentation";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { SCRIPT_PLACEHOLDER } from "@/constants";
import styles from "./Home.module.scss";

export default function Home() {
  const {
    slides,
    documentName,
    isLoading,
    error: pdfError,
    handlePdfUpload,
    totalPages,
  } = usePdfUpload();

  const { settings: audioSettings, toggleAudio, setVolume } = useAudioPlayer();

  const {
    currentIndex,
    scriptInput,
    isAutoPlaying,
    autoPlayDelaySeconds,
    currentSlide,
    currentTitle,
    displayedMessages,
    messageGroupId,
    handleMessagePrev,
    handleMessageNext,
    jumpTo,
    handleScriptChange,
    handleAutoPlayToggle,
    handleAutoPlayDelayChange,
    resetSlideState,
    slideScripts,
    showClearEffect,
    handleTypingComplete,
  } = useSlidePresentation(slides);

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

  const error = pdfError;

  return (
    <div className={styles.page}>
      <HeaderSection />
      <main className={styles.main}>
        <SlideViewer
          currentSlide={currentSlide}
          totalPages={totalPages}
          currentIndex={currentIndex}
          documentName={documentName}
          isLoading={isLoading}
          speakerName="ウーパー君"
          messages={displayedMessages}
          slideTitle={currentTitle}
          messageGroupId={messageGroupId}
          onMessagePrev={handleMessagePrev}
          onMessageNext={handleMessageNext}
          currentGroupIndex={
            slideScripts[currentIndex]?.messageGroups
              ? slideScripts[currentIndex].messageGroups.findIndex(
                  (group) => group.id === messageGroupId
                )
              : 0
          }
          totalGroups={slideScripts[currentIndex]?.messageGroups?.length || 0}
          showClearEffect={showClearEffect}
          onTypingComplete={handleTypingComplete}
          isAutoPlaying={isAutoPlaying}
          onAutoPlayToggle={handleAutoPlayToggle}
          slides={slides}
          onPageJump={jumpTo}
        />
        <ControlsPanel
          onPdfUpload={handlePdfUpload}
          onScriptChange={handleScriptChange}
          onAutoPlayToggle={handleAutoPlayToggle}
          onAutoPlayDelayChange={handleAutoPlayDelayChange}
          script={scriptInput}
          isAutoPlaying={isAutoPlaying}
          autoPlayDelaySeconds={autoPlayDelaySeconds}
          totalPages={totalPages}
          error={error}
          audioSettings={audioSettings}
          onAudioToggle={toggleAudio}
          onVolumeChange={setVolume}
        />
      </main>
    </div>
  );
}
