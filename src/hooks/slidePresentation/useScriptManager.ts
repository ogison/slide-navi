import { useCallback, useMemo, useState } from "react";
import { createSlideScripts } from "@/utils/scriptParser";

export const useScriptManager = (totalPages: number) => {
  const [scriptInput, setScriptInput] = useState<string>("");

  const slideScripts = useMemo(() => {
    return createSlideScripts(scriptInput, totalPages);
  }, [scriptInput, totalPages]);

  const handleScriptChange = useCallback((value: string) => {
    setScriptInput(value);
  }, []);

  return {
    scriptInput,
    slideScripts,
    handleScriptChange,
  };
};
