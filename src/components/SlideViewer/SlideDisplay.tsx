/* eslint-disable @next/next/no-img-element */

import type { MessageGroup, SlideImage } from "../../types/slides";
import styles from "./SlideViewer.module.scss";
import FightAnimation from "./FightAnimation";
import ExplosionAnimation from "./ExplosionAnimation";

type SlideDisplayProps = {
  currentSlide?: SlideImage;
  isLoading: boolean;
  activeAnimation?: MessageGroup["animation"];
};

export default function SlideDisplay({
  currentSlide,
  isLoading,
  activeAnimation,
}: SlideDisplayProps) {
  return (
    <div className={styles.stage}>
      {isLoading && (
        <p className={styles.loading}>Loading PDF...</p>
      )}

      {!isLoading && currentSlide && (
        <>
          <img
            src={currentSlide.dataUrl}
            alt={`Slide ${currentSlide.pageNumber}`}
            className={styles.slideImage}
          />
          {activeAnimation === "fight" && <FightAnimation />}
          {activeAnimation === "explosion" && <ExplosionAnimation />}
        </>
      )}

      {!isLoading && !currentSlide && (
        <div className={styles.placeholder}>
          <p className={styles.placeholderTitle}>
            Upload a PDF slide to see it here.
          </p>
          <p className={styles.placeholderDescription}>
            Export from PowerPoint as PDF before importing.
            <br />
            Rendering happens per page, so large decks may take a moment.
          </p>
        </div>
      )}
    </div>
  );
}