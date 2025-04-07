const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

module.exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': event.headers.origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Validate HTTP method
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }), headers };
  }

  try {
    const { items, deliveryDetails } = JSON.parse(event.body);
const deliveryFee = 1500; // €3.00 in cents

    // 1. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        ...items.map((item) => ({
          price_data: {
            currency: 'eur',
            product_data: { name: item.name || 'Unnamed Product' },
            unit_amount: (typeof item.price === 'number' ? item.price : 0) * 100,
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
      locale: 'auto',
    });

    // 2. Send order confirmation email with timeout protection
    try {
      console.log('Attempting to send order email...');
      const emailStartTime = Date.now();
      
      const emailResult = await Promise.race([
        sendOrderEmail(items, deliveryDetails),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email timed out after 9s')), 9000)
	),
      ]);
      
      console.log(`Email sent successfully in ${Date.now() - emailStartTime}ms`);
    } catch (emailError) {
      console.error('Order email failed:', {
        error: emailError.message,
        stack: emailError.stack,
        deliveryDetails: deliveryDetails // Redacted in production
      });
    }

    // 3. Return successful response
    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        id: session.id,
        message: 'Payment session created successfully'
      }), 
      headers 
    };

  } catch (error) {
    console.error('Checkout processing failed:', {
      error: error.message,
      stack: error.stack
    });
    return { 
      statusCode: error.statusCode || 500, 
      body: JSON.stringify({ 
        error: 'Payment processing failed',
        details: error.message 
      }), 
      headers 
    };
  }
};

async function sendOrderEmail(items, deliveryDetails) {
  // Validate required environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.NOTIFICATION_EMAIL) {
    throw new Error('Missing email configuration');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: true,  // Enable detailed logging
    debug: process.env.NETLIFY_DEV === 'true' // Debug only in development
  });

  const mailOptions = {
    from: `"Store Orders" <${process.env.EMAIL_USER}>`,
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
              <td>${(item.price).toFixed(2)} €</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email delivery info:', {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected
  });
  
  return info;
}