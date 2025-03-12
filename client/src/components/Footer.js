// client/src/components/Footer.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Home.module.css';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
