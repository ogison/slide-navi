import styles from "./SpeakerMessage.module.scss";

type MessageDisplayProps = {
  lines: string[];
};

/**
 * Component to display message text lines
 * Each line is rendered as a separate paragraph
 */
export default function MessageDisplay({ lines }: MessageDisplayProps) {
  return (
    <div className={styles.message}>
      {lines.map((line, index) => (
        <p key={index} className={styles.messageLine}>
          {line}
        </p>
      ))}
    </div>
  );
}
