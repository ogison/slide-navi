import { ChangeEvent } from "react";
import type { SlideImage } from "../../types/slides";
import styles from "./ControlsPanel.module.scss";

type ControlsPanelProps = {
  onPdfUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onIconUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSpeakerNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onPageJump: (pageIndex: number) => void;
  speakerName: string;
  message: string;
  slides: SlideImage[];
  currentIndex: number;
  error: string | null;
};

export default function ControlsPanel({
  onPdfUpload,
  onIconUpload,
  onSpeakerNameChange,
  onMessageChange,
  onPageJump,
  speakerName,
  message,
  slides,
  currentIndex,
  error,
}: ControlsPanelProps) {
  const handleSpeakerChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSpeakerNameChange(event.target.value);
  };

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onMessageChange(event.target.value);
  };

  return (
    <aside className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>スライドの読み込み</h2>
        <p className={styles.sectionDescription}>
          PowerPointはPDFにエクスポートしてからアップロードします。
        </p>
        <label className={styles.fileDrop} htmlFor="pdf-upload">
          <span className={styles.fileDropPrimary}>PDFファイルを選択</span>
          <span className={styles.fileDropSecondary}>クリックして参照</span>
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
        <h2 className={styles.sectionTitle}>メッセージウインドウ</h2>
        <label className={styles.fieldLabel} htmlFor="speaker-name">
          話者名
        </label>
        <input
          id="speaker-name"
          type="text"
          value={speakerName}
          onChange={handleSpeakerChange}
          className={styles.textInput}
          placeholder="話者名を入力"
        />

        <label className={styles.fieldLabel} htmlFor="message-text">
          メッセージ
        </label>
        <textarea
          id="message-text"
          value={message}
          onChange={handleMessageChange}
          className={styles.textArea}
          rows={5}
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>アイコン画像</h2>
        <p className={styles.sectionDescription}>デフォルトでは doc/image.png を使用しています。</p>
        <label className={styles.fileDropSmall} htmlFor="icon-upload">
          <span className={styles.fileDropPrimary}>アイコンを差し替える</span>
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
                className={`${styles.pageButton} ${
                  index === currentIndex ? styles.pageButtonActive : ""
                }`}
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
