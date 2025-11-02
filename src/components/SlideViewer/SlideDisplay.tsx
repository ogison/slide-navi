/* eslint-disable @next/next/no-img-element */

import type { SlideImage } from "../../types/slides";
import styles from "./SlideViewer.module.scss";
import FightAnimation from "./FightAnimation";

type SlideDisplayProps = {
  currentSlide?: SlideImage;
  isLoading: boolean;
  showFightAnimation?: boolean;
};

export default function SlideDisplay({
  currentSlide,
  isLoading,
  showFightAnimation = false,
}: SlideDisplayProps) {
  return (
    <div className={styles.stage}>
      {isLoading && <p className={styles.loading}>PDFを読み込んでいます…</p>}

      {!isLoading && currentSlide && (
        <>
          <img
            src={currentSlide.dataUrl}
            alt={`Slide ${currentSlide.pageNumber}`}
            className={styles.slideImage}
          />
          {showFightAnimation && <FightAnimation />}
        </>
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
  );
}
