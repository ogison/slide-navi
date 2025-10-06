import { ChangeEvent } from "react";

import type { AudioSettings } from "@/hooks/useAudioPlayer";

import styles from "./ControlsPanel.module.scss";
import PdfUploadSection from "./PdfUploadSection";
import ScriptEditorSection from "./ScriptEditorSection";
import AutoPlaySection from "./AutoPlaySection";
import AudioSettingsSection from "./AudioSettingsSection";

type ControlsPanelProps = {
  onPdfUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onScriptChange: (value: string) => void;
  onAutoPlayToggle: () => void;
  onAutoPlayDelayChange: (seconds: number) => void;
  script: string;
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
  onAutoPlayToggle,
  onAutoPlayDelayChange,
  script,
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

      {error && <div className={styles.error}>{error}</div>}
    </aside>
  );
}
