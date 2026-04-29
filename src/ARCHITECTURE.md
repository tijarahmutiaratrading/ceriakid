# 🏗️ Jom Belajar - Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Landing (/landing)      Pricing (/pricing)      Home (/)        │
│  ├─ Hero section         ├─ 3 tiers            ├─ Age toggle    │
│  ├─ Features             ├─ Checkout CTA       ├─ Categories    │
│  └─ CTA buttons          └─ FAQ section        └─ Language      │
│                                                                   │
│  Games (/games/:cat)     Player (/play/:c/:i)   Scoreboard      │
│  ├─ List games           ├─ Dynamic player      ├─ Scores       │
│  ├─ Filter by cat        ├─ Score tracking      ├─ Stars        │
│  └─ Difficulty           └─ Feedback overlay    └─ History      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↕ (useAuth, useLang, useAgeGroup)
┌──────────────────────────────────────────────────────────────────┐
│                    Context & State Management                     │
├──────────────────────────────────────────────────────────────────┤
│  AuthContext         LanguageContext      AgeGroupContext        │
│  ├─ user             ├─ lang (bm/en)      ├─ ageGroup            │
│  ├─ subscription     └─ toggleLang()      └─ toggleAgeGroup()    │
│  └─ isAuthenticated                                              │
└──────────────────────────────────────────────────────────────────┘
                              ↕ (API calls)
┌──────────────────────────────────────────────────────────────────┐
│                      Backend (Base44 SDK)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Auth Service          Entity Service         Function Service    │
│  ├─ base44.auth.me()   ├─ Game.list()        ├─ createCheckout   │
│  ├─ .redirectToLogin() ├─ Game.filter()      ├─ handleWebhook    │
│  └─ .updateMe()        └─ User.Subscription  └─ (custom functions)
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↕ (REST/WebSocket)
┌──────────────────────────────────────────────────────────────────┐
│                         Database                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Game Entity          SubscriptionTier      UserSubscription     │
│  ├─ id                ├─ id                 ├─ id                │
│  ├─ title             ├─ name               ├─ email             │
│  ├─ type              ├─ price              ├─ tier              │
│  ├─ category          ├─ gameLimit          ├─ status            │
│  ├─ ageGroup          └─ features           ├─ stripeCustomerId  │
│  ├─ difficulty                             └─ subscriptionDates │
│  ├─ gameData          User Entity (built-in)                     │
│  ├─ tier              ├─ id                                      │
│  └─ totalQuestions    ├─ email                                   │
│                       ├─ full_name                               │
│                       ├─ role                                    │
│                       └─ created_date                            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↕ (Stripe API)
┌──────────────────────────────────────────────────────────────────┐
│                    External Services                              │
├──────────────────────────────────────────────────────────────────┤
│  Stripe                                   Firebase/Analytics     │
│  ├─ Checkout Sessions     Webhooks        ├─ FB Pixel (optional)│
│  ├─ Customer Management   ├─ sub.created  ├─ GA (optional)      │
│  ├─ Subscriptions         ├─ sub.updated  └─ Event tracking     │
│  └─ Invoice Management    └─ sub.deleted                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Signup & Payment

```
1. LANDING PAGE
   User visits /landing
   Clicks "Lihat Paket"
   ↓
2. PRICING PAGE
   Selects Premium tier
   Clicks "Langganan Sekarang"
   ↓
3. CREATE CHECKOUT
   Function: createCheckoutSession
   ├─ Get authenticated user
   ├─ Create/get Stripe customer
   ├─ Create checkout session
   └─ Return checkout URL
   ↓
4. STRIPE CHECKOUT
   User enters payment info
   Submits
   ↓
5. PAYMENT PROCESSING
   Stripe processes payment
   Success → Webhook to backend
   ↓
6. WEBHOOK HANDLER
   Function: handleStripeWebhook
   ├─ Verify Stripe signature
   ├─ Parse subscription event
   ├─ Update UserSubscription entity
   └─ Set tier to 'premium'
   ↓
7. APP REDIRECT
   User returns to app
   Subscription status updated
   Access 100+ games
   ↓
8. USER EXPERIENCE
   Home dashboard shows all games
   Can play from all 4 categories
   Score tracking active
   Progress saved
```

---

## Component Hierarchy

```
App
├── AuthProvider (checks auth status)
│   └── AgeGroupProvider
│       └── LanguageProvider
│           └── Router
│               ├── Landing (/landing)
│               ├── Pricing (/pricing)
│               │   └── StripeCheckout
│               ├── Home (/)
│               │   ├── AgeGroupSelector
│               │   └── CategoryGrid
│               ├── GamesList (/games/:category)
│               │   └── GameCard × many
│               ├── GamePlayer (/play/:category/:index)
│               │   ├── GameHeader
│               │   ├── QuestionDisplay (dynamic)
│               │   ├── AnswerOptions
│               │   ├── FeedbackOverlay
│               │   └── ScoreScreen
│               ├── Scoreboard (/scoreboard)
│               │   ├── BestScores
│               │   └── RecentScores
│               └── PageNotFound (*)
```

---

## Data Models

### Game Object
```javascript
{
  id: "game_123",
  title: "Huruf ABC - Biru",
  type: "letter_match",
  category: "bahasa_melayu",
  ageGroup: "prasekolah",
  difficulty: "easy",
  tier: "free",
  emoji: "🔤",
  totalQuestions: 6,
  gameData: {
    questions: [
      {
        letter: "A",
        emoji: "🍎",
        word: "Epal",
        wordEN: "Apple"
      },
      // ... more questions
    ]
  },
  isPublished: true,
  order: 1,
  created_date: "2026-04-29T10:00:00Z",
  updated_date: "2026-04-29T10:00:00Z",
  created_by: "admin@jombelajar.app"
}
```

### UserSubscription Object
```javascript
{
  id: "sub_456",
  email: "parent@example.com",
  tier: "premium", // free, premium, pro
  stripeCustomerId: "cus_xxx",
  stripeSubscriptionId: "sub_xxx",
  status: "active", // active, canceled, past_due, etc
  currentPeriodStart: "2026-05-01T00:00:00Z",
  currentPeriodEnd: "2026-06-01T00:00:00Z",
  selectedAgeGroup: "prasekolah",
  created_date: "2026-04-29T10:00:00Z",
  updated_date: "2026-04-29T10:00:00Z",
  created_by: "parent@example.com"
}
```

### Game Score (localStorage)
```javascript
{
  gameType: "prasekolah-bahasa_melayu-0",
  score: 6,
  total: 8,
  stars: 3,
  date: "2026-04-29T14:30:00Z"
}
```

---

## API Endpoints

### Public Endpoints
```
GET  /landing              → Landing page
GET  /pricing              → Pricing page
GET  /games/:category      → Games list (requires auth)
```

### Backend Functions
```
POST /functions/createCheckoutSession
├─ Input: { tier, returnUrl }
├─ Output: { checkoutUrl }
└─ Returns Stripe checkout URL

POST /functions/handleStripeWebhook
├─ Input: Stripe webhook payload
├─ Events:
│  ├─ customer.subscription.created
│  ├─ customer.subscription.updated
│  └─ customer.subscription.deleted
└─ Output: { received: true }
```

### Database Queries
```
Base44.entities.Game
├─ .list()
├─ .filter({ category, ageGroup })
└─ .get(id)

Base44.entities.UserSubscription
├─ .filter({ email })
├─ .create(data)
├─ .update(id, data)
└─ .delete(id)

Base44.entities.User (built-in)
├─ .me()          → Get current user
└─ .list()        → List all users (admin)
```

---

## State Management Flow

```
┌─────────────────────────────────┐
│  AuthContext                    │
│  ├─ user: User | null           │
│  ├─ subscription: Tier string   │
│  └─ isAuthenticated: boolean    │
└──────────────┬──────────────────┘
               │
        Triggers game
        visibility based
        on user tier
               │
┌──────────────▼──────────────────┐
│  AgeGroupContext                │
│  ├─ ageGroup: "prasekolah"      │
│  │           | "sekolah_rendah" │
│  └─ toggleAgeGroup()            │
└──────────────┬──────────────────┘
               │
        Filters games
        shown to user
               │
┌──────────────▼──────────────────┐
│  LanguageContext                │
│  ├─ lang: "bm" | "en"           │
│  └─ toggleLang()                │
└──────────────┬──────────────────┘
               │
        Translates all
        UI text & game
        content
               │
┌──────────────▼──────────────────┐
│  LocalStorage                   │
│  ├─ selectedAgeGroup            │
│  ├─ selectedLanguage            │
│  ├─ gameScores[]                │
│  └─ userProgress                │
└─────────────────────────────────┘
```

---

## Payment Flow - Detailed

```
1️⃣ USER SELECTS PLAN
   Pricing page → Premium selected
   
2️⃣ CHECKOUT SESSION CREATED
   Function: createCheckoutSession
   Request: {
     tier: "premium",
     returnUrl: "https://..."
   }
   
   Processing:
   ├─ Authenticate user
   ├─ Lookup Stripe customer (or create)
   ├─ Create checkout session
   └─ Stripe generates session
   
   Response: { checkoutUrl: "stripe.com/..." }

3️⃣ USER DIRECTED TO STRIPE
   window.location.href = checkoutUrl
   
4️⃣ PAYMENT ENTRY
   Stripe hosted checkout
   User enters:
   ├─ Card number: 4242 4242 4242 4242
   ├─ Expiry: Any future date
   ├─ CVC: Any 3 digits
   └─ Email confirmation
   
5️⃣ PAYMENT PROCESSING
   Stripe validates & processes
   If successful:
   ├─ Creates subscription in Stripe
   ├─ Sends webhook to app
   └─ Redirects to success page

6️⃣ WEBHOOK RECEIVED
   Function: handleStripeWebhook
   
   Event: customer.subscription.created
   
   Processing:
   ├─ Verify webhook signature (security)
   ├─ Extract customer email
   ├─ Look up UserSubscription record
   ├─ Update with:
   │  ├─ tier: "premium"
   │  ├─ status: "active"
   │  ├─ stripeCustomerId
   │  ├─ stripeSubscriptionId
   │  └─ currentPeriodDates
   └─ Save to database

7️⃣ USER RETURNED TO APP
   App detects subscription status
   Updates:
   ├─ AuthContext.subscription = "premium"
   ├─ Shows 100+ games now visible
   └─ Scoreboard tracks progress

8️⃣ ONGOING SUBSCRIPTIONS
   Stripe handles:
   ├─ Monthly billing
   ├─ Payment retries (if failed)
   └─ Sends webhooks on:
       ├─ subscription.updated
       ├─ subscription.deleted
       └─ invoice.payment_succeeded

9️⃣ USER ACTIONS
   ├─ Cancellation → Webhook updates tier to "free"
   ├─ Renewal → Webhook confirms active status
   └─ Payment failed → Webhook sets status to "past_due"
```

---

## Security & Data Protection

### Frontend Security
```
✅ No API keys in code
✅ Auth token in secure HTTP-only cookie
✅ Stripe keys only on backend
✅ User data validated before send
✅ HTTPS only (production)
```

### Backend Security
```
✅ Webhook signature verification
   - Stripe webhook secret in env var
   - HMAC verification on signature
   - Prevents fake webhooks

✅ User authentication
   - Base44 handles token management
   - Checked on every function call
   - Prevents unauthorized access

✅ Data validation
   - Check tier matches allowed games
   - Verify user owns subscription
   - Validate game exists before play
```

### Database Security
```
✅ Entity-level access control
✅ User data isolation
✅ No passwords stored (handled by Base44)
✅ Subscription data encrypted
```

---

## Scalability Considerations

### Current Limits
- ✅ 200+ games supported
- ✅ Unlimited users
- ✅ Real-time subscription updates via webhook
- ✅ Local storage for offline access

### Future Improvements (When Needed)
- Redis cache for game list
- CDN for game media
- Database indexing on game queries
- Batch webhook processing
- User segmentation for targeted features

### Growth Plan
```
Week 1-2:  22 games live
Week 3-4:  50 games
Month 2:   100 games
Month 3:   150 games
Month 6:   200+ games
Year 1:    300+ games + features
```

---

## Monitoring & Analytics

### Built-in Tracking
```
localStorage:
├─ User progress per game
├─ Score history
├─ Star ratings
└─ User preferences

Base44 Entities:
├─ Game plays (via game creation)
├─ Subscription status
└─ User data
```

### Optional Integrations
```
Google Analytics
├─ Page views
├─ User funnels
├─ Conversion tracking
└─ Revenue tracking

Stripe Dashboard
├─ Payment volume
├─ Subscription churn
├─ Revenue by tier
└─ Failed payment tracking

Facebook Pixel
├─ Landing page views
├─ Conversion tracking
├─ Custom events
└─ Audience building
```

---

This architecture is **production-ready**, **scalable**, and **cost-effective** for a learning app serving thousands of students.