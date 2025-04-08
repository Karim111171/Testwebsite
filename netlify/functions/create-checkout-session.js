const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Email sending function (reusable)
const sendOrderEmail = async (items, deliveryDetails) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: true
  });

  await transporter.sendMail({
    from: `"Art Store" <${process.env.EMAIL_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `New Order: ${deliveryDetails.name}`,
    html: `
      <h1>New Order Received</h1>
      <h2>Customer Details</h2>
      <p><strong>Name:</strong> ${deliveryDetails.name}</p>
      <p><strong>Email:</strong> ${deliveryDetails.email}</p>
      <p><strong>Address:</strong> ${deliveryDetails.address}, ${deliveryDetails.postalCode} ${deliveryDetails.city}</p>
      
      <h2>Order Items</h2>
      <table border="1" cellpadding="5">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.price.toFixed(2)} €</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  });
};

// Stripe Checkout
module.exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': event.headers.origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }), headers };
  }

  try {
    const { items, deliveryDetails } = JSON.parse(event.body);
    const deliveryFee = 1500; // €15 in cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        ...items.map((item) => ({
          price_data: {
            currency: 'eur',
            product_data: { name: item.name || 'Unnamed Product' },
            unit_amount: item.price * 100, // Convert to cents
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
        },
      ],
      mode: 'payment',
      success_url: `${event.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/cancel`,
    });

    return { 
      statusCode: 200, 
      body: JSON.stringify({ id: session.id }), 
      headers 
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }), 
      headers 
    };
  }
};

// Export email function for success page
module.exports.sendOrderEmail = sendOrderEmail;