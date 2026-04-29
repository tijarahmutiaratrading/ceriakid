import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const tiers = {
  free: null,
  premium: Deno.env.get('STRIPE_PRICE_PREMIUM'),
  pro: Deno.env.get('STRIPE_PRICE_PRO'),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, returnUrl } = await req.json();

    // Free tier doesn't need checkout
    if (tier === 'free') {
      const userSubs = await base44.asServiceRole.entities.UserSubscription.filter({
        email: user.email,
      });

      if (userSubs.length === 0) {
        await base44.asServiceRole.entities.UserSubscription.create({
          email: user.email,
          tier: 'free',
          status: 'active',
          selectedAgeGroup: 'prasekolah',
        });
      } else {
        await base44.asServiceRole.entities.UserSubscription.update(userSubs[0].id, {
          tier: 'free',
          status: 'active',
        });
      }

      return Response.json({ success: true, redirectUrl: '/' });
    }

    const priceId = tiers[tier];
    if (!priceId) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Get or create Stripe customer
    let customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { base44_user_id: user.id },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
      metadata: {
        base44_user_email: user.email,
        tier: tier,
      },
    });

    return Response.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});