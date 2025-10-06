import { useCallback, useState } from "react";

export const useTypingState = () => {
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(true);

  const handleTypingComplete = useCallback(() => {
    setIsTypingComplete(true);
  }, []);

  const resetTypingState = useCallback(() => {
    setIsTypingComplete(false);
  }, []);

  const setTypingComplete = useCallback((complete: boolean) => {
    setIsTypingComplete(complete);
  }, []);

  return {
    isTypingComplete,
    handleTypingComplete,
    resetTypingState,
    setTypingComplete,
  };
};
