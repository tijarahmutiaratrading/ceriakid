import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const tierMap = {
  premium: 'premium',
  pro: 'pro',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    const data = event.data.object;

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        const subscription = data;
        const items = subscription.items.data;
        if (items.length > 0) {
          const priceId = items[0].price.id;
          
          // Determine tier from price ID
          let tier = 'free';
          if (priceId === Deno.env.get('STRIPE_PRICE_PREMIUM')) tier = 'premium';
          if (priceId === Deno.env.get('STRIPE_PRICE_PRO')) tier = 'pro';

          // Get email from metadata or customer
          let email = subscription.metadata?.base44_user_email;
          if (!email && subscription.customer) {
            const customer = await stripe.customers.retrieve(subscription.customer);
            email = customer.email;
          }

          if (email) {
            const userSubs = await base44.asServiceRole.entities.UserSubscription.filter({
              email: email,
            });

            const subData = {
              email,
              tier,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer,
              status: subscription.status === 'active' ? 'active' : 'inactive',
              currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            };

            if (userSubs.length > 0) {
              await base44.asServiceRole.entities.UserSubscription.update(
                userSubs[0].id,
                subData
              );
            } else {
              await base44.asServiceRole.entities.UserSubscription.create(subData);
            }
          }
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = data;
        let deletedEmail = deletedSub.metadata?.base44_user_email;
        if (!deletedEmail && deletedSub.customer) {
          const customer = await stripe.customers.retrieve(deletedSub.customer);
          deletedEmail = customer.email;
        }

        if (deletedEmail) {
          const userSubs = await base44.asServiceRole.entities.UserSubscription.filter({
            email: deletedEmail,
          });
          if (userSubs.length > 0) {
            await base44.asServiceRole.entities.UserSubscription.update(
              userSubs[0].id,
              { tier: 'free', status: 'canceled' }
            );
          }
        }
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});