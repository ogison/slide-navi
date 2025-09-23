"use client";

import { useEffect } from "react";
import HeaderSection from "../components/HeaderSection";
import SlideViewer from "../components/SlideViewer";
import ControlsPanel from "@/components/ControlsPanel";
import { usePdfUpload } from "@/hooks/usePdfUpload";
import { useIconUpload } from "@/hooks/useIconUpload";
import { useSlidePresentation } from "@/hooks/useSlidePresentation";
import { SCRIPT_PLACEHOLDER } from "@/constants";
import styles from "./Home.module.scss";

export default function Home() {
  const {
    slides,
    documentName,
    isLoading,
    error: pdfError,
    handlePdfUpload,
    totalPages
  } = usePdfUpload();

  const {
    iconSrc,
    handleIconUpload,
    error: iconError
  } = useIconUpload();

  const {
    currentIndex,
    scriptInput,
    isAutoPlaying,
    autoPlayDelaySeconds,
    currentSlide,
    currentTitle,
    displayedMessages,
    messageGroupId,
    handlePrev,
    handleNext,
    handleMessagePrev,
    handleMessageNext,
    jumpTo,
    handleScriptChange,
    handleAutoPlayToggle,
    handleAutoPlayDelayChange,
    resetSlideState,
    slideScripts,
    showClearEffect,
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

  const error = pdfError || iconError;

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
          speakerName="Dr. Hikari"
          iconSrc={iconSrc}
          messages={displayedMessages}
          slideTitle={currentTitle}
          messageGroupId={messageGroupId}
          onPrev={handlePrev}
          onNext={handleNext}
          onMessagePrev={handleMessagePrev}
          onMessageNext={handleMessageNext}
          currentGroupIndex={slideScripts[currentIndex]?.messageGroups ? slideScripts[currentIndex].messageGroups.findIndex(group => group.id === messageGroupId) : 0}
          totalGroups={slideScripts[currentIndex]?.messageGroups?.length || 0}
          showClearEffect={showClearEffect}
        />
        <ControlsPanel
          onPdfUpload={handlePdfUpload}
          onIconUpload={handleIconUpload}
          onScriptChange={handleScriptChange}
          onPageJump={jumpTo}
          onAutoPlayToggle={handleAutoPlayToggle}
          onAutoPlayDelayChange={handleAutoPlayDelayChange}
          script={scriptInput}
          slides={slides}
          currentIndex={currentIndex}
          isAutoPlaying={isAutoPlaying}
          autoPlayDelaySeconds={autoPlayDelaySeconds}
          totalPages={totalPages}
          error={error}
        />
      </main>
    </div>
  );
}
