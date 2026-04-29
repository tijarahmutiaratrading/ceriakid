# Jom Belajar - Feature List & Game Types

## 🎯 Core Features

### 1. **Landing Page** (`/landing`)
- Hero section with app features
- "Kenapa Pilih Jom Belajar?" benefits
- CTA to pricing page
- Footer with company info

### 2. **Pricing Page** (`/pricing`)
- 3-tier subscription model:
  - **Free**: 5 games, prasekolah only
  - **Premium**: 100+ games, both age groups (RM24.90/mo)
  - **Pro**: 200+ games, family plan (RM44.90/mo)
- Stripe integration for checkout
- FAQ section

### 3. **Home Page** (`/`)
- Age group selector (Prasekolah / Sekolah Rendah)
- Category grid (BM, EN, Math, Science)
- Language toggle (BM/EN)
- Personalized greeting when logged in

### 4. **Games System**
#### Categories:
- **Bahasa Melayu** - Letter matching, vocab, phonics
- **English** - Alphabet, sight words, phonics
- **Matematik** - Counting, addition, subtraction, shapes
- **Sains** - Animals, nature, human body, weather

#### Game Types Available:
1. `letter_match` - Find the letter
2. `number_match` - Find the number
3. `picture_quiz` - Multiple choice with images
4. `drag_drop` - Drag-and-drop matching
5. `multiple_choice` - 4-option answers
6. `counting` - Count objects
7. `word_builder` - Spell words
8. `math_puzzle` - Solve equations
9. `science_quiz` - Science facts
10. `shape_sort` - Identify shapes
11. `color_match` - Match colors
12. `pattern_fill` - Complete patterns
13. `memory_game` - Matching pairs
14. `sound_match` - Audio matching
15. `spelling` - Spell correctly
16. `reading` - Comprehension
17. `phonics` - Sound recognition

### 5. **Subscription Management**
- Free tier: 5 games access
- Premium/Pro: Full game library
- User subscription tracking
- Stripe webhook integration

### 6. **Progress Tracking**
- Score tracking per game
- Scoreboard with best & recent scores
- Star ratings (1-3 stars)
- localStorage persistence

---

## 📊 Current Game Count

### Prasekolah (Ages 3-5)
- **Bahasa Melayu**: 4 games
- **English**: 2 games
- **Matematik**: 3 games
- **Sains**: 2 games
- **Total**: 11 games

### Sekolah Rendah (Ages 6-12)
- **Bahasa Melayu**: 3 games
- **English**: 3 games
- **Matematik**: 3 games
- **Sains**: 2 games
- **Total**: 11 games

### Grand Total: **22 games** (ready for expansion to 200+)

---

## 🔄 Game Structure Example

```javascript
{
  title: 'Huruf ABC - Biru',
  type: 'letter_match',
  category: 'bahasa_melayu',
  ageGroup: 'prasekolah',
  difficulty: 'easy',
  tier: 'free', // or 'premium', 'pro'
  emoji: '🔤',
  totalQuestions: 6,
  gameData: {
    questions: [
      { letter: 'A', emoji: '🍎', word: 'Epal' },
      // ... more questions
    ]
  }
}
```

---

## 🎮 How to Add More Games

1. Edit `lib/gameLibrary.js`
2. Add game object to appropriate category:
   ```javascript
   gameLibrary.prasekolah.bahasa_melayu.push({
     title: 'New Game',
     type: 'letter_match',
     emoji: '🎮',
     difficulty: 'easy',
     gameData: { /* ... */ }
   });
   ```
3. Deploy
4. New game appears automatically in app

---

## 🔐 Payment & Tiers

### Stripe Integration Points:
1. **Pricing Page**: Select tier → `createCheckoutSession` function
2. **Webhook Handler**: `handleStripeWebhook` updates subscription status
3. **UserSubscription Entity**: Stores user's current tier & status
4. **Game Access**: Checked via user's tier before allowing play

### Tier Limits:
- **Free**: 5 games
- **Premium**: 100+ games
- **Pro**: 200+ games (family - 4 kids)

---

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly UI (large buttons)
- Works on phones, tablets, desktops
- PWA-ready (can be installed as app)

---

## 🌐 Bilingual Support

- **Bahasa Melayu** (BM) - Default
- **English** (EN) - Toggle in header
- All UI text translatable
- Game content in both languages

---

## 🚀 Ready for:

✅ Production deployment  
✅ Facebook Ads (landing page optimized)  
✅ App Store submission (PWA)  
✅ Stripe payments  
✅ 200+ games library (scalable structure)  
✅ Multi-language support  
✅ Age-group targeting  

---

**Total Build Time**: Full production app with auth, payments, 22 starter games, landing page, pricing tiers