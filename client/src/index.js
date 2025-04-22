// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import App from './App';
import './index.css';
import './i18n';

// point to your Stripe publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    {/* 1) Stripe context */}
    <Elements stripe={stripePromise}>

      {/* 2) PayPal context */}
      <PayPalScriptProvider
        options={{
          "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
          currency: "GBP"
        }}
      >

        {/* your entire app */}
        <App />

      </PayPalScriptProvider>
    </Elements>
  </BrowserRouter>
);
