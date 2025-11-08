import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

const EU_UK_COUNTRIES = [
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','GB'
];

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (!STRIPE_SECRET_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }) };
  }
  try {
    const origin = (event.headers?.origin || event.headers?.Origin || 'https://example.com') as string;
    const body = JSON.parse(event.body || '{}');
    const currency = (body.currency === 'GBP' ? 'GBP' : 'EUR') as 'EUR' | 'GBP';
    const items = Array.isArray(body.items) ? body.items : [];

    const line_items = (items.length ? items : [
      { price_data: { currency: currency.toLowerCase(), product_data: { name: 'HIDDN Testprodukt' }, unit_amount: 2500 }, quantity: 1 }
    ]).map((it: any) => ({
      price_data: it.price ? undefined : {
        currency: (it.price_data?.currency || currency).toLowerCase(),
        product_data: it.price_data?.product_data || { name: it.title || 'Item' },
        unit_amount: it.price_data?.unit_amount ?? Math.max(100, Math.floor((it.unit_amount ?? it.amount ?? 100) as number))
      },
      price: it.price,
      quantity: it.quantity ?? 1
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: currency.toLowerCase() as any,
      line_items,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order/cancel`,
      automatic_tax: { enabled: true },
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: EU_UK_COUNTRIES as any },
      allow_promotion_codes: true,
    });

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: session.id, url: session.url }) };
  } catch (err: any) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err?.message || 'Stripe error' }) };
  }
};
