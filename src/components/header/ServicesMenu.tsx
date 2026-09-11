import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { siteConfig } from '../../config/site';
import styles from './ServicesMenu.module.css';

export function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        Services
        <ChevronDown
          size={14}
          className={styles.chevron}
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          aria-hidden="true"
        />
      </button>

      <ul id={menuId} role="menu" className={styles.menu} data-open={open} hidden={!open}>
        {siteConfig.services.map((s) => (
          <li key={s.href} role="none">
            <a role="menuitem" href={s.href} className={styles.menuItem} onClick={() => setOpen(false)}>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}