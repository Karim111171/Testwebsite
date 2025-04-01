import React from 'react';

const ProductPage = () => {
  const handleCheckout = async () => {
    try {
      // 1. Create Checkout Session
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const { id: sessionId } = await response.json();
      
      // 2. Load Stripe only when needed
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      
      // 3. Redirect to Checkout
      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed: ' + error.message);
    }
  };

  return (
    <div className="product-page">
      <h1>Amazing Product</h1>
      <p>$5.99</p>
      <button 
        onClick={handleCheckout}
        className="checkout-button"
      >
        Buy Now
      </button>
    </div>
  );
};

export default ProductPage;