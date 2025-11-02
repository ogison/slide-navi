import { ChangeEvent, useMemo, useState } from "react";
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
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const handleScriptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onScriptChange(event.target.value);
  };

  const scriptRuleSections = useMemo(
    () => [
      {
        title: "基本ルール",
        items: [
          "スライドは # で始まる行で区切ります。",
          "各スライド内では1行が1メッセージとして扱われます。",
          "空行を入れるとメッセージウィンドウがクリアされ、次のメッセージグループが始まります。",
        ],
      },
      {
        title: "ヒント",
        items: [
          "PDFのページ数と台本のセクション数をそろえると自動再生がスムーズです。",
          "40文字を超える長文は句読点ごとに自動的に分割されます。",
        ],
      },
    ],
    [],
  );

  const toggleRules = () => setIsRulesOpen((previous) => !previous);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>メッセージウィンドウ</h2>

      <div className={styles.fieldLabelRow}>
        <label className={styles.fieldLabel} htmlFor="script-text">
          台本
          {hasSlides ? `（全${totalPages}ページ）` : ""}
        </label>

        <button
          type="button"
          className={styles.rulesButton}
          onClick={toggleRules}
          aria-expanded={isRulesOpen}
          aria-controls="script-rules"
        >
          {isRulesOpen ? "ルールを隠す" : "ルールを見る"}
        </button>
      </div>

      <textarea
        id="script-text"
        value={script}
        onChange={handleScriptChange}
        className={styles.textArea}
        rows={8}
        placeholder={SCRIPT_PLACEHOLDER}
        disabled={!hasSlides}
      />

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
          ? "# で始まる行でスライドを区切ります。改行でメッセージを区切ります。"
          : "PDFをアップロードすると、# で区切った台本を入力できます。"}
      </p>
    </div>
  );
}
