import type { SlideImage } from "@/types/slides";
import styles from "./PageJumpSection.module.scss";

type PageJumpSectionProps = {
  slides: SlideImage[];
  currentIndex: number;
  onPageJump: (pageIndex: number) => void;
};

export default function PageJumpSection({
  slides,
  currentIndex,
  onPageJump,
}: PageJumpSectionProps) {
  if (slides.length === 0) {
    return null;
  }

  return (
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
  );
}
