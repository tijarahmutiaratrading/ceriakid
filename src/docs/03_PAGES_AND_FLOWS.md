# 📄 Pages & User Flows — Frontend Guide

> Complete navigation, page structure, and user journey documentation.

---

## 🗺️ Route Map (from `App.jsx`)

### 🌐 Public Pages (no auth required)
```
/                    Landing                Main landing page
/terms               Terms                  Terms of service
/privacy             Privacy                Privacy policy
/contact             Contact                Contact form
/thank-you           ThankYou               Post-purchase thank you
```

### 🔐 Authenticated Pages (with sidebar/drawer)
```
/dashboard           Home                   Main dashboard
/settings            ClientDashboard        Account settings
/children-profiles   ChildrenProfiles       Family management
/games-hub           GamesHub               Browse games
/games-subjek        GamesSubjek            Browse by subject
/kafa                KafaHub                KAFA religious content
/games/:category     GamesList              Games in category
/mini-games/:type    MiniGamesList          Mini games browser
/parent-dashboard    ParentDashboard        Child analytics
/friends             FriendsList            Friend system
/challenges          Challenges             1-on-1 challenges
/scoreboard          Scoreboard             Leaderboard
/buy-credits         BuyCredits             Credit shop
/syllabus            Syllabus               Curriculum reference
/ai-assistant        AIAssistant            Cikgu Firdaus (Tutor)
/story-generator     StoryGenerator         Cikgu Mira (Stories)
/bbm-generator       BBMGenerator           Cikgu Daniel (Materials)
/quiz-ai             QuizAI                 Cikgu Rosie (Quiz)
/affiliate           Affiliate              Affiliate program
```

### 🎮 Game/Fullscreen Pages (no sidebar)
```
/drawing                          DrawingStudio
/story-kid                        StoryKid
/mini-games/:catId/play/:gameId   MiniGamePlayground
/play/:category/:index            GamePlayer
/abc                              ABCGame
/numbers                          NumberGame
/quiz                             QuizGame
/shapes                           ShapesGame
/games/memory                     MemoryGame
/games/dragdrop                   DragDropGame
/games/wordbuilder                WordBuilderGame
/games/sorting                    SortingGame
/games/tilematch                  TileMatchGame
/games/story                      StoryAdventureGame
/games/physics                    PhysicsGame
/games/tracing                    TracingGameGamified
```

### ⚙️ Admin Pages (admin role required)
```
/admin-dashboard     AdminDashboard         Main admin panel
/game-analytics      GameAnalytics          Game stats
/game-database       GameDatabase           Game CRUD
```

---

## 🎯 Page Details

### 1. **Landing (`/`)** — Public Marketing Page

**Purpose:** Convert visitors → sign up → paying customers

**Key sections:**
- Hero carousel (rotating value props)
- Trusted marquee (logos/credibility)
- Feature showcase (games, AI, parental tools)
- AI section (highlight 4 Cikgu)
- Pricing table (5 tiers)
- Live social proof (recent signups)
- Testimonials
- FAQ
- Footer CTA
- Exit intent popup

**Components used:**
- `LandingHeroCarousel`
- `TrustedMarquee`
- `LandingAISection`
- `AppPreviewShowcase`
- `LiveSocialProof`
- `ExitIntentPopup`
- `PricingCheckout`

**Tracking:** Facebook Pixel events on scroll, click pricing, checkout intent.

---

### 2. **Home/Dashboard (`/dashboard`)** — Logged-in Home

**Purpose:** Hub utama untuk authenticated users

**Sections:**
- Hero (welcome + active child profile)
- Quick access grid (top features)
- Category grid (game subjects)
- Daily challenge
- AI hub card
- PWA install guide (if not installed)

**Components:**
- `AppleFitnessHero` — Hero card
- `QuickAccessGrid`
- `CategoryGrid`
- `DailyChallenge`
- `AIHubCard`
- `InstallAppGuide`

**Data fetched:**
- Current user, subscription tier
- Selected child + progress
- Today's daily challenge
- Recent activity

---

### 3. **ClientDashboard (`/settings`)** — Account Settings

**Purpose:** User profile, subscription, billing, devices

**Sections:**
- Profile hero (avatar, name, email)
- Personal info form (editable)
- Subscription widget (current tier, expiry)
- Upgrade card (if free tier)
- Payment history (CHIP transactions)
- Device management
- Push notification toggle
- Offline mode card

**Components:**
- `SettingsHero`, `PersonalInfoCard`
- `SubscriptionWidget`, `UpgradeTierCard`
- `PaymentHistory`, `ManageDevices`
- `OfflineModeCard`
- `SubscriptionExpiryBanner`

**Avatar upload:** UploadFile → save to user record

---

### 4. **ChildrenProfiles (`/children-profiles`)** — Family Management

**Purpose:** Add/edit/delete child profiles

**Sections:**
- Family hero card (total children, stats)
- Existing child profiles (cards)
- Add child form
- Subscription tier limits

**Components:**
- `FamilyHeroCard`
- `ChildProfileCard` (per child)
- `AddChildCard` / `DeleteChildDialog`
- `AvatarPresetPicker`

**Logic:**
- Free tier: 1 child
- Asas: 2, Standard: 3, Keluarga: 5, Premium: unlimited

---

### 5. **GamesHub (`/games-hub`)** — Browse All Games

**Purpose:** Visual browser untuk semua game categories

**Layout:** Grid cards untuk setiap category dengan icons + descriptions

**Categories shown:**
- Subjects (BM, English, Math, Science, Jawi, Tamil, Mandarin)
- Mini games (Memory, Logic, Speed, Pattern, Maze, etc.)
- KAFA (religious content)

---

### 6. **GamesSubjek (`/games-subjek`)** — Subject-based Browser

**Purpose:** Browse games organized by curriculum subject

**Filter by:**
- Age group (Prasekolah / Sekolah Rendah)
- Darjah (1-6) — for Sekolah Rendah
- Subject

---

### 7. **KafaHub (`/kafa`)** — KAFA Religious Content

**Purpose:** Dedicated section for UPKK religious curriculum

**7 subjects:** Al-Quran, Jawi, Akidah, Ibadah, Sirah, Adab, Bahasa Arab

---

### 8. **GamePlayer (`/play/:category/:index`)** — Core Game Player

**Purpose:** Render games dari Game entity

**Flow:**
```
1. Load game data dari Game entity by category + index
2. Show GameTutorial (first time)
3. Display QuestionRenderer (per question type)
4. Track answers, calculate score + stars
5. Show ScoreScreen
6. Save ChildGameProgress
7. Update Leaderboard
8. Check Achievement unlocks
9. Show ReviewPromptModal (after N games)
```

**Components:**
- `GameLoadingScreen`
- `GameHeader` (progress bar, exit)
- `QuestionRenderer` (handles all question types)
- `FeedbackOverlay` (correct/wrong)
- `ScoreScreen` (final stars + share)

**Game types supported:**
- Multiple choice, letter match, number match
- Drag drop, sorting, tile match
- Tracing, drawing
- Memory game, physics game
- Story adventure

---

### 9. **AIAssistant (`/ai-assistant`)** — Cikgu Firdaus

**Purpose:** AI Tutor (conversational learning)

**Sections:**
- Chat library (left)
- Chat window (right)
- Subject + level picker
- Voice input (transcribe)
- Credit balance widget

**Backend:** `askAIAssistant` function → InvokeLLM → deduct credits

**Components:**
- `MyChatLibrary`
- `AIChatMessage`
- `AIBackButton`

---

### 10. **QuizAI (`/quiz-ai`)** — Cikgu Rosie

**Purpose:** AI-generated quiz questions

**Flow:**
```
1. Pick subject, level, difficulty, topic
2. Generate quiz via generateQuizQuestion
3. Show QuizQuestionCard
4. User answer → save to QuizHistory
5. Show explanation, encouragement
6. Generate next
```

---

### 11. **StoryGenerator (`/story-generator`)** — Cikgu Mira

**Purpose:** Generate custom children stories

**Inputs:**
- Theme, child name, age range
- Moral lesson, length

**Flow:**
```
1. Fill form → submit
2. generateAIStory function → InvokeLLM + GenerateImage
3. Save to AIStory entity
4. Display with cover image + audio narration option
```

**Components:**
- `MyStoryLibrary`
- `StorySlideVisual`
- `StoryAudioPlayer`

---

### 12. **BBMGenerator (`/bbm-generator`)** — Cikgu Daniel

**Purpose:** Generate printable teaching materials

**Outputs HTML content** that can be printed/saved as PDF.

**Components:**
- `MyBBMLibrary`
- `BBMCard`, `BBMFilterBar`
- `PremiumBBMPreview`

---

### 13. **ParentDashboard (`/parent-dashboard`)** — Child Analytics

**Purpose:** Parent view of child progress

**Sections per child:**
- Snapshot card (stars, games, streak)
- Subject progress
- Activity sparkline (last 7 days)
- Recent activity
- Insights (AI-generated)
- Action items (recommendations)
- Sibling compare strip

**Components:**
- `ChildSnapshotCard`
- `ChildSubjectProgress`
- `ActivitySparkline`
- `RecentActivity`
- `InsightsCard`
- `ActionItemsCard`
- `SiblingCompareStrip`
- `ShareSheet` (share progress)

---

### 14. **FriendsList (`/friends`)** — Social

**Purpose:** Manage friends + invite codes

**Features:**
- Generate invite code
- Accept incoming requests
- Block/remove friends
- Send challenges

---

### 15. **Challenges (`/challenges`)** — 1-on-1 Battles

**Purpose:** Compete with friends

**Flow:**
```
1. Pick friend + game category
2. Create FriendChallenge (status: pending)
3. Notify friend (push + email)
4. Friend accepts → status: active
5. Both play → compare scores
6. Status: completed → winner declared
```

---

### 16. **Scoreboard (`/scoreboard`)** — Leaderboard

**Purpose:** Family + global rankings

**Tabs:**
- Family (own children)
- Friends
- Global (top users)

---

### 17. **BuyCredits (`/buy-credits`)** — Credit Shop

**Purpose:** Top up AI credits

**Packages:** Defined in `lib/creditPackages.js`

**Flow:**
```
1. Pick package → chipCreditCheckout function
2. Redirect to CHIP payment
3. Webhook updates UserCredit balance
4. Create CreditTransaction record
```

---

### 18. **Affiliate (`/affiliate`)** — Referral Program

**Purpose:** Earn commissions by referring users

**Sections:**
- Hero (stats)
- Stats grid (referrals, earnings, pending)
- Tier card (Bronze/Silver/Gold/Platinum)
- Referral list
- Payout list
- Bank details form
- Share card (referral code)

**Components:**
- `AffiliateHero`, `AffiliateStatsGrid`
- `AffiliateTierCard`
- `AffiliateReferralList`, `AffiliatePayoutList`
- `AffiliateBankForm`, `AffiliateRegisterForm`
- `ReferralShareCard`

---

### 19. **DrawingStudio (`/drawing`)** — Creative Tool

**Purpose:** Free drawing canvas + tracing exercises

**Features:**
- Color picker, brush sizes
- Tracing templates (letters, shapes)
- Save to gallery (localStorage)
- Sparkle effects on draw
- Celebration animations

**Components:**
- `CanvasFloatingToolbar`, `ApplePanel`
- `MyArtGallery`, `SparkleTrail`
- `TracingCanvas`, `TracingCelebration`
- `CustomColorPicker`

---

### 20. **StoryKid (`/story-kid`)** — Interactive Stories

**Purpose:** Read pre-made + AI-generated stories

**Features:**
- Story selection
- Slide-based reading
- Audio narration
- Visual illustrations

---

### 21. **MiniGamePlayground (`/mini-games/:catId/play/:gameId`)**

**Purpose:** Mini game player (Brain Training games)

**Categories:**
- Memory Master, Logic Puzzles, Speed & Focus
- Pattern Genius, Maze Adventure, Creative Builder
- Problem Solver, Brain Training

**Components:**
- `MiniGameMascot`, `MiniGameModeRenderer`
- `ProMiniGameShell`, `MiniFeedback`
- `GeneratedMiniGamePlayer`

---

### 22-25. **Admin Pages**

#### AdminDashboard (`/admin-dashboard`)
Tabs:
- Analytics, Game Manager, System Health, Settings
- Customer Database, Affiliate Panel
- Push Notifications, Launch Control
- Quality Control, Master Generator

#### GameAnalytics (`/game-analytics`)
Stats per game, popularity, completion rates

#### GameDatabase (`/game-database`)
CRUD interface for Game entity

---

## 🧩 Layout Architecture

### Root Wrapper (App.jsx):
```jsx
<ErrorBoundary>
  <Router>
    <QueryClientProvider>
      <AuthProvider>
        <OfflineBanner />
        <SelectedChildProvider>
          <LanguageProvider>
            <AgeGroupProvider>
              <Routes>...</Routes>
            </AgeGroupProvider>
          </LanguageProvider>
        </SelectedChildProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Router>
</ErrorBoundary>
```

### Authenticated Layout (`components/AppLayout`):
```jsx
<div>
  <AppHeader />          {/* Mobile: drawer; Desktop: top bar */}
  <UserSidebar />        {/* Desktop only */}
  <main>
    <Outlet />           {/* Page content */}
  </main>
  <BottomNavigation />   {/* Mobile only */}
</div>
```

### Admin Layout:
- `AdminTopHeader`
- `AdminSidebar`
- `AdminGuard` (role check)

---

## 🎨 Design System

### Theme Variables (`index.css`):
```css
--game-yellow: 45 95% 55%
--game-pink: 340 80% 65%
--game-blue: 200 85% 58%
--game-green: 145 65% 48%
--game-purple: 280 60% 55%
--game-orange: 25 95% 58%
--game-red: 0 75% 58%
```

### Font:
- Family: Nunito (300-900 weights)
- Var: `var(--font-nunito)`

### Utility Classes:
- `.clay`, `.clay-button`, `.clay-pressed` — Claymorphism
- `.pro-glass`, `.pro-card` — Glassmorphism
- `.safe-page` — Padding wrapper
- `.bg-pattern` — Decorative bg

---

## 🔄 State Management

### Global Contexts:
- `AuthContext` — User, auth state, login/logout
- `SelectedChildContext` — Currently active child
- `LanguageContext` — BM/EN toggle
- `AgeGroupContext` — Prasekolah / Sekolah Rendah

### Server State:
- **TanStack Query** untuk caching API calls
- Defined in `lib/query-client.js`

### Local State:
- React hooks (`useState`, `useReducer`)
- `localStorage` untuk:
  - Pinned menu items
  - Offline sync queue
  - Drawing gallery
  - Game progress (offline)

---

## 🚀 Performance Optimizations

- ✅ Lazy loading (most pages via `React.lazy`)
- ✅ Code splitting (Vite auto)
- ✅ Image lazy loading
- ✅ Service worker caching (PWA)
- ✅ TanStack Query caching
- ✅ Suspense + ErrorBoundary per route

---

> Next: Read `04_BACKEND_AND_AUTOMATIONS.md` untuk backend logic.