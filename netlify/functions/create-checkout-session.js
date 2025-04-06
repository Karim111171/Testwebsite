const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer'); // For sending emails

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
    const { items, deliveryDetails } = JSON.parse(event.body); // Expect items and delivery details from the frontend

    // Add a fixed delivery fee
    const deliveryFee = 300; // Fixed delivery fee in cents (€15.00)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      lline_items: [
		...items.map((item) => ({
		    price_data: {
			  currency: 'eur',
			  product_data: { name: item.name || 'Unnamed Product' }, // Fallback for missing name
			  unit_amount: (typeof item.price === 'number' ? item.price : 0) * 100, // Fallback for missing/invalid price
		    },
		    quantity: item.quantity || 1, // Fallback for missing quantity
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

    // Send order details via email
    await sendOrderDetailsToEmail(items, deliveryDetails);

    return { statusCode: 200, body: JSON.stringify({ id: session.id }), headers };
  } catch (error) {
    console.error('Stripe error:', error);
    return { statusCode: error.statusCode || 500, body: JSON.stringify({ error: error.message }), headers };
  }
};

// Function to send order details via email
async function sendOrderDetailsToEmail(items, deliveryDetails) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL, // Your email to receive notifications
    subject: 'New Order Received',
    text: `
        New Order Details:
        -------------------
        Items:
        ${items
            .map(
                (item) =>
                    `- ${item.name} (Quantity: ${item.quantity}, Price: ${item.price.toFixed(2)} €)`
            )
            .join('\n')}

        Delivery Details:
        - Name: ${deliveryDetails.name}
        - Address: ${deliveryDetails.address}
        - Postal Code: ${deliveryDetails.postalCode}
        - City: ${deliveryDetails.city}
        - Email: ${deliveryDetails.email}
        - Phone: ${deliveryDetails.phone}
    `,
  };

  await transporter.sendMail(mailOptions);
}