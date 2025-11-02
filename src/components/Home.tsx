"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HeaderSection from "../components/HeaderSection";
import SlideViewer from "./SlideViewer";
import ControlsPanel, {
  CONTROL_PANEL_TABS,
  type ControlsPanelTab,
} from "@/components/ControlPanel";
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

  // Determine the current audio mode.
  const audioMode: AudioMode = useMemo(() => {
    if (audioSettings.enabled) return "typewriter";
    if (speechSettings.enabled) return "speech";
    return "none";
  }, [audioSettings.enabled, speechSettings.enabled]);

  // Toggle audio integrations when the requested mode changes.
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
    [audioSettings.enabled, speechSettings.enabled, toggleAudio, toggleSpeech],
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
    scriptError,
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

  const [activeControlsTab, setActiveControlsTab] =
    useState<ControlsPanelTab | null>(null);

  const handleDockTabToggle = useCallback((tab: ControlsPanelTab) => {
    setActiveControlsTab((current) => (current === tab ? null : tab));
  }, []);

  const isControlsOpen = activeControlsTab !== null;

  const currentGroupIndex =
    slideScripts[currentIndex]?.messageGroups?.findIndex(
      (group) => group.id === messageGroupId,
    ) ?? 0;

  const currentSpeaker =
    slideScripts[currentIndex]?.messageGroups?.[currentGroupIndex]?.speaker ??
    "axolotl";

  const totalGroups = slideScripts[currentIndex]?.messageGroups?.length ?? 0;

  return (
    <div className={styles.page}>
      <HeaderSection />
      <main className={styles.main}>
        <div className={styles.viewerArea}>
          <SlideViewer
            currentSlide={currentSlide}
            totalPages={totalPages}
            currentIndex={currentIndex}
            documentName={documentName}
            isLoading={isLoading}
            speaker={currentSpeaker}
            messages={displayedMessages}
            slideTitle={currentTitle}
            messageGroupId={messageGroupId}
            onMessagePrev={handleMessagePrev}
            onMessageNext={handleMessageNext}
            currentGroupIndex={currentGroupIndex}
            totalGroups={totalGroups}
            showClearEffect={showClearEffect}
            onTypingComplete={handleTypingComplete}
            isAutoPlaying={isAutoPlaying}
            onAutoPlayToggle={handleAutoPlayToggle}
            slides={slides}
            onPageJump={jumpTo}
            audioMode={audioMode}
          />

          <aside
            className={`${styles.controlsOverlay} ${
              isControlsOpen ? styles.controlsOverlayVisible : ""
            }`}
            aria-hidden={!isControlsOpen}
            id="controls-panel-wrapper"
          >
            {activeControlsTab && (
              <ControlsPanel
                onPdfUpload={handlePdfUpload}
                onScriptChange={handleScriptChange}
                onAutoPlayDelayChange={handleAutoPlayDelayChange}
                script={scriptInput}
                autoPlayDelaySeconds={autoPlayDelaySeconds}
                totalPages={totalPages}
                error={error}
                scriptError={scriptError}
                slideScripts={slideScripts}
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
                activeTab={activeControlsTab}
              />
            )}
          </aside>

          <div
            className={styles.controlsDock}
            role="tablist"
            aria-label="コントロール切り替え"
          >
            {CONTROL_PANEL_TABS.map((tab) => {
              const isActive = activeControlsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={`${styles.controlsDockButton} ${
                    isActive ? styles.controlsDockButtonActive : ""
                  }`}
                  aria-selected={isActive}
                  aria-controls="controls-panel-wrapper"
                  aria-expanded={isActive}
                  onClick={() => handleDockTabToggle(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
