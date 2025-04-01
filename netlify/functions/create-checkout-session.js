const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports.handler = async (event) => {
  // 1. Validate HTTP Method
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: "Method Not Allowed",
      headers: { "Allow": "POST" } 
    };
  }

  try {
    // 2. Parse and validate input
    const { productId, quantity = 1 } = JSON.parse(event.body || '{}');
    if (!productId) throw new Error("Missing productId");

    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "Awesome Product" },
          unit_amount: 599,
        },
        quantity: Number(quantity) || 1,
      }],
      mode: "payment",
      success_url: `${event.headers.origin || "https://your-site.netlify.app"}/success`,
      cancel_url: `${event.headers.origin || "https://your-site.netlify.app"}/cancel`,
    });

    // 4. Return session ID
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
      headers: {
        "Access-Control-Allow-Origin": "https://magnificent-narwhal-99a642.netlify.app",
        "Content-Type": "application/json"
      }
    };

  } catch (error) {
    // 5. Error handling
    console.error("Payment Error:", error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ 
        error: error.message,
        type: error.type 
      }),
      headers: {
        "Access-Control-Allow-Origin": "https://magnificent-narwhal-99a642.netlify.app",
        "Content-Type": "application/json"
      }
    };
  }
};