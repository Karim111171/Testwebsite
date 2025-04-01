import React from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const card = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
      },
    });

    if (error) {
      console.error(error);
    } else {
      if (paymentIntent.status === 'succeeded') {
        console.log('Payment successful!');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay</button>
    </form>
  );
};

export default CheckoutForm;
