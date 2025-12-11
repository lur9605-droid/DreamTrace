import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>梦境迷失了方向</h2>
      <p className={styles.description}>
        您访问的页面似乎不存在，就像一个醒来就忘记的梦。
      </p>
      <Link href="/" className={styles.homeLink}>
        返回首页
      </Link>
    </div>

  );
}
