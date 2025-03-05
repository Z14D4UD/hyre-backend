import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <nav>
        <Link to="/login">{t('login')}</Link> |{' '}
        <Link to="/signup">{t('signup')}</Link> |{' '}
        <Link to="/search">{t('searchCars')}</Link>
      </nav>
    </div>
  );
}
