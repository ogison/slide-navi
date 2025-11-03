import { ChangeEvent, useCallback, useState } from "react";
import type { SlideImage } from "@/types/slides";
import { renderPdfToSlides } from "@/utils/pdfLoader";

export const usePdfUpload = () => {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [documentName, setDocumentName] = useState<string>("サンプル資料.pdf");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdfUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setError(null);

      if (file.type !== "application/pdf") {
        setError(
          "PDFファイルのみ対応しています。PowerPointの場合はPDFに変換してから読み込んでください。",
        );
        event.target.value = "";
        return;
      }

      setIsLoading(true);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const renderedSlides = await renderPdfToSlides(arrayBuffer);

        setSlides(renderedSlides);
        setDocumentName(file.name);
      } catch {
        setError(
          "PDFの読み込みに失敗しました。ファイルが破損していないか確認してください。",
        );
        setSlides([]);
      } finally {
        setIsLoading(false);
        event.target.value = "";
      }
    },
    [],
  );

  return {
    // PDF data
    slides,
    documentName,
    totalPages: slides.length,

    // State
    state: {
      isLoading,
      error,
    },

    // Actions
    actions: {
      handlePdfUpload,
    },
  };
};
