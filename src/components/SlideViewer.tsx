/* eslint-disable @next/next/no-img-element */

import type { SlideImage } from "../types/slides";
import styles from "./SlideViewer.module.scss";

type SlideViewerProps = {
  currentSlide?: SlideImage;
  totalPages: number;
  currentIndex: number;
  documentName: string;
  isLoading: boolean;
  speakerName: string;
  iconSrc: string;
  messageLines: string[];
  onPrev: () => void;
  onNext: () => void;
};

export default function SlideViewer({
  currentSlide,
  totalPages,
  currentIndex,
  documentName,
  isLoading,
  speakerName,
  iconSrc,
  messageLines,
  onPrev,
  onNext,
}: SlideViewerProps) {
  return (
    <section className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.documentInfo}>
          <p className={styles.statusLabel}>現在のスライド</p>
          <p className={styles.fileName}>{documentName}</p>
          {totalPages > 0 && (
            <p className={styles.pageCount}>
              {currentIndex + 1} / {totalPages} ページ
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.navButton}
            onClick={onPrev}
            disabled={!totalPages || isLoading}
          >
            前へ
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={onNext}
            disabled={!totalPages || isLoading}
          >
            次へ
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        {isLoading && <p className={styles.loading}>PDFを読み込んでいます…</p>}

        {!isLoading && currentSlide && (
          <img
            src={currentSlide.dataUrl}
            alt={`Slide ${currentSlide.pageNumber}`}
            className={styles.slideImage}
          />
        )}

        {!isLoading && !currentSlide && (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>
              PDFスライドを読み込むと表示されます
            </p>
            <p className={styles.placeholderDescription}>
              PowerPointは事前にPDFにエクスポートしてください。
              <br />
              ページ単位で描画するため、スライド枚数が多い場合は少し時間がかかります。
            </p>
          </div>
        )}

        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <div className={styles.speaker}>
              <img src={iconSrc} alt="話者アイコン" className={styles.icon} />
              <span className={styles.speakerName}>{speakerName}</span>
            </div>
            <div className={styles.message}>
              {messageLines.map((line, index) => (
                <p key={index} className={styles.messageLine}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
