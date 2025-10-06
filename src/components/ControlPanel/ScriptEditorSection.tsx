import { ChangeEvent } from "react";
import styles from "./ControlsPanel.module.scss";
import { SCRIPT_PLACEHOLDER } from "@/constants";

type ScriptEditorSectionProps = {
  script: string;
  onScriptChange: (value: string) => void;
  totalPages: number;
  hasSlides: boolean;
};

export default function ScriptEditorSection({
  script,
  onScriptChange,
  totalPages,
  hasSlides,
}: ScriptEditorSectionProps) {
  const handleScriptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onScriptChange(event.target.value);
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>メッセージウィンドウ</h2>

      <label className={styles.fieldLabel} htmlFor="script-text">
        台本
        {hasSlides ? `（全${totalPages}ページ）` : ""}
      </label>

      <textarea
        id="script-text"
        value={script}
        onChange={handleScriptChange}
        className={styles.textArea}
        rows={8}
        placeholder={SCRIPT_PLACEHOLDER}
        disabled={!hasSlides}
      />

      <p className={styles.sectionDescription}>
        {hasSlides
          ? "# で始まる行でスライドを区切ります。改行でメッセージを区切ります。"
          : "PDFをアップロードすると、# で区切った台本を入力できます。"}
      </p>
    </div>
  );
}
