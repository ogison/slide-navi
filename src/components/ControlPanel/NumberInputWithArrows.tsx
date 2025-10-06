import { ChangeEvent } from "react";
import styles from "./ControlsPanel.module.scss";

type NumberInputWithArrowsProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  decreaseAriaLabel?: string;
  increaseAriaLabel?: string;
};

export default function NumberInputWithArrows({
  id,
  label,
  value,
  onChange,
  min = 1,
  max = 60,
  disabled = false,
  decreaseAriaLabel = "減らす",
  increaseAriaLabel = "増やす",
}: NumberInputWithArrowsProps) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);

    if (Number.isNaN(nextValue)) {
      return;
    }

    const sanitizedValue = Math.max(min, Math.floor(nextValue));
    onChange(sanitizedValue);
  };

  const handleIncrease = () => {
    const nextValue = Math.min(value + 1, max);
    onChange(nextValue);
  };

  const handleDecrease = () => {
    const nextValue = Math.max(value - 1, min);
    onChange(nextValue);
  };

  return (
    <div className={styles.autoPlayInputGroup}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>

      <div className={styles.numberInputWithArrows}>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={handleDecrease}
          disabled={disabled || value <= min}
          aria-label={decreaseAriaLabel}
        >
          -
        </button>

        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          className={styles.numberInput}
          disabled={disabled}
        />

        <button
          type="button"
          className={styles.arrowButton}
          onClick={handleIncrease}
          disabled={disabled || value >= max}
          aria-label={increaseAriaLabel}
        >
          +
        </button>
      </div>
    </div>
  );
}
