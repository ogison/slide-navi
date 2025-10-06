import { ChangeEvent } from "react";
import type { AudioSettings } from "@/hooks/useAudioPlayer";
import styles from "./ControlsPanel.module.scss";

type AudioSettingsSectionProps = {
  audioSettings: AudioSettings;
  onAudioToggle: () => void;
  onVolumeChange: (volume: number) => void;
};

export default function AudioSettingsSection({
  audioSettings,
  onAudioToggle,
  onVolumeChange,
}: AudioSettingsSectionProps) {
  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const volume = Number(event.target.value) / 100; // 0-100を0-1に変換
    onVolumeChange(volume);
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>音声設定</h2>

      <p className={styles.sectionDescription}>
        メッセージが流れる際のキャラクター音声の設定です。
      </p>

      <div className={styles.audioControls}>
        <button
          type="button"
          className={`${styles.audioToggleButton} ${audioSettings.enabled ? styles.audioToggleButtonActive : ""}`}
          onClick={onAudioToggle}
        >
          {audioSettings.enabled ? "🔊 音声ON" : "🔇 音声OFF"}
        </button>

        {audioSettings.enabled && (
          <div className={styles.volumeInputGroup}>
            <label className={styles.fieldLabel} htmlFor="volume-slider">
              音量: {Math.round(audioSettings.volume * 100)}%
            </label>

            <input
              id="volume-slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(audioSettings.volume * 100)}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
            />
          </div>
        )}
      </div>
    </div>
  );
}
