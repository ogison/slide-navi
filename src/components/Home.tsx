"use client";

import { useCallback, useEffect, useMemo } from "react";
import HeaderSection from "../components/HeaderSection";
import SlideViewer from "./SlideViewer";
import ControlsPanel from "@/components/ControlPanel";
import type { AudioMode } from "@/components/ControlPanel/AudioSettingsSection";
import { usePdfUpload } from "@/hooks/usePdfUpload";
import { useSlidePresentation } from "@/hooks/useSlidePresentation";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
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
    settings: speechSettings,
    isSupported: isSpeechSupported,
    availableVoices,
    toggleSpeech,
    setVolume: setSpeechVolume,
    setRate: setSpeechRate,
    setVoice: setSpeechVoice,
  } = useSpeechSynthesis();

  // 現在の音声モードを計算
  const audioMode: AudioMode = useMemo(() => {
    if (audioSettings.enabled) return "typewriter";
    if (speechSettings.enabled) return "speech";
    return "none";
  }, [audioSettings.enabled, speechSettings.enabled]);

  // 音声モード変更ハンドラー
  const handleAudioModeChange = useCallback(
    (mode: AudioMode) => {
      switch (mode) {
        case "typewriter":
          if (!audioSettings.enabled) toggleAudio();
          if (speechSettings.enabled) toggleSpeech();
          break;
        case "speech":
          if (audioSettings.enabled) toggleAudio();
          if (!speechSettings.enabled) toggleSpeech();
          break;
        case "none":
          if (audioSettings.enabled) toggleAudio();
          if (speechSettings.enabled) toggleSpeech();
          break;
      }
    },
    [
      audioSettings.enabled,
      speechSettings.enabled,
      toggleAudio,
      toggleSpeech,
    ]
  );

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
          audioMode={audioMode}
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
          audioMode={audioMode}
          onAudioModeChange={handleAudioModeChange}
          audioSettings={audioSettings}
          onVolumeChange={setVolume}
          speechSettings={speechSettings}
          onSpeechVolumeChange={setSpeechVolume}
          onSpeechRateChange={setSpeechRate}
          onSpeechVoiceChange={setSpeechVoice}
          availableVoices={availableVoices}
          isSpeechSupported={isSpeechSupported}
        />
      </main>
    </div>
  );
}
