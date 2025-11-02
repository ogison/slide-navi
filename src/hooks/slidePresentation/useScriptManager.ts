import { useCallback, useEffect, useState } from "react";
import { createSlideScripts } from "@/utils/scriptParser";
import type { SlideScript } from "@/types/slides";

export const useScriptManager = (totalPages: number) => {
  const [scriptInput, setScriptInput] = useState<string>("");
  const [slideScripts, setSlideScripts] = useState<SlideScript[]>(() =>
    createSlideScripts("", totalPages),
  );
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!scriptInput.trim()) {
      setParseError(null);
      setSlideScripts(createSlideScripts("", totalPages));
      return;
    }

    try {
      const scripts = createSlideScripts(scriptInput, totalPages);
      setSlideScripts(scripts);
      setParseError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました。";

      setParseError(message);
      setSlideScripts((previous) => {
        if (totalPages <= 0) {
          return previous.length > 0 ? previous : [];
        }

        if (previous.length === totalPages) {
          return previous;
        }

        return createSlideScripts("", totalPages);
      });
    }
  }, [scriptInput, totalPages]);

  const handleScriptChange = useCallback((value: string) => {
    setScriptInput(value);
  }, []);

  return {
    scriptInput,
    slideScripts,
    parseError,
    handleScriptChange,
  };
};
