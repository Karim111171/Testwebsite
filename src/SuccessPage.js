import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const savedCart = localStorage.getItem('checkoutData');

    if (sessionId && savedCart) {
      fetch('/.netlify/functions/send-order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: savedCart
      })
      .then(() => localStorage.removeItem('checkoutData'))
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