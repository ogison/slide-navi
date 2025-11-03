"use client";

import { useCallback, useState } from "react";
import HeaderSection from "./Header/HeaderSection";
import SlideViewer from "./SlideViewer";
import ControlsPanel, {
  CONTROL_PANEL_TABS,
  type ControlsPanelTab,
} from "@/components/ControlPanel";
import { usePdfUpload } from "@/hooks/usePdfUpload";
import { useSlidePresentation } from "@/hooks/useSlidePresentation";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import styles from "./Home.module.scss";

export default function Home() {
  // ===========================
  // PDF管理
  // ===========================
  const pdf = usePdfUpload();

  // ===========================
  // 音声システム (typewriter + speech統合)
  // ===========================
  const audio = useAudioSystem();

  // ===========================
  // スライドプレゼンテーション
  // ===========================
  const presentation = useSlidePresentation(pdf.slides);

  // ===========================
  // UI状態管理
  // ===========================
  const [activeControlsTab, setActiveControlsTab] =
    useState<ControlsPanelTab | null>(null);

  const handleDockTabToggle = useCallback((tab: ControlsPanelTab) => {
    setActiveControlsTab((current) => (current === tab ? null : tab));
  }, []);

  const isControlsOpen = activeControlsTab !== null;

  // ===========================
  // レンダリング
  // ===========================
  return (
    <div className={styles.page}>
      <HeaderSection />
      <main className={styles.main}>
        <div className={styles.viewerArea}>
          <SlideViewer
            currentSlide={presentation.currentSlide}
            totalPages={pdf.totalPages}
            currentIndex={presentation.currentIndex}
            documentName={pdf.documentName}
            isLoading={pdf.state.isLoading}
            speaker={presentation.currentSpeaker}
            messages={presentation.displayedMessages}
            slideTitle={presentation.currentTitle}
            messageGroupId={presentation.messageGroupId}
            onMessagePrev={presentation.handleMessagePrev}
            onMessageNext={presentation.handleMessageNext}
            currentGroupIndex={presentation.currentGroupIndex}
            totalGroups={presentation.totalGroups}
            showClearEffect={presentation.showClearEffect}
            showFightAnimation={presentation.showFightAnimation}
            onTypingComplete={presentation.handleTypingComplete}
            isAutoPlaying={presentation.isAutoPlaying}
            onAutoPlayToggle={presentation.handleAutoPlayToggle}
            slides={pdf.slides}
            onPageJump={presentation.jumpTo}
            audioMode={audio.audioMode}
            speakText={audio.speech.speak}
            stopSpeech={audio.speech.stop}
            isSpeaking={audio.speech.isSpeaking}
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
                onPdfUpload={pdf.actions.handlePdfUpload}
                onScriptChange={presentation.handleScriptChange}
                onAutoPlayDelayChange={presentation.handleAutoPlayDelayChange}
                script={presentation.scriptInput}
                autoPlayDelaySeconds={presentation.autoPlayDelaySeconds}
                totalPages={pdf.totalPages}
                error={pdf.state.error}
                scriptError={presentation.scriptError}
                slideScripts={presentation.slideScripts}
                audioMode={audio.audioMode}
                onAudioModeChange={audio.handleAudioModeChange}
                audioSettings={audio.typewriter.settings}
                onVolumeChange={audio.typewriter.setVolume}
                speechSettings={audio.speech.settings}
                onSpeechVolumeChange={audio.speech.setVolume}
                onSpeechRateChange={audio.speech.setRate}
                onSpeechVoiceChange={audio.speech.setVoiceName}
                availableVoices={audio.speech.availableVoices}
                isSpeechSupported={audio.speech.isSupported}
                getJapaneseVoices={audio.speech.getJapaneseVoices}
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
