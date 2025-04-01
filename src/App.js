import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const App = () => {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('HTTP error! Status:', response.status);
      return;
    }

    const data = await response.json();

    if (!data.sessionId) {
      console.error('Session ID not received');
      return;
    }

    stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <div>
      <h1>Amazing Product</h1>
      <p>$49.99</p>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
};

export default App;
