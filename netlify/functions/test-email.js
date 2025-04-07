const nodemailer = require('nodemailer');

module.exports.handler = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    logger: true
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL,
    subject: 'TEST EMAIL',
    text: 'This is a test email from Netlify Functions'
  });

  return { statusCode: 200, body: "Test email sent!" };
};