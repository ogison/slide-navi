import styles from "./HeaderSection.module.scss";

export default function HeaderSection() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.titles}>
          <p className={styles.badge}>Slide Navi</p>
          <h1 className={styles.title}>プレゼンテーション補助アプリ</h1>
        </div>
        <p className={styles.tagline}>
          Next.jsのみで動作するPDFスライドビューア + メッセージウインドウ
        </p>
      </div>
    </header>
  );
}
