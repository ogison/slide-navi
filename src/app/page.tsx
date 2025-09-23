"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

import HeaderSection from "../components/HeaderSection";
import SlideViewer from "../components/SlideViewer";
import type {
  SlideImage,
  SlideScript,
  MessageLine,
  MessageGroup,
  TransitionType,
} from "../types/slides";
import styles from "./Home.module.scss";
import ControlsPanel from "@/components/ControlsPanel";
import { SCRIPT_PLACEHOLDER } from "@/constants";

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

const parseScript = (script: string): SlideScript[] => {
  if (!script.trim()) {
    return [];
  }

  const normalized = script.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Split by lines starting with #
  const sections: string[] = [];
  const lines = normalized.split('\n');
  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (currentSection.trim()) {
        sections.push(currentSection.trim());
      }
      currentSection = line;
    } else {
      currentSection += '\n' + line;
    }
  }

  // Add the last section
  if (currentSection.trim()) {
    sections.push(currentSection.trim());
  }

  return sections.map((slideText, slideIndex) => {
    const lines = slideText.split("\n");
    let title: string | undefined;
    const messages: MessageLine[] = [];
    const messageGroups: MessageGroup[] = [];
    const transition = {
      type: "immediate" as TransitionType,
    };

    let currentGroup: string[] = [];
    let groupIndex = 0;

    const finishCurrentGroup = () => {
      if (currentGroup.length > 0) {
        const groupText = currentGroup.join('\n');
        const parts = splitByPunctuation(groupText);
        const groupMessages: MessageLine[] = parts.map((part) => ({ text: part }));

        // Add to messages array for backward compatibility
        groupMessages.forEach((msg) => {
          messages.push(msg);
        });

        // Add to messageGroups for group-based display
        messageGroups.push({
          id: `slide-${slideIndex}-group-${groupIndex}`,
          messages: groupMessages
        });

        currentGroup = [];
        groupIndex++;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for title (first line starting with #)
      if (line.startsWith("# ")) {
        title = line.substring(2).trim();
        continue;
      }

      // If empty line, finish current group
      if (!line.trim()) {
        finishCurrentGroup();
        continue;
      }

      // Add line to current group
      currentGroup.push(line);
    }

    // Add remaining group if any
    finishCurrentGroup();

    return { title, messages, messageGroups, transition };
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
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(0);

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
        scripts[i] || { messages: [], messageGroups: [], transition: { type: "immediate" } }
      );
    }
    return result;
  }, [scriptInput, totalPages]);

  const currentSlideScript = slideScripts[currentIndex] || {
    messages: [],
    messageGroups: [],
    transition: { type: "immediate" },
  };
  const currentMessages = currentSlideScript.messages;
  const currentMessageGroups = currentSlideScript.messageGroups;
  const currentTitle = currentSlideScript.title;

  const displayedMessages = useMemo(() => {
    if (visibleMessageCount === null) {
      return currentMessages;
    }

    // グループベースの表示制御
    if (currentMessageGroups.length > 0) {
      const targetGroup = currentMessageGroups[Math.min(currentGroupIndex, currentMessageGroups.length - 1)];
      return targetGroup ? targetGroup.messages : [];
    }

    return currentMessages.slice(
      0,
      Math.min(visibleMessageCount, currentMessages.length)
    );
  }, [currentMessages, currentMessageGroups, currentGroupIndex, visibleMessageCount]);


  useEffect(() => {
    if (!isAutoPlaying) {
      setVisibleMessageCount(null);
      setCurrentGroupIndex(0);
      return;
    }

    // 自動再生時は最初のメッセージグループから開始
    // スライド切り替え時やメッセージ変更時は強制的にリセット
    setCurrentGroupIndex(0);
    setVisibleMessageCount(currentMessageGroups.length > 0 ? 1 : 0);
  }, [isAutoPlaying, currentIndex, currentMessageGroups.length]);

  useEffect(() => {
    if (!isAutoPlaying || !totalPages) {
      return;
    }

    const totalGroups = currentMessageGroups.length;

    const scheduleNextGroup = () => {
      setCurrentGroupIndex((previous) => {
        if (previous >= totalGroups - 1) {
          // 最後のグループに達したら次のスライドへ
          scheduleNextSlide();
          return 0;
        }
        return previous + 1;
      });
    };

    const scheduleNextSlide = () => {
      setCurrentIndex((previous) => {
        if (previous >= totalPages - 1) {
          setIsAutoPlaying(false);
          return previous;
        }
        return previous + 1;
      });
    };

    // Schedule next action
    const timer = window.setTimeout(() => {
      if (totalGroups === 0) {
        scheduleNextSlide();
      } else {
        scheduleNextGroup();
      }
    }, autoPlayDelaySeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [
    isAutoPlaying,
    autoPlayDelaySeconds,
    totalPages,
    currentIndex,
    currentMessageGroups,
    currentGroupIndex,
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
          previous.trim() ? previous : SCRIPT_PLACEHOLDER
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
      // Force reset message display when changing slides
      setVisibleMessageCount(null);
      setCurrentGroupIndex(0);
    },
    [totalPages]
  );

  const handlePrev = useCallback(() => {
    stopAutoPlay();
    goTo(-1);
  }, [goTo, stopAutoPlay]);

  const handleNext = useCallback(() => {
    stopAutoPlay();
    goTo(1);
  }, [goTo, stopAutoPlay]);

  const jumpTo = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalPages) {
        stopAutoPlay();
        setCurrentIndex(pageIndex);
        // Force reset message display when jumping to a slide
        setVisibleMessageCount(null);
        setCurrentGroupIndex(0);
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

      if (next) {
        // 自動再生開始時はメッセージを強制リセットしてから開始
        setCurrentGroupIndex(0);
        setVisibleMessageCount(currentMessageGroups.length > 0 ? 1 : 0);
      } else {
        // 自動再生停止時は全メッセージを表示
        setVisibleMessageCount(null);
        setCurrentGroupIndex(0);
      }

      return next;
    });
  }, [currentMessageGroups.length, totalPages]);

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
          speakerName="Dr. Hikari"
          iconSrc={iconSrc}
          messages={displayedMessages}
          slideTitle={currentTitle}
          messageGroupId={currentMessageGroups[currentGroupIndex]?.id || `slide-${currentIndex}-group-0`}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <ControlsPanel
          onPdfUpload={handlePdfUpload}
          onIconUpload={handleIconUpload}
          onScriptChange={handleScriptChange}
          onPageJump={jumpTo}
          onAutoPlayToggle={handleAutoPlayToggle}
          onAutoPlayDelayChange={handleAutoPlayDelayChange}
          script={scriptInput}
          slides={slides}
          currentIndex={currentIndex}
          isAutoPlaying={isAutoPlaying}
          autoPlayDelaySeconds={autoPlayDelaySeconds}
          totalPages={totalPages}
          error={error}
        />
      </main>
    </div>
  );
}
