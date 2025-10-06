import { ChangeEvent } from "react";
import styles from "./ControlsPanel.module.scss";

type PdfUploadSectionProps = {
  onPdfUpload: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function PdfUploadSection({
  onPdfUpload,
}: PdfUploadSectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>スライドの読み込み</h2>

      <p className={styles.sectionDescription}>
        PowerPointはPDFに書き出してからアップロードしてください。
      </p>

      <label className={styles.fileDrop} htmlFor="pdf-upload">
        <span className={styles.fileDropPrimary}>PDFファイルを選択</span>

        <span className={styles.fileDropSecondary}>クリックして開く</span>

        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className={styles.fileInput}
          onChange={onPdfUpload}
        />
      </label>
    </div>
  );
}
