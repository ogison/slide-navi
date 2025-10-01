/* eslint-disable @next/next/no-img-element */

import type { SlideImage, MessageLine } from "../types/slides";
import styles from "./SlideViewer.module.scss";
import SpeakerMessage from "./SpeakerMessage";

type SlideViewerProps = {
  currentSlide?: SlideImage;
  totalPages: number;
  currentIndex: number;
  documentName: string;
  isLoading: boolean;
  speakerName: string;
  iconSrc: string;
  messages: MessageLine[];
  slideTitle?: string;
  messageGroupId: string;
  onPrev: () => void;
  onNext: () => void;
  onMessagePrev: () => void;
  onMessageNext: () => void;
  currentGroupIndex: number;
  totalGroups: number;
  showClearEffect?: boolean;
};

export default function SlideViewer({
  currentSlide,
  totalPages,
  currentIndex,
  documentName,
  isLoading,
  speakerName,
  iconSrc,
  messages,
  slideTitle,
  messageGroupId,
  onPrev,
  onNext,
  onMessagePrev,
  onMessageNext,
  currentGroupIndex,
  totalGroups,
  showClearEffect = false,
}: SlideViewerProps) {

  return (
    <section className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.documentInfo}>
          <p className={styles.statusLabel}>現在のスライド</p>
          <p className={styles.fileName}>{documentName}</p>
          {totalPages > 0 && (
            <>
              <p className={styles.pageCount}>
                {currentIndex + 1} / {totalPages} ページ
              </p>
              {slideTitle && (
                <p className={styles.slideTitle}>{slideTitle}</p>
              )}
            </>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.navButton}
            onClick={onMessagePrev}
            disabled={!totalPages || isLoading || (currentIndex === 0 && currentGroupIndex === 0)}
          >
            前へ
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={onMessageNext}
            disabled={!totalPages || isLoading || (currentIndex >= totalPages - 1 && currentGroupIndex >= totalGroups - 1)}
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
      </div>

      <SpeakerMessage
        speakerName={speakerName}
        iconSrc={iconSrc}
        messages={messages}
        messageGroupId={messageGroupId}
        showClearEffect={showClearEffect}
      />
    </section>
  );
}
