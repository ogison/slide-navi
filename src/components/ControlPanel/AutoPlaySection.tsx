import styles from "./ControlsPanel.module.scss";
import NumberInputWithArrows from "./NumberInputWithArrows";

type AutoPlaySectionProps = {
  autoPlayDelaySeconds: number;
  onAutoPlayDelayChange: (seconds: number) => void;
  totalPages: number;
};

export default function AutoPlaySection({
  autoPlayDelaySeconds,
  onAutoPlayDelayChange,
  totalPages,
}: AutoPlaySectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>自動進行設定</h2>

      <p className={styles.sectionDescription}>
        自動進行時のメッセージ表示間隔を設定できます。
      </p>

      <div className={styles.autoPlayControls}>
        <NumberInputWithArrows
          id="autoplay-interval"
          label="メッセージ間隔（秒）"
          value={autoPlayDelaySeconds}
          onChange={onAutoPlayDelayChange}
          min={1}
          max={60}
          disabled={totalPages === 0}
          decreaseAriaLabel="間隔を1秒減らす"
          increaseAriaLabel="間隔を1秒増やす"
        />
      </div>
    </div>
  );
}
