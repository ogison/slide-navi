import { ChangeEvent, useCallback, useEffect, useState } from "react";

export const useIconUpload = () => {
  const [iconSrc, setIconSrc] = useState<string>("/speaker.png");
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (customIconUrl) {
        URL.revokeObjectURL(customIconUrl);
      }
    };
  }, [customIconUrl]);

  const handleIconUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setError(null);

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

  const resetIcon = useCallback(() => {
    if (customIconUrl) {
      URL.revokeObjectURL(customIconUrl);
    }
    setCustomIconUrl(null);
    setIconSrc("/speaker.png");
    setError(null);
  }, [customIconUrl]);

  return {
    iconSrc,
    handleIconUpload,
    resetIcon,
    error,
  };
};