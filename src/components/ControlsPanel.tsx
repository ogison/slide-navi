import { ChangeEvent } from "react";

import type { SlideImage } from "../types/slides";

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
            ? "空白行でスライドを区切ります。# で見出しを指定。"
            : "PDFをアップロードすると、空白行で区切った台本を入力できます。"}
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

            <input
              id="autoplay-interval"
              type="number"
              min={1}
              value={autoPlayDelaySeconds}
              onChange={handleDelayChange}
              className={styles.numberInput}
              disabled={totalPages === 0}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
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
      </div>

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
