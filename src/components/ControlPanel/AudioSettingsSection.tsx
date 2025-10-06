import { ChangeEvent } from "react";
import type { AudioSettings } from "@/hooks/useAudioPlayer";
import type { SpeechSynthesisSettings } from "@/hooks/useSpeechSynthesis";
import styles from "./ControlsPanel.module.scss";

export type AudioMode = "none" | "typewriter" | "speech";

type AudioSettingsSectionProps = {
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
};

export default function AudioSettingsSection({
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
}: AudioSettingsSectionProps) {
  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const volume = Number(event.target.value) / 100; // 0-100を0-1に変換
    onVolumeChange(volume);
  };

  const handleSpeechVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const volume = Number(event.target.value) / 100; // 0-100を0-1に変換
    onSpeechVolumeChange(volume);
  };

  const handleSpeechRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rate = Number(event.target.value) / 10; // 5-20を0.5-2.0に変換
    onSpeechRateChange(rate);
  };

  const handleVoiceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSpeechVoiceChange(event.target.value);
  };

  const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAudioModeChange(event.target.value as AudioMode);
  };

  // 日本語音声を優先してソート
  const sortedVoices = [...availableVoices].sort((a, b) => {
    const aIsJapanese = a.lang.startsWith("ja");
    const bIsJapanese = b.lang.startsWith("ja");
    if (aIsJapanese && !bIsJapanese) return -1;
    if (!aIsJapanese && bIsJapanese) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>音声設定</h2>

      <p className={styles.sectionDescription}>
        メッセージが流れる際の音声の設定です。
      </p>

      {/* モード選択 */}
      <div className={styles.audioModeSelection}>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            name="audioMode"
            value="none"
            checked={audioMode === "none"}
            onChange={handleModeChange}
            className={styles.radioInput}
          />
          <span className={styles.radioText}>🔇 なし</span>
        </label>

        <label className={styles.radioLabel}>
          <input
            type="radio"
            name="audioMode"
            value="typewriter"
            checked={audioMode === "typewriter"}
            onChange={handleModeChange}
            className={styles.radioInput}
          />
          <span className={styles.radioText}>🔊 タイプライター音</span>
        </label>

        {isSpeechSupported && (
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="audioMode"
              value="speech"
              checked={audioMode === "speech"}
              onChange={handleModeChange}
              className={styles.radioInput}
            />
            <span className={styles.radioText}>🗣️ 音声読み上げ</span>
          </label>
        )}
      </div>

      {/* タイプライター音の詳細設定 */}
      {audioMode === "typewriter" && (
        <div className={styles.audioControls}>
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
        </div>
      )}

      {/* 音声読み上げの詳細設定 */}
      {audioMode === "speech" && isSpeechSupported && (
        <div className={styles.audioControls}>
          <div className={styles.volumeInputGroup}>
            <label
              className={styles.fieldLabel}
              htmlFor="speech-volume-slider"
            >
              音量: {Math.round(speechSettings.volume * 100)}%
            </label>

            <input
              id="speech-volume-slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(speechSettings.volume * 100)}
              onChange={handleSpeechVolumeChange}
              className={styles.volumeSlider}
            />
          </div>

          <div className={styles.volumeInputGroup}>
            <label className={styles.fieldLabel} htmlFor="speech-rate-slider">
              速度: {speechSettings.rate.toFixed(1)}x
            </label>

            <input
              id="speech-rate-slider"
              type="range"
              min={5}
              max={20}
              value={speechSettings.rate * 10}
              onChange={handleSpeechRateChange}
              className={styles.volumeSlider}
            />
          </div>

          <div className={styles.volumeInputGroup}>
            <label className={styles.fieldLabel} htmlFor="voice-select">
              音声:
            </label>

            <select
              id="voice-select"
              value={speechSettings.voiceName || ""}
              onChange={handleVoiceChange}
              className={styles.voiceSelect}
            >
              <option value="">デフォルト</option>
              {sortedVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
