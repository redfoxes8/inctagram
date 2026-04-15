import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className="h1">h1</h1>
      <p className="large">large</p>
      <p className="regular_text_16">regular_text_16</p>
      <p className={`medium_text_14 ${styles.mediumText}`}>medium_text_14 with accent 500</p>
      <a className="regular_link">Regular-Link</a>
    </div>
  )
}
