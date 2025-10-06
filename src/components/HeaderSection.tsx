import styles from "./HeaderSection.module.scss";

export default function HeaderSection() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.titles}>
          <p className={styles.badge}>Slide Navi</p>
          <h1 className={styles.title}>ウーパー君発表アプリ</h1>
        </div>
      </div>
    </header>
  );
}
