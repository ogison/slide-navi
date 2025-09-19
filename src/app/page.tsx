'use client';

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

type SlideImage = {
  dataUrl: string;
  pageNumber: number;
};


type PdfJsModule = typeof import('pdfjs-dist');

let pdfjsModulePromise: Promise<PdfJsModule> | null = null;

const loadPdfjsModule = async (): Promise<PdfJsModule> => {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import('pdfjs-dist').then((module) => {
      if (module?.GlobalWorkerOptions) {
        module.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }

      return module;
    });
  }

  return pdfjsModulePromise;
};

const SAMPLE_MESSAGE = `これからおこる　すべてのことを、\nうけとめるゆうきが　おまえにはあるか？`;

export default function Home() {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState<string>(SAMPLE_MESSAGE);
  const [speakerName, setSpeakerName] = useState<string>('Dr. Hikari');
  const [iconSrc, setIconSrc] = useState<string>('/speaker.png');
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>('スライドを読み込んでください');
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

  const handlePdfUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);

    if (file.type !== 'application/pdf') {
      setError('PDFファイルのみ対応しています。PowerPointの場合はPDFに変換してから読み込んでください。');
      event.target.value = '';
      return;
    }

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await loadPdfjsModule();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer, disableWorker: true });
      const pdf: PDFDocumentProxy = await loadingTask.promise;

      const renderedSlides: SlideImage[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.6 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('CanvasRenderingContext2D が利用できません。');
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
      setError('PDFの読み込みに失敗しました。ファイルが破損していないか確認してください。');
      setSlides([]);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  }, []);

  const handleIconUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('アイコンには画像ファイル（png, jpg, svgなど）を使用してください。');
      event.target.value = '';
      return;
    }

    if (customIconUrl) {
      URL.revokeObjectURL(customIconUrl);
    }

    const url = URL.createObjectURL(file);
    setCustomIconUrl(url);
    setIconSrc(url);
    event.target.value = '';
  }, [customIconUrl]);

  const goTo = useCallback((direction: -1 | 1) => {
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
  }, [totalPages]);

  const jumpTo = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentIndex(pageIndex);
    }
  }, [totalPages]);

  const messageLines = useMemo(() => message.split('\n'), [message]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Slide Navi</p>
            <h1 className="text-2xl font-semibold text-white">プレゼンテーション補助アプリ</h1>
          </div>
          <p className="text-sm text-slate-300">Next.jsのみで動作するPDFスライドビューア + メッセージウインドウ</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 lg:flex-row">
        <section className="flex-1 rounded-3xl border border-slate-800 bg-slate-950/60 shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/70 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">現在のスライド</p>
              <p className="text-lg font-medium text-white">{documentName}</p>
              {totalPages > 0 && (
                <p className="text-xs text-slate-400">{currentIndex + 1} / {totalPages} ページ</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(-1)}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
                disabled={!totalPages}
              >
                前へ
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                className="rounded-full border border-indigo-500/40 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-600"
                disabled={!totalPages}
              >
                次へ
              </button>
            </div>
          </div>

          <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-b-3xl bg-slate-900">
            {isLoading && (
              <p className="text-sm text-slate-300">PDFを読み込んでいます…</p>
            )}

            {!isLoading && currentSlide && (
              <img
                src={currentSlide.dataUrl}
                alt={`Slide ${currentSlide.pageNumber}`}
                className="max-h-[70vh] w-full object-contain"
              />
            )}

            {!isLoading && !currentSlide && (
              <div className="flex flex-col items-center gap-3 text-center text-slate-400">
                <p className="text-base font-medium text-slate-200">PDFスライドを読み込むと表示されます</p>
                <p className="text-xs leading-6 text-slate-400">
                  PowerPointは事前にPDFにエクスポートしてください。<br />
                  ページ単位で描画するため、スライド枚数が多い場合は少し時間がかかります。
                </p>
              </div>
            )}

            <div className="pointer-events-none absolute bottom-8 left-1/2 w-[90%] max-w-3xl -translate-x-1/2">
              <div className="flex items-stretch gap-4 rounded-2xl border border-slate-700/70 bg-slate-100/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <div className="flex flex-col items-center justify-center">
                  <img
                    src={iconSrc}
                    alt="Speaker icon"
                    className="h-20 w-20 rounded-full border-4 border-white/80 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                  />
                  <span className="mt-2 text-xs font-semibold tracking-[0.2em] text-slate-600">{speakerName}</span>
                </div>
                <div className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-4">
                  {messageLines.map((line, index) => (
                    <p key={index} className="text-base leading-relaxed text-slate-900">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-2xl">
          <div>
            <h2 className="text-lg font-semibold text-white">スライドの読み込み</h2>
            <p className="mt-1 text-sm text-slate-400">PowerPointはPDFにエクスポートしてからアップロードします。</p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-300 transition hover:border-indigo-400 hover:bg-indigo-500/10">
              <span className="font-medium text-slate-100">PDFファイルを選択</span>
              <span className="text-xs text-slate-400">クリックして参照</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
            </label>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">メッセージウインドウ</h2>
            <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">話者名</label>
            <input
              type="text"
              value={speakerName}
              onChange={(event) => setSpeakerName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              placeholder="話者名を入力"
            />

            <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">メッセージ</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm leading-relaxed text-slate-100 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">アイコン画像</h2>
            <p className="mt-1 text-sm text-slate-400">デフォルトでは doc/image.png を使用しています。</p>
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-4 text-center text-sm text-slate-300 transition hover:border-indigo-400 hover:bg-indigo-500/10">
              <span className="font-medium text-slate-100">アイコンを差し替える</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
            </label>
          </div>

          {totalPages > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white">ページジャンプ</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.pageNumber}
                    type="button"
                    onClick={() => jumpTo(index)}
                    className={`h-9 w-9 rounded-full border text-sm font-medium transition ${index === currentIndex ? 'border-indigo-400 bg-indigo-500/20 text-indigo-100' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-400 hover:text-white'}`}
                  >
                    {slide.pageNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

