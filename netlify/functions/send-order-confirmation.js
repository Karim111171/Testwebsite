const nodemailer = require('nodemailer');

module.exports.handler = async (event) => {
  try {
    const { items, deliveryDetails } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    await transporter.sendMail({
      from: `"Art Store" <${process.env.EMAIL_USER}>`,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `New Order: ${deliveryDetails.name}`,
      html: `
        <h1>New Order Received</h1>
        <p><strong>Customer:</strong> ${deliveryDetails.name}</p>
        <p><strong>Address:</strong> ${deliveryDetails.address}, ${deliveryDetails.postalCode} ${deliveryDetails.city}</p>
        <h2>Items:</h2>
        <ul>
          ${items.map(item => `
            <li>${item.name} (${item.quantity} × ${item.price.toFixed(2)}€)</li>
          `).join('')}
        </ul>
      `
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};