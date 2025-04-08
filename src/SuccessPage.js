import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const savedCart = localStorage.getItem('checkoutData');

    if (sessionId && savedCart) {
      const { items, deliveryDetails } = JSON.parse(savedCart);
      
      fetch('/.netlify/functions/create-checkout-session/sendOrderEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, deliveryDetails })
      })
      .then(() => {
        localStorage.removeItem('cart');
        localStorage.removeItem('checkoutData');
      })
      .catch(console.error);
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ color: 'green' }}>Payment Successful!</h1>
      <p>Your order confirmation will be emailed shortly.</p>
    </div>
  );
};

export default SuccessPage;