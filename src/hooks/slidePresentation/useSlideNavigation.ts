import { useCallback, useState } from "react";

interface UseSlideNavigationProps {
  totalPages: number;
  onSlideChange?: () => void;
}

export const useSlideNavigation = ({
  totalPages,
  onSlideChange,
}: UseSlideNavigationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const jumpTo = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < totalPages) {
        setCurrentIndex(pageIndex);
        onSlideChange?.();
      }
    },
    [totalPages, onSlideChange],
  );

  const resetIndex = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  return {
    currentIndex,
    setCurrentIndex,
    jumpTo,
    resetIndex,
  };
};
