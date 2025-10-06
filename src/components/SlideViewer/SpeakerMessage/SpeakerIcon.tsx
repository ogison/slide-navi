/* eslint-disable @next/next/no-img-element */

import styles from "./SpeakerMessage.module.scss";

type SpeakerIconProps = {
  iconSrc: string;
  speakerName: string;
};

/**
 * Component to display speaker icon and name
 * Icon changes during typing/clearing animation
 */
export default function SpeakerIcon({
  iconSrc,
  speakerName,
}: SpeakerIconProps) {
  return (
    <div className={styles.speaker}>
      <img src={iconSrc} alt="話者アイコン" className={styles.icon} />
      <span className={styles.speakerName}>{speakerName}</span>
    </div>
  );
}
