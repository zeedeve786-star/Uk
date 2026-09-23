import styles from './Alert.module.css';

type Tone = 'info' | 'error' | 'success';

export function Alert({ tone = 'info', children }: { tone?: Tone; children: React.ReactNode }) {
  return <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>;
}