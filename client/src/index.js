import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import App from './App';
import './index.css';
import './i18n';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Elements stripe={stripePromise}>
      <PayPalScriptProvider options={{
          "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
          currency: "GBP"
        }}
      >
        <App />
      </PayPalScriptProvider>
    </Elements>
  </BrowserRouter>
);
