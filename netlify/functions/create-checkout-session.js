const Stripe = require("stripe");

module.exports.handler = async function (event) {
  console.log("🔹 Requête reçue, vérification de la méthode HTTP...");

  if (event.httpMethod !== "POST") {
    console.log("❌ Mauvaise méthode HTTP :", event.httpMethod);
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log("✅ Méthode correcte, initialisation de Stripe...");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    console.log("🔹 Création de la session Stripe...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Awesome Product" },
            unit_amount: 599, // Price in cents (5.99 USD)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://magnificent-narwhal-99a642.netlify.app/success",
      cancel_url: "https://magnificent-narwhal-99a642.netlify.app/cancel",
    });

    console.log("✅ Session Stripe créée :", session);

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },
    };
  } catch (error) {
    console.log("❌ Erreur Stripe :", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },
    };
  }
};
