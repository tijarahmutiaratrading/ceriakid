# Jom Belajar - Production Setup Guide

## 📋 Prerequisites

1. **Base44 Account** - with backend functions enabled
2. **Stripe Account** - for payments
3. **Custom Domain** - (optional but recommended for FB ads)

---

## 🔧 Step 1: Set Up Stripe Secrets

### In Stripe Dashboard:
1. Go to **Settings > API Keys**
2. Copy your **Secret Key** (starts with `sk_`)
3. Go to **Products**, create 2 subscription products:
   - **Premium** - $4.99/month
   - **Pro** - $8.99/month
4. Get the **Price IDs** for each

### In Base44 Dashboard:
1. Go to **Settings > Environment Variables**
2. Add these secrets:
   ```
   STRIPE_SECRET_KEY = sk_xxx...
   STRIPE_PRICE_PREMIUM = price_xxx...
   STRIPE_PRICE_PRO = price_xxx...
   STRIPE_WEBHOOK_SECRET = whsec_xxx...
   ```

### Set up Stripe Webhook:
1. In Stripe > **Webhooks**
2. Add endpoint: `https://your-app-url/api/functions/handleStripeWebhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret and add as `STRIPE_WEBHOOK_SECRET`

---

## 📱 Step 2: Deploy App

1. Push code to GitHub/GitLab
2. In Base44 Dashboard:
   - Connect GitHub repo
   - Deploy to production
   - Set custom domain (if have one)

---

## 🎮 Step 3: Initialize Games & Tiers

Run these in Base44 Dashboard > Code > Functions:

### Create Subscription Tiers:
```javascript
// In Base44 Console
const tiers = [
  {
    name: 'free',
    priceUSD: 0,
    priceMYR: 0,
    description: 'Percuma - 5 Permainan',
    gameLimit: 5,
    features: ['5 permainan gratis', 'Prasekolah saja'],
  },
  {
    name: 'premium',
    priceUSD: 4.99,
    priceMYR: 24.90,
    description: 'Premium - 100+ Permainan',
    gameLimit: 100,
    features: ['100+ permainan', 'Prasekolah & Sekolah Rendah'],
  },
  {
    name: 'pro',
    priceUSD: 8.99,
    priceMYR: 44.90,
    description: 'Pro - 200+ Permainan',
    gameLimit: 200,
    features: ['200+ permainan', 'Untuk 4 anak'],
  },
];

await Promise.all(
  tiers.map(t => base44.entities.SubscriptionTier.create(t))
);
```

---

## 📢 Step 4: Facebook Ads Setup

### Create Landing Page Ad:
1. Go to **Meta Business Suite > Ads Manager**
2. Create Campaign > **Traffic** objective
3. Target: Parents, Malaysia, ages 25-50
4. Landing page: `https://your-domain.com/landing` or `/pricing`
5. Budget: Start with RM100/day

### Ad Copy Ideas:
```
🎓 Jom Belajar - 200+ Permainan Pembelajaran!

Anak-anak suka bermain, anak-anak belajar!
✅ Permainan seru untuk anak 3-12 tahun
✅ Bahasa Melayu & Inggeris
✅ Matematik & Sains
✅ Tanpa iklan & aman
✅ Langganan hanya RM24.90/bulan

Mulai percubaan gratis hari ini!
```

---

## 🎯 Step 5: Analytics & Monitoring

### Google Analytics (optional):
Add to index.html `<head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXX');
</script>
```

### Track conversions in Pricing.jsx:
```javascript
// After successful subscription
gtag('event', 'purchase', {
  value: price,
  currency: 'USD',
  items: [{ item_name: tier }]
});
```

---

## 📈 Scaling to 200 Games

### Current Structure:
- 20-30 games per category per age group
- Total: ~25 games × 2 age groups × 4 categories = 200 games

### To add more games:
1. Update `lib/gameLibrary.js` with more entries
2. Each game needs:
   - `title`, `type`, `emoji`, `difficulty`
   - `gameData` (questions, options, etc.)
3. Deploy update

### For 200+ games, consider:
- Database-backed game system (store games in Base44 entities)
- Admin panel for creating/managing games
- Random game selection algorithm

---

## 🔐 Security Checklist

- [ ] Stripe keys stored as secrets (not in code)
- [ ] Webhook signature verification enabled
- [ ] Rate limiting on subscription endpoints
- [ ] User data encrypted
- [ ] HTTPS only
- [ ] Custom domain set up
- [ ] Privacy policy & terms at `/privacy` and `/terms`

---

## 💰 Monetization Tips

1. **Facebook Ads**: Target parents in Malaysia, Singapore, Indonesia
2. **Landing Page**: Focus on benefits (learning outcomes, safety)
3. **Free Tier**: Hook users with 5 games, convert with premium
4. **Retention**: Weekly new games keep users subscribed
5. **Referral**: Add "Refer a friend" feature for viral growth

---

## 📞 Support

For issues:
1. Check Base44 docs at docs.base44.com
2. Stripe support at stripe.com/support
3. Test webhook at dashboard.stripe.com > Webhooks

---

**Last Updated:** April 2026