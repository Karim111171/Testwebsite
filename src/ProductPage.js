import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);  // Clé publique Stripe
  const ProductPage = () => {
  const createCheckoutSession = async () => {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.id) {
      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise;
      stripe.redirectToCheckout({ sessionId: data.id });
    } else {
      console.error('Erreur lors de la création de la session Stripe:', data);
    }
  };

  return (
    <div>
      <h1>Product Page</h1>
      <button onClick={createCheckoutSession}>Buy Now</button>
    </div>
  );
};

export default ProductPage;
