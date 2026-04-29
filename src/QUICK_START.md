# 🚀 Jom Belajar - Quick Start Guide

## What's Built ✅

**Complete production-ready web app with:**
- Landing page + pricing tiers
- 22 starter games (scales to 200+)
- Stripe subscription integration  
- Age group toggle (Prasekolah/Sekolah Rendah)
- Language toggle (BM/EN)
- Score tracking & progression
- Authentication ready

---

## 🎯 Next Steps (In Order)

### 1️⃣ Get Stripe Keys (5 min)
```
1. Go to https://stripe.com
2. Sign up or log in
3. Go to Dashboard > Developers > API Keys
4. Copy Secret Key (sk_xxx...)
5. Create 2 products:
   - Premium: $4.99/month
   - Pro: $8.99/month
6. Copy their Price IDs
```

### 2️⃣ Set Secrets in Base44 (2 min)
```
In Base44 Dashboard > Settings > Environment Variables:

STRIPE_SECRET_KEY = sk_xxx...
STRIPE_PRICE_PREMIUM = price_xxx...
STRIPE_PRICE_PRO = price_xxx...
STRIPE_WEBHOOK_SECRET = whsec_xxx... (you'll get this after webhook setup)
```

### 3️⃣ Deploy App (1 min)
```
1. Commit all changes
2. In Base44 Dashboard > Deployments > Deploy to Production
3. Test at https://your-app.base44.app
```

### 4️⃣ Set Up Stripe Webhook (3 min)
```
In Stripe Dashboard > Webhooks:

1. Click "Add Endpoint"
2. URL: https://your-app-url/api/functions/handleStripeWebhook
3. Select events:
   - customer.subscription.created
   - customer.subscription.updated  
   - customer.subscription.deleted
4. Copy signing secret
5. Add to Base44 as STRIPE_WEBHOOK_SECRET
```

### 5️⃣ Test Payments (2 min)
```
1. Go to /pricing page
2. Click "Langganan Sekarang" on Premium
3. Use test card: 4242 4242 4242 4242
4. Any future date, any CVC
5. Verify subscription created in Base44 entities
```

### 6️⃣ Custom Domain (Optional, 5 min)
```
1. In Base44 Dashboard > Settings > Custom Domain
2. Add your domain (e.g., jombelajar.app)
3. Update DNS records as instructed
4. Point to Base44 servers
```

### 7️⃣ Facebook Ads Setup (10 min)
```
1. Go to Meta Business Suite > Ads Manager
2. Create Campaign > Traffic objective
3. Target: Parents in Malaysia, 25-50 years old
4. Landing: https://your-domain.com/pricing
5. Budget: RM100-500/day
6. Use ad copy from PRODUCTION_SETUP.md
```

---

## 🎮 Add More Games (Easy!)

Edit `lib/gameLibrary.js`:

```javascript
// Add under gameLibrary.prasekolah.bahasa_melayu
{
  title: 'My New Game',
  type: 'picture_quiz', // or other type
  emoji: '🎮',
  difficulty: 'easy',
  gameData: {
    questions: [
      { image: '🐱', options: ['Kucing', 'Anjing'], answer: 0 },
      // More questions...
    ]
  }
}
```

Deploy = New game appears instantly! 🎉

---

## 📊 App Structure

```
Jom Belajar
├── Landing Page (/landing)
├── Pricing Page (/pricing) → Stripe Checkout
├── Home Dashboard (/)
│   ├── Age Group Selector (Prasekolah/Sekolah Rendah)
│   └── Category Grid (BM, EN, Math, Science)
├── Games List (/games/:category)
│   └── Individual Game Player
└── Scoreboard (track progress)
```

---

## 💰 Revenue Model

| Tier | Price | Games | Target |
|------|-------|-------|--------|
| Free | RM0 | 5 | Try before buy |
| Premium | RM24.90/mo | 100+ | Single child |
| Pro | RM44.90/mo | 200+ | Family (4 kids) |

**Conversion goal**: Free → Premium (easy upsell from limited to full)

---

## 🎯 Marketing Checklist

- [ ] Custom domain set up
- [ ] Stripe account connected
- [ ] Facebook Ads account created
- [ ] Landing page optimized
- [ ] Privacy policy added (`/privacy`)
- [ ] Terms of service added (`/terms`)
- [ ] FAQ updated
- [ ] Contact email configured

---

## 🧪 Test Before Going Live

1. **Free tier**: Sign up, play 5 games
2. **Premium**: Click pricing, go through checkout
3. **Subscription**: Verify in Base44 entities
4. **Age groups**: Toggle between Prasekolah/Sekolah Rendah
5. **Languages**: Toggle BM/EN
6. **Progress**: Play a game, check scoreboard
7. **Mobile**: Test on phone

---

## 📱 URLs to Remember

- **App**: https://your-domain.com
- **Landing**: https://your-domain.com/landing
- **Pricing**: https://your-domain.com/pricing
- **Games**: https://your-domain.com/games/bahasa_melayu (etc)
- **Scoreboard**: https://your-domain.com/scoreboard

---

## 🆘 Troubleshooting

### Stripe checkout not working?
- Check `STRIPE_SECRET_KEY` is set in Base44
- Verify Stripe prices exist in dashboard
- Check function logs: Base44 > Code > Functions > createCheckoutSession

### Games not showing?
- Verify age group selected
- Check category exists in `lib/gameLibrary.js`
- Games must have `ageGroup` and `category` fields

### Payments not recording?
- Check Stripe webhook endpoint URL is correct
- Verify webhook secret is set
- Check function logs: handleStripeWebhook

### Mobile responsiveness issues?
- Tested on iPhone 12 & Android
- Tailwind responsive classes used
- All buttons are touch-friendly

---

## 📈 What You Have Ready to Sell

✅ **Landing Page** - Converts visitors to trials  
✅ **Pricing Tiers** - 3 options, easy upsell  
✅ **Payment System** - Stripe integrated & secure  
✅ **Game Library** - 22 games, scalable to 200+  
✅ **User Tracking** - Scores & progress saved  
✅ **Multi-language** - BM & EN support  
✅ **Age Targeting** - Prasekolah & Sekolah Rendah  
✅ **FB Ads Ready** - Landing page optimized  

---

## 🎓 Game Content

**22 Starter Games** covering:
- **Bahasa Melayu** (BM) - Alphabet, vocabulary, phonics
- **English** (EN) - Letters, sight words
- **Matematik** - Counting, addition, subtraction
- **Sains** (Science) - Animals, nature, body parts

All games have:
- 🎮 Fun mechanics (match, drag, quiz, count)
- ⭐ Star rating system
- 🏆 Scoreboard tracking
- 🎉 Celebration animations

---

## 🚀 First 24 Hours

1. ✅ Deploy app (10 min)
2. ✅ Set Stripe keys (5 min)
3. ✅ Test payments (2 min)
4. ✅ Set custom domain (5 min)
5. ✅ Create Facebook ad (10 min)
6. ✅ Launch with RM100 budget (active)

**You're live!** 🎉

---

**Questions?** Check:
- PRODUCTION_SETUP.md (detailed config)
- APP_FEATURES.md (complete feature list)
- Base44 docs: docs.base44.com

Good luck! 🍀