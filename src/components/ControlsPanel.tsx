import { ChangeEvent } from "react";

import type { SlideImage } from "../types/slides";
import type { AudioSettings } from "@/hooks/useAudioPlayer";

import styles from "./ControlsPanel.module.scss";
import { SCRIPT_PLACEHOLDER } from "@/constants";

type ControlsPanelProps = {
  onPdfUpload: (event: ChangeEvent<HTMLInputElement>) => void;

  onIconUpload: (event: ChangeEvent<HTMLInputElement>) => void;

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

  // 音声設定関連
  audioSettings: AudioSettings;
  onAudioToggle: () => void;
  onVolumeChange: (volume: number) => void;
};

export default function ControlsPanel({
  onPdfUpload,

  onIconUpload,

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
  const handleScriptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onScriptChange(event.target.value);
  };

  const handleDelayChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);

    if (Number.isNaN(nextValue)) {
      return;
    }

    const sanitizedValue = Math.max(1, Math.floor(nextValue));
    onAutoPlayDelayChange(sanitizedValue);
  };

  const handleDelayIncrease = () => {
    const nextValue = Math.min(autoPlayDelaySeconds + 1, 60);
    onAutoPlayDelayChange(nextValue);
  };

  const handleDelayDecrease = () => {
    const nextValue = Math.max(autoPlayDelaySeconds - 1, 1);
    onAutoPlayDelayChange(nextValue);
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const volume = Number(event.target.value) / 100; // 0-100を0-1に変換
    onVolumeChange(volume);
  };


  const isAutoPlayDisabled = totalPages <= 1;
  const hasSlides = totalPages > 0;
  const isScriptInputDisabled = !hasSlides;

  return (
    <aside className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>スライドの読み込み</h2>

        <p className={styles.sectionDescription}>
          PowerPointはPDFに書き出してからアップロードしてください。
        </p>

        <label className={styles.fileDrop} htmlFor="pdf-upload">
          <span className={styles.fileDropPrimary}>PDFファイルを選択</span>

          <span className={styles.fileDropSecondary}>クリックして開く</span>

          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className={styles.fileInput}
            onChange={onPdfUpload}
          />
        </label>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>メッセージウィンドウ</h2>

        <label className={styles.fieldLabel} htmlFor="script-text">
          台本
          {hasSlides ? `（全${totalPages}ページ）` : ""}
        </label>

        <textarea
          id="script-text"
          value={script}
          onChange={handleScriptChange}
          className={styles.textArea}
          rows={8}
          placeholder={SCRIPT_PLACEHOLDER}
          disabled={isScriptInputDisabled}
        />

        <p className={styles.sectionDescription}>
          {hasSlides
            ? "# で始まる行でスライドを区切ります。改行でメッセージを区切ります。"
            : "PDFをアップロードすると、# で区切った台本を入力できます。"}
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>自動進行</h2>

        <p className={styles.sectionDescription}>
          台本の各メッセージを順番に表示し、最後のメッセージでページを進めます。
          最終ページで自動停止します。
        </p>

        <div className={styles.autoPlayControls}>
          <button
            type="button"
            className={`${styles.autoPlayButton} ${isAutoPlaying ? styles.autoPlayButtonActive : ""}`}
            onClick={onAutoPlayToggle}
            disabled={isAutoPlayDisabled}
          >
            {isAutoPlaying ? "自動進行を停止" : "自動進行を開始"}
          </button>

          <div className={styles.autoPlayInputGroup}>
            <label className={styles.fieldLabel} htmlFor="autoplay-interval">
              メッセージ間隔（秒）
            </label>

            <div className={styles.numberInputWithArrows}>
              <button
                type="button"
                className={styles.arrowButton}
                onClick={handleDelayDecrease}
                disabled={totalPages === 0 || autoPlayDelaySeconds <= 1}
                aria-label="間隔を1秒減らす"
              >
                -
              </button>

              <input
                id="autoplay-interval"
                type="number"
                min={1}
                max={60}
                value={autoPlayDelaySeconds}
                onChange={handleDelayChange}
                className={styles.numberInput}
                disabled={totalPages === 0}
              />

              <button
                type="button"
                className={styles.arrowButton}
                onClick={handleDelayIncrease}
                disabled={totalPages === 0 || autoPlayDelaySeconds >= 60}
                aria-label="間隔を1秒増やす"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {/* 将来的に実装 */}
      {/* <div className={styles.section}>
        <h2 className={styles.sectionTitle}>アイコン画像</h2>

        <p className={styles.sectionDescription}>
          話者のアイコン画像を設定できます。
        </p>

        <label className={styles.fileDropSmall} htmlFor="icon-upload">
          <span className={styles.fileDropPrimary}>
            アイコン画像を差し替える
          </span>

          <input
            id="icon-upload"
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={onIconUpload}
          />
        </label>
      </div> */}

      {slides.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ページジャンプ</h2>

          <div className={styles.pageButtons}>
            {slides.map((slide, index) => (
              <button
                key={slide.pageNumber}
                type="button"
                className={`${styles.pageButton} ${index === currentIndex ? styles.pageButtonActive : ""}`}
                onClick={() => onPageJump(index)}
              >
                {slide.pageNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </aside>
  );
}
