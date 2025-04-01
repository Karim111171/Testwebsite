import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import ReactDOM from "react-dom/client";
import App from "./App";

// 1. Load Stripe outside component to avoid recreating
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_dummyKey')
  .catch(err => {
    console.error("Stripe initialization failed:", err);
    return null;
  });

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  // 2. Wrap your app with Elements provider
  root.render(
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  );
} else {
  console.error("Root container not found");
}