const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.handler = async (event) => {
 // Set CORS headers (essential for production)
 const headers = {
	'Access-Control-Allow-Origin': event.headers.origin || '*',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Content-Type': 'application/json'
    };
  
    // Handle CORS preflight request
    if (event.httpMethod === 'OPTIONS') {
	return {
	  statusCode: 200,
	  headers,
	  body: ''
	};
    }
  
	
	// 1. Validate HTTP Method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Allow': 'POST' }
    };
  }

  try {
    // 2. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Premium Plan' },
          unit_amount: 599, // €5.99
          //recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${event.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/cancel`,
	locale: 'auto'
    });

    // 3. Return session ID
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.headers.origin || '*',
      }
    };

  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ 
        error: error.message,
        type: error.type 
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.headers.origin || '*',
      }
    };
  }
};