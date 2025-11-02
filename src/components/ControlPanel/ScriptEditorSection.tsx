import { ChangeEvent, useMemo, useState } from "react";
import styles from "./ControlsPanel.module.scss";
import { SCRIPT_PLACEHOLDER } from "@/constants";

type ScriptEditorSectionProps = {
  script: string;
  onScriptChange: (value: string) => void;
  totalPages: number;
  hasSlides: boolean;
  error: string | null;
};

export default function ScriptEditorSection({
  script,
  onScriptChange,
  totalPages,
  hasSlides,
  error,
}: ScriptEditorSectionProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const handleScriptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onScriptChange(event.target.value);
  };

  const scriptRuleSections = useMemo(
    () => [
      {
        title: "入力形式",
        items: [
          'トップレベルはスライドの配列、または { "slides": [...] } 形式のオブジェクトです。',
          "各スライドは title (任意)、groups (必須)、transition (任意) を指定できます。",
          'transition.type は "immediate" のみサポートしています。',
        ],
      },
      {
        title: "groups の構造",
        items: [
          '各要素は文字列配列、または { "messages": [...] } 形式のオブジェクトです。',
          'messages の要素は文字列、または { "text": "発話内容" } で指定します。',
          "空の文字列や空の配列は無視されます。必要に応じてスライド数と groups 数を揃えてください。",
        ],
      },
    ],
    [],
  );

  const toggleRules = () => setIsRulesOpen((previous) => !previous);

  const textAreaClassName = error
    ? `${styles.textArea} ${styles.textAreaError}`
    : styles.textArea;

  const labelText = hasSlides
    ? `JSON 台本 (${totalPages} ページ)`
    : "JSON 台本";

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>台本 (JSON)</h2>

      <div className={styles.fieldLabelRow}>
        <label className={styles.fieldLabel} htmlFor="script-json">
          {labelText}
        </label>

        <button
          type="button"
          className={styles.rulesButton}
          onClick={toggleRules}
          aria-expanded={isRulesOpen}
          aria-controls="script-rules"
        >
          {isRulesOpen ? "ルールを閉じる" : "ルールを表示"}
        </button>
      </div>

      <textarea
        id="script-json"
        value={script}
        onChange={handleScriptChange}
        className={textAreaClassName}
        rows={12}
        placeholder={SCRIPT_PLACEHOLDER}
        disabled={!hasSlides}
        spellCheck={false}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? "script-json-error" : undefined}
      />

      {error ? (
        <p id="script-json-error" className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {isRulesOpen ? (
        <div id="script-rules" className={styles.rulesPanel}>
          {scriptRuleSections.map((section) => (
            <div key={section.title} className={styles.rulesSection}>
              <h3 className={styles.rulesSectionTitle}>{section.title}</h3>
              <ul className={styles.rulesList}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      <p className={styles.sectionDescription}>
        {hasSlides
          ? "PDF を読み込むとサンプル JSON が入力されます。ページ順に内容を編集してください。"
          : "先に PDF をアップロードすると JSON 入力欄が有効になります。"}
      </p>
    </div>
  );
}
