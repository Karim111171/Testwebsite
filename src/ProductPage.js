import React from 'react';

const ProductPage = () => {
  const handleCheckout = async () => {
    try {
      // 1. Load Stripe FIRST
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      
      if (!stripe) throw new Error('Stripe failed to initialize');

      // 2. Create Checkout Session
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const { id: sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Payment failed: ${error.message}`);
    }
  };

  return (
    <div className="product-page">
      <h1>Amazing Product</h1>
      <p>5.99 €</p>
      <button onClick={handleCheckout}>Buy Now</button>
    </div>
  );
};

export default ProductPage;