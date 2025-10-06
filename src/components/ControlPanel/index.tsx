import { ChangeEvent } from "react";

import type { SlideImage } from "../../types/slides";
import type { AudioSettings } from "@/hooks/useAudioPlayer";

import styles from "./ControlsPanel.module.scss";
import PdfUploadSection from "./PdfUploadSection";
import ScriptEditorSection from "./ScriptEditorSection";
import AutoPlaySection from "./AutoPlaySection";
import AudioSettingsSection from "./AudioSettingsSection";
import PageJumpSection from "./PageJumpSection";

type ControlsPanelProps = {
  onPdfUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onScriptChange: (value: string) => void;
  onPageJump: (pageIndex: number) => void;
  onAutoPlayToggle: () => void;
  onAutoPlayDelayChange: (seconds: number) => void;
  script: string;
  slides: SlideImage[];
  currentIndex: number;
  isAutoPlaying: boolean;
  autoPlayDelaySeconds: number;
  totalPages: number;
  error: string | null;
  audioSettings: AudioSettings;
  onAudioToggle: () => void;
  onVolumeChange: (volume: number) => void;
};

export default function ControlsPanel({
  onPdfUpload,
  onScriptChange,
  onPageJump,
  onAutoPlayToggle,
  onAutoPlayDelayChange,
  script,
  slides,
  currentIndex,
  isAutoPlaying,
  autoPlayDelaySeconds,
  totalPages,
  error,
  audioSettings,
  onAudioToggle,
  onVolumeChange,
}: ControlsPanelProps) {
  const hasSlides = totalPages > 0;

  return (
    <aside className={styles.container}>
      <PdfUploadSection onPdfUpload={onPdfUpload} />

      <ScriptEditorSection
        script={script}
        onScriptChange={onScriptChange}
        totalPages={totalPages}
        hasSlides={hasSlides}
      />

      <AutoPlaySection
        autoPlayDelaySeconds={autoPlayDelaySeconds}
        onAutoPlayDelayChange={onAutoPlayDelayChange}
        totalPages={totalPages}
      />

      <AudioSettingsSection
        audioSettings={audioSettings}
        onAudioToggle={onAudioToggle}
        onVolumeChange={onVolumeChange}
      />

      <PageJumpSection
        slides={slides}
        currentIndex={currentIndex}
        onPageJump={onPageJump}
      />

      {error && <div className={styles.error}>{error}</div>}
    </aside>
  );
}
