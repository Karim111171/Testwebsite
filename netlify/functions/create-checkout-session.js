const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': event.headers.origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Validate HTTP Method
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }), headers };
  }

  try {
    const { items } = JSON.parse(event.body); // Expect an array of items from the frontend

    // Add a fixed delivery fee
    const deliveryFee = 500; // Fixed delivery fee in cents (€5.00)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        ...items.map((item) => ({
          price_data: {
            currency: 'eur',
            product_data: { name: item.name },
            unit_amount: item.price * 100, // Convert price to cents
          },
          quantity: item.quantity,
        })),
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Delivery Fee' },
            unit_amount: deliveryFee,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${event.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/cancel`,
      locale: 'auto',
    });

    return { statusCode: 200, body: JSON.stringify({ id: session.id }), headers };
  } catch (error) {
    console.error('Stripe error:', error);
    return { statusCode: error.statusCode || 500, body: JSON.stringify({ error: error.message }), headers };
  }
};