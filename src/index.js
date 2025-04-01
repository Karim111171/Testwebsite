import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize Stripe once
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY)
  .catch(err => {
    console.error("Stripe initialization failed:", err);
    return null;
  });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);