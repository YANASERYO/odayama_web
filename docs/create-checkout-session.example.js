/*
  Node/Vercel向けの実装例です。

  使う場合:
  1. npm install stripe
  2. このファイルを api/create-checkout-session.js にコピー
  3. STRIPE_SECRET_KEY と STRIPE_PRICE_* と SITE_ORIGIN を環境変数に設定

  注意:
  金額は必ずサーバー側の PRICE_BY_ITEM_ID で確定してください。
  フロントから金額を受け取って決済金額に使わないでください。
*/

const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://example.com";

const PRICE_BY_ITEM_ID = {
  "gosyuin-tsujo": process.env.STRIPE_PRICE_GOSYUIN_TSUJO,
  "gosyuin-kisetsu": process.env.STRIPE_PRICE_GOSYUIN_KISETSU,
  "omamori-kannai": process.env.STRIPE_PRICE_OMAMORI_KANNAI,
  "omamori-kenko": process.env.STRIPE_PRICE_OMAMORI_KENKO,
  "omamori-yakuyoke": process.env.STRIPE_PRICE_OMAMORI_YAKUYOKE,
  "omamori-kotsu": process.env.STRIPE_PRICE_OMAMORI_KOTSU,
  "kiganfuda-kannai": process.env.STRIPE_PRICE_KIGANFUDA_KANNAI,
  "kiganfuda-shobai": process.env.STRIPE_PRICE_KIGANFUDA_SHOBAI,
};

const parseBody = (req) => {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  return req.body || {};
};

const normalizeQuantity = (quantity) => {
  const value = Number(quantity);

  if (!Number.isInteger(value) || value < 1) {
    return 1;
  }

  return Math.min(value, 10);
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = parseBody(req);
    const items = Array.isArray(body.items) ? body.items : [];

    const lineItems = items.map((item) => {
      const price = PRICE_BY_ITEM_ID[item.id];

      if (!price) {
        throw new Error(`Unsupported item id: ${item.id}`);
      }

      return {
        price,
        quantity: normalizeQuantity(item.quantity),
      };
    });

    if (!lineItems.length) {
      res.status(400).json({ error: "No items selected" });
      return;
    }

    const orderId = `odayama-${Date.now()}`;
    const customerEmail = body.customer && body.customer.email ? body.customer.email : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: customerEmail,
      client_reference_id: orderId,
      success_url: `${SITE_ORIGIN}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_ORIGIN}/checkout-cancel.html`,
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ["JP"],
      },
      metadata: {
        order_id: orderId,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Could not create checkout session" });
  }
};
