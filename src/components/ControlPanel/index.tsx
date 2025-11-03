import { ChangeEvent } from "react";

import type { AudioSettings } from "@/hooks/useAudioPlayer";
import type { SpeechSynthesisSettings } from "@/hooks/useSpeechSettings";
import type { AudioMode } from "./AudioSettingsSection";
import type { SlideScript } from "@/types/slides";

import styles from "./ControlsPanel.module.scss";
import PdfUploadSection from "./PdfUploadSection";
import ScriptEditorSection from "./ScriptEditorSection";
import AutoPlaySection from "./AutoPlaySection";
import AudioSettingsSection from "./AudioSettingsSection";
import FormattedScriptView from "./FormattedScriptView";

export type ControlsPanelTab =
  | "upload"
  | "script"
  | "preview"
  | "playback"
  | "audio";

export const CONTROL_PANEL_TABS: ReadonlyArray<{
  id: ControlsPanelTab;
  label: string;
}> = [
  { id: "upload", label: "PDF" },
  { id: "script", label: "編集" },
  { id: "preview", label: "プレビュー" },
  { id: "playback", label: "オートプレイ" },
  { id: "audio", label: "音声" },
];

type ControlsPanelProps = {
  onPdfUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onScriptChange: (value: string) => void;
  onAutoPlayDelayChange: (seconds: number) => void;
  script: string;
  autoPlayDelaySeconds: number;
  totalPages: number;
  error: string | null;
  scriptError: string | null;
  slideScripts: SlideScript[];
  audioMode: AudioMode;
  onAudioModeChange: (mode: AudioMode) => void;
  audioSettings: AudioSettings;
  onVolumeChange: (volume: number) => void;
  speechSettings: SpeechSynthesisSettings;
  onSpeechVolumeChange: (volume: number) => void;
  onSpeechRateChange: (rate: number) => void;
  onSpeechVoiceChange: (voiceName: string) => void;
  availableVoices: SpeechSynthesisVoice[];
  isSpeechSupported: boolean;
  getJapaneseVoices: () => SpeechSynthesisVoice[];
  activeTab: ControlsPanelTab;
};

export default function ControlsPanel({
  onPdfUpload,
  onScriptChange,
  onAutoPlayDelayChange,
  script,
  autoPlayDelaySeconds,
  totalPages,
  error,
  scriptError,
  slideScripts,
  audioMode,
  onAudioModeChange,
  audioSettings,
  onVolumeChange,
  speechSettings,
  onSpeechVolumeChange,
  onSpeechRateChange,
  onSpeechVoiceChange,
  availableVoices,
  isSpeechSupported,
  getJapaneseVoices,
  activeTab,
}: ControlsPanelProps) {
  const hasSlides = totalPages > 0;

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <>
            <PdfUploadSection onPdfUpload={onPdfUpload} />
            {error && <div className={styles.error}>{error}</div>}
          </>
        );
      case "script":
        return (
          <ScriptEditorSection
            script={script}
            onScriptChange={onScriptChange}
            totalPages={totalPages}
            hasSlides={hasSlides}
            error={scriptError}
          />
        );
      case "preview":
        return <FormattedScriptView slideScripts={slideScripts} />;
      case "playback":
        return (
          <AutoPlaySection
            autoPlayDelaySeconds={autoPlayDelaySeconds}
            onAutoPlayDelayChange={onAutoPlayDelayChange}
            totalPages={totalPages}
          />
        );
      case "audio":
        return (
          <AudioSettingsSection
            audioMode={audioMode}
            onAudioModeChange={onAudioModeChange}
            audioSettings={audioSettings}
            onVolumeChange={onVolumeChange}
            speechSettings={speechSettings}
            onSpeechVolumeChange={onSpeechVolumeChange}
            onSpeechRateChange={onSpeechRateChange}
            onSpeechVoiceChange={onSpeechVoiceChange}
            availableVoices={availableVoices}
            isSpeechSupported={isSpeechSupported}
            getJapaneseVoices={getJapaneseVoices}
          />
        );
      default:
        return null;
    }
  };

  return (
    <aside
      className={styles.container}
      role="region"
      aria-label="コントロールパネル"
    >
      {renderContent()}
    </aside>
  );
}
