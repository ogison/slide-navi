"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

import HeaderSection from "../components/HeaderSection";
import SlideViewer from "../components/SlideViewer";
import type { SlideImage } from "../types/slides";
import styles from "./Home.module.scss";
import ControlsPanel from "@/components/ControlsPanel";

type PdfJsModule = typeof import("pdfjs-dist");

let pdfjsModulePromise: Promise<PdfJsModule> | null = null;

const loadPdfjsModule = async (): Promise<PdfJsModule> => {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import("pdfjs-dist").then((module) => {
      if (module?.GlobalWorkerOptions) {
        module.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      return module;
    });
  }

  return pdfjsModulePromise;
};

const SAMPLE_MESSAGE = `これからおこる　すべてのことを、
うけとめるゆうきが　おまえにはあるか？`;

export default function Home() {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState<string>(SAMPLE_MESSAGE);
  const [speakerName, setSpeakerName] = useState<string>("Dr. Hikari");
  const [iconSrc, setIconSrc] = useState<string>("/speaker.png");
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] =
    useState<string>("スライドを読み込んでください");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (customIconUrl) {
        URL.revokeObjectURL(customIconUrl);
      }
    };
  }, [customIconUrl]);

  const totalPages = slides.length;
  const currentSlide = slides[currentIndex];

  const handlePdfUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setError(null);

      if (file.type !== "application/pdf") {
        setError(
          "PDFファイルのみ対応しています。PowerPointの場合はPDFに変換してから読み込んでください。"
        );
        event.target.value = "";
        return;
      }

      setIsLoading(true);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await loadPdfjsModule();
        const loadingTask = pdfjs.getDocument({
          data: arrayBuffer,
          disableWorker: true,
        });
        const pdf: PDFDocumentProxy = await loadingTask.promise;

        const renderedSlides: SlideImage[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.6 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("CanvasRenderingContext2D が利用できません。");
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;

          renderedSlides.push({
            dataUrl: canvas.toDataURL(),
            pageNumber,
          });
        }

        setSlides(renderedSlides);
        setCurrentIndex(0);
        setDocumentName(file.name);
      } catch (pdfError) {
        console.error(pdfError);
        setError(
          "PDFの読み込みに失敗しました。ファイルが破損していないか確認してください。"
        );
        setSlides([]);
        setCurrentIndex(0);
      } finally {
        setIsLoading(false);
        event.target.value = "";
      }
    },
    []
  );

  const handleIconUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError(
          "アイコンには画像ファイル（png, jpg, svgなど）を使用してください。"
        );
        event.target.value = "";
        return;
      }

      if (customIconUrl) {
        URL.revokeObjectURL(customIconUrl);
      }

      const url = URL.createObjectURL(file);
      setCustomIconUrl(url);
      setIconSrc(url);
      event.target.value = "";
    },
    [customIconUrl]
  );

  const goTo = useCallback(
    (direction: -1 | 1) => {
      setCurrentIndex((previous) => {
        if (!totalPages) {
          return 0;
        }

        const nextIndex = previous + direction;

        if (nextIndex < 0) {
          return totalPages - 1;
        }

        if (nextIndex >= totalPages) {
          return 0;
        }

        return nextIndex;
      });
    },
    [totalPages]
  );

  const jumpTo = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalPages) {
        setCurrentIndex(pageIndex);
      }
    },
    [totalPages]
  );

  const messageLines = useMemo(() => message.split("\n"), [message]);

  return (
    <div className={styles.page}>
      <HeaderSection />
      <main className={styles.main}>
        <SlideViewer
          currentSlide={currentSlide}
          totalPages={totalPages}
          currentIndex={currentIndex}
          documentName={documentName}
          isLoading={isLoading}
          speakerName={speakerName}
          iconSrc={iconSrc}
          messageLines={messageLines}
          onPrev={() => goTo(-1)}
          onNext={() => goTo(1)}
        />
        <ControlsPanel
          onPdfUpload={handlePdfUpload}
          onIconUpload={handleIconUpload}
          onSpeakerNameChange={setSpeakerName}
          onMessageChange={setMessage}
          onPageJump={jumpTo}
          speakerName={speakerName}
          message={message}
          slides={slides}
          currentIndex={currentIndex}
          error={error}
        />
      </main>
    </div>
  );
}
