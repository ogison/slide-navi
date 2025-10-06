import styles from "./SlideViewer.module.scss";

type SlideViewerHeaderProps = {
  documentName: string;
  currentIndex: number;
  totalPages: number;
  slideTitle?: string;
  isLoading: boolean;
  isAutoPlaying: boolean;
  onAutoPlayToggle: () => void;
  onMessagePrev: () => void;
  onMessageNext: () => void;
  currentGroupIndex: number;
  totalGroups: number;
};

export default function SlideViewerHeader({
  documentName,
  currentIndex,
  totalPages,
  slideTitle,
  isLoading,
  isAutoPlaying,
  onAutoPlayToggle,
  onMessagePrev,
  onMessageNext,
  currentGroupIndex,
  totalGroups,
}: SlideViewerHeaderProps) {
  return (
    <div className={styles.topBar}>
      <div className={styles.documentInfo}>
        <p className={styles.statusLabel}>現在のスライド</p>
        <p className={styles.fileName}>{documentName}</p>
        {totalPages > 0 && (
          <>
            <p className={styles.pageCount}>
              {currentIndex + 1} / {totalPages} ページ
            </p>
            {slideTitle && <p className={styles.slideTitle}>{slideTitle}</p>}
          </>
        )}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.autoPlayButton} ${isAutoPlaying ? styles.autoPlayButtonActive : ""}`}
          onClick={onAutoPlayToggle}
          disabled={totalPages <= 1}
        >
          {isAutoPlaying ? "停止" : "自動進行"}
        </button>
        <button
          type="button"
          className={styles.navButton}
          onClick={onMessagePrev}
          disabled={
            !totalPages ||
            isLoading ||
            (currentIndex === 0 && currentGroupIndex === 0)
          }
        >
          前へ
        </button>
        <button
          type="button"
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={onMessageNext}
          disabled={
            !totalPages ||
            isLoading ||
            (currentIndex >= totalPages - 1 &&
              currentGroupIndex >= totalGroups - 1)
          }
        >
          次へ
        </button>
      </div>
    </div>
  );
}
