import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Hyre",
      login: "Login",
      signup: "Signup",
      dashboard: "Dashboard",
      uploadCar: "Upload a Car",
      verifyID: "Verify ID",
      payment: "Make a Payment",
      searchCars: "Search Cars",
      carDetails: "Car Details",
      availableDates: "Available Dates",
      bookNow: "Book Now"
    }
  },
  es: {
    translation: {
      welcome: "Bienvenido a Hyre",
      login: "Iniciar sesión",
      signup: "Registrarse",
      dashboard: "Tablero",
      uploadCar: "Subir un auto",
      verifyID: "Verificar identificación",
      payment: "Realizar un pago",
      searchCars: "Buscar autos",
      carDetails: "Detalles del auto",
      availableDates: "Fechas disponibles",
      bookNow: "Reservar ahora"
    }
  },
  ar: {
    translation: {
      welcome: "مرحبا بكم في هاير",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      dashboard: "لوحة التحكم",
      uploadCar: "تحميل سيارة",
      verifyID: "التحقق من الهوية",
      payment: "إجراء الدفع",
      searchCars: "البحث عن السيارات",
      carDetails: "تفاصيل السيارة",
      availableDates: "التواريخ المتاحة",
      bookNow: "احجز الآن"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Set default language here
    interpolation: { escapeValue: false }
  });

export default i18n;
