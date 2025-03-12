// client/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "header": {
        "logo": "Hyre",
        "menu": {
          "login": "Log in",
          "signup": "Sign up",
          "insuranceLegal": "Insurance & Legal"
        }
      },
      "home": {
        "hero": {
          "searchPlaceholder": "City, airport, address or hotel",
          "searchButton": "Search"
        },
        "featured": {
          "title": "Featured Businesses"
        },
        "listYourCar": {
          "title": "List Your Car",
          "description": "Earn extra income by listing your car on Hyre. Set your own rates and availability, and we'll connect you with local customers looking for the perfect ride.",
          "button": "List Your Car"
        }
      },
      "footer": {
        "copyright": "© {{year}} Hyre. All rights reserved."
      }
    }
  },
  ar: {
    translation: {
      "header": {
        "logo": "Hyre",
        "menu": {
          "login": "تسجيل الدخول",
          "signup": "إنشاء حساب",
          "insuranceLegal": "التأمين والقانون"
        }
      },
      "home": {
        "hero": {
          "searchPlaceholder": "المدينة، المطار، العنوان أو الفندق",
          "searchButton": "بحث"
        },
        "featured": {
          "title": "الشركات المميزة"
        },
        "listYourCar": {
          "title": "أدر سيارتك",
          "description": "اكسب دخلاً إضافياً عن طريق إدراج سيارتك على Hyre. حدد أسعارك وتوفر سيارتك بنفسك، وسنوصلك مع العملاء المحليين الباحثين عن السيارة المثالية.",
          "button": "أدر سيارتك"
        }
      },
      "footer": {
        "copyright": "© {{year}} Hyre. جميع الحقوق محفوظة."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['navigator', 'htmlTag', 'localStorage'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
