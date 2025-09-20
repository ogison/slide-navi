"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

import HeaderSection from "../components/HeaderSection";
import SlideViewer from "../components/SlideViewer";
import type {
  SlideImage,
  SlideScript,
  MessageLine,
  TransitionType,
} from "../types/slides";
import styles from "./Home.module.scss";
import ControlsPanel from "@/components/ControlsPanel";

type PdfJsModule = typeof import("pdfjs-dist");

let pdfjsModulePromise: Promise<PdfJsModule> | null = null;

const loadPdfjsModule = async (): Promise<PdfJsModule> => {
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

const SAMPLE_SCRIPT = `# タイトル
@Dr. Hikari: こんにちは
よろしくおねがいします >>2s

# 目次
今回紹介するのは
・入門編
・応用編
・Q&A >>click

# 入門編
まずAのポイントは3つあります。
1つめは…`;
const parseScript = (script: string): SlideScript[] => {
  if (!script.trim()) {
    return [];
  }

  const normalized = script.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const slides = normalized
    .split(/\n\s*\n/g)
    .map((section) => section.trim())
    .filter(Boolean);

  return slides.map((slideText) => {
    const lines = slideText.split("\n").filter((line) => line.trim());
    let title: string | undefined;
    const messages: MessageLine[] = [];
    let transition: { type: TransitionType; delay?: number } = {
      type: "immediate",
    };
    let defaultSpeaker: string | undefined;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for title
      if (line.startsWith("# ")) {
        title = line.substring(2).trim();
        continue;
      }

      // Check for transition at the end of the last line
      if (i === lines.length - 1) {
        const transitionMatch = line.match(/>>(.+)$/);
        if (transitionMatch) {
          const transitionText = transitionMatch[1].trim();
          const cleanLine = line.replace(/>>(.+)$/, "").trim();

          if (transitionText === "click") {
            transition = { type: "click" };
          } else if (transitionText.endsWith("s")) {
            const seconds = parseFloat(transitionText.slice(0, -1));
            if (!isNaN(seconds)) {
              transition = { type: "wait", delay: seconds };
            }
          }

          if (cleanLine) {
            lines[i] = cleanLine;
          } else {
            continue;
          }
        }
      }

      // Parse message with speaker
      const speakerMatch = line.match(/^@([^:]+):\s*(.*)/);
      if (speakerMatch) {
        const speaker = speakerMatch[1].trim();
        const text = speakerMatch[2].trim();
        defaultSpeaker = speaker;
        if (text) {
          // Split by punctuation if long
          const parts = splitByPunctuation(text);
          parts.forEach((part) => {
            messages.push({ text: part, speaker });
          });
        }
      } else {
        // Regular message
        const parts = splitByPunctuation(line);
        parts.forEach((part) => {
          messages.push({ text: part, speaker: defaultSpeaker });
        });
      }
    }

    return { title, messages, transition };
  });
};

const splitByPunctuation = (text: string): string[] => {
  // Split long lines by Japanese/Chinese punctuation
  const maxLength = 40;
  if (text.length <= maxLength) {
    return [text];
  }

  // Split by punctuation marks
  const parts: string[] = [];
  const punctuations = /[。、？！?,]/g;
  let lastIndex = 0;
  let match;

  while ((match = punctuations.exec(text)) !== null) {
    const part = text.substring(lastIndex, match.index + 1).trim();
    if (part) {
      parts.push(part);
    }
    lastIndex = match.index + 1;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining) {
      parts.push(remaining);
    }
  }

  return parts.length > 0 ? parts : [text];
};

export default function Home() {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scriptInput, setScriptInput] = useState<string>("");
  const [defaultSpeakerName, setDefaultSpeakerName] =
    useState<string>("Dr. Hikari");
  const [iconSrc, setIconSrc] = useState<string>("/speaker.png");
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>("サンプル資料.pdf");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlayDelaySeconds, setAutoPlayDelaySeconds] = useState<number>(2);
  const [visibleMessageCount, setVisibleMessageCount] = useState<number | null>(
    null
  );
  const [waitingForClick, setWaitingForClick] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (customIconUrl) {
        URL.revokeObjectURL(customIconUrl);
      }
    };
  }, [customIconUrl]);

  const totalPages = slides.length;
  const currentSlide = slides[currentIndex];
  const slideScripts = useMemo(() => {
    const scripts = parseScript(scriptInput);

    if (!totalPages) {
      return scripts;
    }

    // Ensure we have scripts for all slides
    const result: SlideScript[] = [];
    for (let i = 0; i < totalPages; i++) {
      result.push(
        scripts[i] || { messages: [], transition: { type: "immediate" } }
      );
    }
    return result;
  }, [scriptInput, totalPages]);

  const currentSlideScript = slideScripts[currentIndex] || {
    messages: [],
    transition: { type: "immediate" },
  };
  const currentMessages = currentSlideScript.messages;
  const currentTransition = currentSlideScript.transition;
  const currentTitle = currentSlideScript.title;

  const displayedMessages = useMemo(() => {
    if (visibleMessageCount === null) {
      return currentMessages;
    }
    return currentMessages.slice(
      0,
      Math.min(visibleMessageCount, currentMessages.length)
    );
  }, [currentMessages, visibleMessageCount]);

  const currentSpeaker = useMemo(() => {
    const lastMessageWithSpeaker = [...displayedMessages]
      .reverse()
      .find((msg) => msg.speaker);
    return lastMessageWithSpeaker?.speaker || defaultSpeakerName;
  }, [displayedMessages, defaultSpeakerName]);

  useEffect(() => {
    if (!isAutoPlaying) {
      setVisibleMessageCount(null);
      setWaitingForClick(false);
      return;
    }

    setVisibleMessageCount(currentMessages.length > 0 ? 1 : 0);
    setWaitingForClick(false);
  }, [isAutoPlaying, currentIndex, currentMessages.length]);

  useEffect(() => {
    if (!isAutoPlaying || !totalPages) {
      return;
    }

    // Handle click-wait mode
    if (waitingForClick) {
      return;
    }

    const totalMessages = currentMessages.length;
    const visibleMessages =
      visibleMessageCount === null
        ? totalMessages
        : Math.min(visibleMessageCount, totalMessages);

    const scheduleNextMessage = () => {
      setVisibleMessageCount((previous) => {
        if (previous === null) {
          return previous;
        }
        return Math.min(previous + 1, totalMessages);
      });
    };

    const scheduleNextSlide = () => {
      // Check transition type
      if (currentTransition.type === "click") {
        setWaitingForClick(true);
        return;
      }

      const delay =
        currentTransition.type === "wait" && currentTransition.delay
          ? currentTransition.delay * 1000
          : 0;

      const moveToNext = () => {
        setCurrentIndex((previous) => {
          if (previous >= totalPages - 1) {
            setIsAutoPlaying(false);
            return previous;
          }
          return previous + 1;
        });
      };

      if (delay > 0) {
        const timer = window.setTimeout(moveToNext, delay);
        return () => window.clearTimeout(timer);
      } else {
        moveToNext();
      }
    };

    // Schedule next action
    const timer = window.setTimeout(() => {
      if (totalMessages === 0 || visibleMessages >= totalMessages) {
        scheduleNextSlide();
      } else {
        scheduleNextMessage();
      }
    }, autoPlayDelaySeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [
    isAutoPlaying,
    autoPlayDelaySeconds,
    totalPages,
    currentIndex,
    currentMessages,
    visibleMessageCount,
    currentTransition,
    waitingForClick,
  ]);

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

        setSlides(renderedSlides);
        setCurrentIndex(0);
        setDocumentName(file.name);
        setIsAutoPlaying(false);
        setScriptInput((previous) =>
          previous.trim() ? previous : SAMPLE_SCRIPT
        );
      } catch (pdfError) {
        console.error(pdfError);
        setError(
          "PDFの読み込みに失敗しました。ファイルが破損していないか確認してください。"
        );
        setSlides([]);
        setCurrentIndex(0);
        setIsAutoPlaying(false);
        setScriptInput("");
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
          "アイコンには画像ファイル（png, jpg, svgなど）をご使用ください。"
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

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

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

  const handlePrev = useCallback(() => {
    stopAutoPlay();
    setWaitingForClick(false);
    goTo(-1);
  }, [goTo, stopAutoPlay]);

  const handleNext = useCallback(() => {
    // If waiting for click in auto-play mode, proceed to next slide
    if (waitingForClick && isAutoPlaying) {
      setWaitingForClick(false);
      setCurrentIndex((previous) => {
        if (previous >= totalPages - 1) {
          setIsAutoPlaying(false);
          return previous;
        }
        return previous + 1;
      });
      return;
    }
    stopAutoPlay();
    setWaitingForClick(false);
    goTo(1);
  }, [goTo, stopAutoPlay, waitingForClick, isAutoPlaying, totalPages]);

  const jumpTo = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalPages) {
        stopAutoPlay();
        setWaitingForClick(false);
        setCurrentIndex(pageIndex);
      }
    },
    [stopAutoPlay, totalPages]
  );

  const handleScriptChange = useCallback((value: string) => {
    setScriptInput(value);
  }, []);

  const handleAutoPlayToggle = useCallback(() => {
    if (!totalPages) {
      return;
    }

    setIsAutoPlaying((previous) => {
      const next = !previous;

      setVisibleMessageCount(
        next ? (currentMessages.length > 0 ? 1 : 0) : null
      );
      setWaitingForClick(false);

      return next;
    });
  }, [currentMessages.length, totalPages]);

  const handleAutoPlayDelayChange = useCallback((value: number) => {
    setAutoPlayDelaySeconds(Math.max(1, Math.floor(value)));
  }, []);

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
          speakerName={currentSpeaker}
          iconSrc={iconSrc}
          messages={displayedMessages}
          slideTitle={currentTitle}
          waitingForClick={waitingForClick}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <ControlsPanel
          onPdfUpload={handlePdfUpload}
          onIconUpload={handleIconUpload}
          onSpeakerNameChange={setDefaultSpeakerName}
          onScriptChange={handleScriptChange}
          onPageJump={jumpTo}
          onAutoPlayToggle={handleAutoPlayToggle}
          onAutoPlayDelayChange={handleAutoPlayDelayChange}
          speakerName={defaultSpeakerName}
          script={scriptInput}
          slides={slides}
          currentIndex={currentIndex}
          isAutoPlaying={isAutoPlaying}
          autoPlayDelaySeconds={autoPlayDelaySeconds}
          totalPages={totalPages}
          error={error}
          waitingForClick={waitingForClick}
        />
      </main>
    </div>
  );
}
