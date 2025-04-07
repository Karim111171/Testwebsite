const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

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
    const deliveryFee = 300;

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

    // Fire and forget the email
    sendOrderDetailsToEmail(items, deliveryDetails)
      .catch(e => console.error("Email failed:", e));

    return { statusCode: 200, body: JSON.stringify({ id: session.id }), headers };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: error.statusCode || 500, body: JSON.stringify({ error: error.message }), headers };
  }
};

async function sendOrderDetailsToEmail(items, deliveryDetails) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: 'New Order Received',
      text: `
        New Order Details:
        -------------------
        Items:
        ${items.map(item => 
          `- ${item.name} (Quantity: ${item.quantity}, Price: ${(item.price/100).toFixed(2)} €)`
        ).join('\n')}

        Delivery Details:
        - Name: ${deliveryDetails.name}
        - Address: ${deliveryDetails.address}
        - Postal Code: ${deliveryDetails.postalCode}
        - City: ${deliveryDetails.city}
        - Email: ${deliveryDetails.email}
        - Phone: ${deliveryDetails.phone}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email failed:', error);
    throw error;
  }
}