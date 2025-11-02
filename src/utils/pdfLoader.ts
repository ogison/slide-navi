import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import type { SlideImage } from "@/types/slides";

type PdfJsModule = typeof import("pdfjs-dist");

let pdfjsModulePromise: Promise<PdfJsModule> | null = null;

export const loadPdfjsModule = async (): Promise<PdfJsModule> => {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import("pdfjs-dist/webpack").then((module) => {
      const pdfjs = module as PdfJsModule;

      if (typeof window !== "undefined" && pdfjs?.GlobalWorkerOptions) {
        const workerOptions = pdfjs.GlobalWorkerOptions as {
          workerPort?: Worker | null;
          workerSrc?: string;
        };
        if (!workerOptions.workerPort && !workerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }
      }

      return pdfjs;
    });
  }

  return pdfjsModulePromise;
};

export const renderPdfToSlides = async (
  arrayBuffer: ArrayBuffer,
): Promise<SlideImage[]> => {
  const pdfjs = await loadPdfjsModule();
  const loadingTask = pdfjs.getDocument({
    data: arrayBuffer,
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

    await page.render({
      canvasContext: context,
      viewport,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas: canvas as any,
    }).promise;

    renderedSlides.push({
      dataUrl: canvas.toDataURL(),
      pageNumber,
    });
  }

  return renderedSlides;
};
