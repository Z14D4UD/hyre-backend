// client/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Log in": "Log in",
      "Sign up": "Sign up",
      "Insurance & Legal": "Insurance & Legal",
      // ... add other strings as needed
    }
  },
  ar: {
    translation: {
      "Log in": "تسجيل الدخول",
      "Sign up": "إنشاء حساب",
      "Insurance & Legal": "التأمين والقانون",
      // ... add Arabic translations
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
