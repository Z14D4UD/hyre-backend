import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Replace 'your_stripe_publishable_key' with your actual publishable key.
const stripePromise = loadStripe('your_stripe_publishable_key');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const amount = 10000; // Example amount in cents
    const currency = 'usd';
    try {
      // Removed the fallback to localhost
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/payments/stripe`,
        { amount, currency }
      );
      const { clientSecret } = data;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });
      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        alert('Payment succeeded!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert('Payment failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function Payment() {
  return (
    <div>
      <h2>Make a Payment</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
