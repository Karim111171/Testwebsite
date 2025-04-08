const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': event.headers.origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const { items, deliveryDetails } = JSON.parse(event.body);
    const deliveryFee = 1500; // €15 in cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        ...items.map(item => ({
          price_data: {
            currency: 'eur',
            product_data: { name: item.name || 'Unnamed Product' },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity || 1,
        })),
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Delivery Fee' },
            unit_amount: deliveryFee,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${event.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/cancel`,
    });

    return { statusCode: 200, headers, body: JSON.stringify({ id: session.id }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};