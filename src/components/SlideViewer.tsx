/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";

import type { SlideImage, MessageLine } from "../types/slides";
import styles from "./SlideViewer.module.scss";

const TYPEWRITER_DELAY_MS = 45;

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
  waitingForClick?: boolean;
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
  messages,
  slideTitle,
  waitingForClick,
  onPrev,
  onNext,
}: SlideViewerProps) {
  const [visibleText, setVisibleText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const iconIntervalRef = useRef<number | null>(null);
  const previousFullMessageRef = useRef<string>("");
  const fullMessage = useMemo(() => messages.map(m => m.text).join("\n"), [messages]);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const previousFullMessage = previousFullMessageRef.current;

    if (!fullMessage) {
      setVisibleText("");
      previousFullMessageRef.current = "";
      setIsTyping(false);
      return;
    }

    let startIndex = 0;

    if (previousFullMessage && fullMessage.startsWith(previousFullMessage)) {
      startIndex = previousFullMessage.length;
      setVisibleText(previousFullMessage);
    } else {
      setVisibleText("");
    }

    previousFullMessageRef.current = fullMessage;

    if (startIndex >= fullMessage.length) {
      setVisibleText(fullMessage);
      setIsTyping(false);
      return;
    }

    let index = startIndex;
    setIsTyping(true);

    const tick = () => {
      index += 1;
      setVisibleText(fullMessage.slice(0, index));
      if (index < fullMessage.length) {
        timeoutRef.current = window.setTimeout(tick, TYPEWRITER_DELAY_MS);
      } else {
        timeoutRef.current = null;
        setIsTyping(false);
      }
    };

    if (startIndex === 0) {
      tick();
    } else {
      timeoutRef.current = window.setTimeout(tick, TYPEWRITER_DELAY_MS);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsTyping(false);
    };
  }, [fullMessage]);

  useEffect(() => {
    if (iconIntervalRef.current) {
      window.clearInterval(iconIntervalRef.current);
      iconIntervalRef.current = null;
    }

    if (isTyping) {
      iconIntervalRef.current = window.setInterval(() => {
        setCurrentIconIndex((prev) => (prev === 0 ? 1 : 0));
      }, 250);
    } else {
      setCurrentIconIndex(0);
    }

    return () => {
      if (iconIntervalRef.current) {
        window.clearInterval(iconIntervalRef.current);
        iconIntervalRef.current = null;
      }
    };
  }, [isTyping]);

  const animatedLines = useMemo(() => {
    if (!fullMessage) {
      return [];
    }

    if (!visibleText) {
      return [""];
    }

    return visibleText.split("\n");
  }, [fullMessage, visibleText]);

  const linesToRender = animatedLines.length ? animatedLines : messages.map(m => m.text);

  const displayedIconSrc = isTyping
    ? (currentIconIndex === 0 ? iconSrc : "/speaker_2.png")
    : iconSrc;

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
          {waitingForClick && (
            <span className={styles.clickWaitIndicator}>
              クリック待ち
            </span>
          )}
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
            className={`${styles.navButton} ${styles.nextButton} ${waitingForClick ? styles.blinking : ''}`}
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
      </div>

      <div className={styles.messagePanel}>
        <div className={styles.messageCard}>
          <div className={styles.speaker}>
            <img src={displayedIconSrc} alt="話者アイコン" className={styles.icon} />
            <span className={styles.speakerName}>{speakerName}</span>
          </div>
          <div className={styles.message}>
            {linesToRender.map((line, index) => (
              <p key={index} className={styles.messageLine}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
