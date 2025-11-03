import { useCallback, useEffect, useRef, useState } from "react";
import { createSlideScripts } from "@/utils/scriptParser";
import { serializeSlideScripts } from "@/utils/scriptSerializer";
import type { SlideScript } from "@/types/slides";

export const useScriptManager = (totalPages: number) => {
  const [scriptInput, setScriptInput] = useState<string>("");
  const [slideScripts, setSlideScripts] = useState<SlideScript[]>(() =>
    createSlideScripts("", totalPages),
  );
  const [parseError, setParseError] = useState<string | null>(null);
  // Flag to prevent circular updates when slideScripts are updated from preview
  const isUpdatingFromPreviewRef = useRef(false);

  useEffect(() => {
    // Skip parsing if the update came from preview edit to prevent circular updates
    if (isUpdatingFromPreviewRef.current) {
      isUpdatingFromPreviewRef.current = false;
      return;
    }

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

  const handleSlideScriptsUpdate = useCallback(
    (updatedSlideScripts: SlideScript[]) => {
      // Update slideScripts state
      setSlideScripts(updatedSlideScripts);

      // Serialize to JSON and update scriptInput
      const serializedJson = serializeSlideScripts(updatedSlideScripts);

      // Set flag to prevent circular update
      isUpdatingFromPreviewRef.current = true;
      setScriptInput(serializedJson);

      // Clear any previous parse errors since the update came from valid data
      setParseError(null);
    },
    [],
  );

  return {
    scriptInput,
    slideScripts,
    parseError,
    handleScriptChange,
    handleSlideScriptsUpdate,
  };
};
