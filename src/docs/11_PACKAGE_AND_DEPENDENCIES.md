# 📦 Package Dependencies & Project Setup

> Exact dependencies needed untuk rebuild CeriaKid clone.

---

## 📋 package.json (Complete)

```json
{
  "name": "ceriakid",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hello-pangea/dnd": "^17.0.0",
    "@hookform/resolvers": "^4.1.2",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-aspect-ratio": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-context-menu": "^2.2.6",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-hover-card": "^1.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-navigation-menu": "^1.2.5",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-toggle": "^1.1.2",
    "@radix-ui/react-toggle-group": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.84.1",
    "canvas-confetti": "^1.9.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.5.2",
    "framer-motion": "^11.16.4",
    "html2canvas": "^1.4.1",
    "input-otp": "^1.4.2",
    "jspdf": "^4.0.0",
    "lodash": "^4.17.21",
    "lucide-react": "^0.475.0",
    "moment": "^2.30.1",
    "next-themes": "^0.4.4",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.54.2",
    "react-hot-toast": "^2.6.0",
    "react-leaflet": "^4.2.1",
    "react-markdown": "^9.0.1",
    "react-quill": "^2.0.0",
    "react-resizable-panels": "^2.1.7",
    "react-router-dom": "^6.26.0",
    "recharts": "^2.15.4",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7",
    "three": "^0.171.0",
    "vaul": "^1.1.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.0"
  }
}
```

---

## 📂 Project Structure

```
ceriakid/
├── public/
│   ├── manifest.json          (PWA manifest)
│   ├── sw.js                  (Service worker)
│   └── clear-cache.html       (Cache clear tool)
├── src/
│   ├── App.jsx                (Main router)
│   ├── main.jsx               (Entry point)
│   ├── index.css              (Global styles + CSS vars)
│   ├── api/
│   │   └── supabase.js        (Or base44Client.js — DB client)
│   ├── components/
│   │   ├── ui/                (shadcn components)
│   │   ├── home/              (Dashboard components)
│   │   ├── game/              (Game player components)
│   │   ├── ai/                (AI feature components)
│   │   ├── admin/             (Admin panel components)
│   │   ├── affiliate/         (Affiliate UI)
│   │   ├── landing/           (Landing page sections)
│   │   ├── header/            (Drawer/menu components)
│   │   └── ... (~200 components total)
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Home.jsx
│   │   ├── ClientDashboard.jsx
│   │   ├── ... (~60 pages)
│   │   └── games/             (Interactive game pages)
│   ├── lib/
│   │   ├── AuthContext.jsx
│   │   ├── SelectedChildContext.jsx
│   │   ├── LanguageContext.jsx
│   │   ├── AgeGroupContext.jsx
│   │   ├── tierAccess.js
│   │   ├── creditPackages.js
│   │   ├── gameRewards.js
│   │   ├── utils.js
│   │   ├── gameData_*.js      (Game content data)
│   │   └── ... (helpers)
│   ├── hooks/
│   │   ├── useGameStats.js
│   │   ├── useGameProgress.js
│   │   └── ... (custom hooks)
│   ├── functions/             (Edge functions)
│   │   ├── chipCheckout/
│   │   ├── chipWebhook/
│   │   ├── askAIAssistant/
│   │   └── ... (67 functions)
│   └── entities/              (Reference: JSON schemas)
├── tailwind.config.js
├── vite.config.js
├── package.json
├── .env.local                 (Secrets - DO NOT commit)
└── docs/                      (THIS migration kit)
    ├── 00_README.md
    └── ... (12 files)
```

---

## ⚙️ Configuration Files

### `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
```

### `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['var(--font-nunito)'],
      },
      colors: {
        // shadcn standard
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        // ... full color tokens
        game: {
          yellow: 'hsl(var(--game-yellow))',
          pink: 'hsl(var(--game-pink))',
          blue: 'hsl(var(--game-blue))',
          green: 'hsl(var(--game-green))',
          purple: 'hsl(var(--game-purple))',
          orange: 'hsl(var(--game-orange))',
          red: 'hsl(var(--game-red))',
        },
      },
      // ... animations, etc.
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### `index.css` (Design tokens):
```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 270 60% 97%;
    --foreground: 260 30% 20%;
    --primary: 280 60% 55%;
    --primary-foreground: 0 0% 100%;
    --secondary: 190 80% 55%;
    --accent: 340 80% 60%;
    --radius: 1.25rem;
    --font-nunito: 'Nunito', sans-serif;
    
    /* Game palette */
    --game-yellow: 45 95% 55%;
    --game-pink: 340 80% 65%;
    --game-blue: 200 85% 58%;
    --game-green: 145 65% 48%;
    --game-purple: 280 60% 55%;
    --game-orange: 25 95% 58%;
    --game-red: 0 75% 58%;
  }
}

/* Claymorphism utilities, animations, etc. */
```

---

## 🚀 Setup Commands

### Initial setup:
```bash
# 1. Clone repo
git clone https://github.com/yourname/ceriakid.git
cd ceriakid

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your secrets

# 4. Run dev server
npm run dev

# 5. Build for production
npm run build

# 6. Preview production build
npm run preview
```

### Required Node version:
```
Node.js 18+ (for native fetch, ES modules)
npm 9+ OR pnpm 8+
```

---

## 🔌 Install shadcn/ui Components

```bash
# Initialize shadcn
npx shadcn-ui@latest init

# Install all components used:
npx shadcn-ui@latest add button input label select dialog \
  toast popover dropdown-menu sheet tabs avatar badge card \
  alert-dialog calendar checkbox command form hover-card \
  navigation-menu progress radio-group scroll-area separator \
  switch table textarea toggle tooltip drawer sonner sidebar \
  accordion alert breadcrumb carousel chart collapsible \
  context-menu menubar pagination resizable skeleton slider \
  aspect-ratio input-otp toggle-group
```

---

## 🌐 Hosting Setup

### Vercel (recommended):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set env vars (in Vercel dashboard):
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_FB_PIXEL_ID=12345
VITE_VAPID_PUBLIC_KEY=BNc...
VITE_APP_URL=https://ceriakid.com
```

### Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# netlify.toml:
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔧 Critical Code Files Reference

### Must-have files (copy from GitHub repo):

#### Auth & State:
- `src/lib/AuthContext.jsx`
- `src/lib/SelectedChildContext.jsx`
- `src/lib/LanguageContext.jsx`
- `src/lib/AgeGroupContext.jsx`

#### Business Logic:
- `src/lib/tierAccess.js`         ← Tier limits
- `src/lib/creditPackages.js`     ← Credit pricing
- `src/lib/gameRewards.js`        ← Stars/streak logic
- `src/lib/achievementManager.js` ← Badge unlocking
- `src/lib/affiliateTiers.js`     ← Commission rates
- `src/lib/deviceManager.js`      ← Device fingerprinting

#### Tracking & Analytics:
- `src/lib/pixel.js`              ← FB Pixel
- `src/lib/fbTracking.js`         ← CAPI events
- `src/lib/referralTracker.js`    ← Affiliate ref capture

#### Game Data (HUGE — 30+ files):
- `src/lib/gameData.js`           ← Main game library
- `src/lib/gameData_prasekolah_*` ← Prasekolah games
- `src/lib/gameData_sr_*`         ← Sekolah Rendah games
- `src/lib/miniGames/*`           ← Mini game blueprints
- `src/lib/subjectGames/*`        ← Subject game blueprints
- `src/lib/syllabusData.js`       ← Curriculum reference

#### UI Utilities:
- `src/lib/utils.js`              ← cn() helper
- `src/lib/haptics.js`            ← Vibration API
- `src/lib/menuPrefs.js`          ← Pinned menu items
- `src/lib/childAvatars.js`       ← Avatar pool
- `src/lib/avatarGenerator.js`    ← DiceBear avatars

---

## 📱 PWA Setup

### `public/manifest.json`:
```json
{
  "name": "CeriaKid",
  "short_name": "CeriaKid",
  "description": "Platform pendidikan anak Malaysia",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#faf5ff",
  "theme_color": "#a855f7",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### `public/sw.js` (Service Worker):
```javascript
// Service worker basics
const CACHE_NAME = 'ceriakid-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'CeriaKid', {
      body: data.body,
      icon: '/icon-192.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});
```

---

## 🎯 Migration Order (Day-by-Day)

### Day 1: Foundation
- [ ] Setup React + Vite + Tailwind project
- [ ] Install all dependencies (`npm install`)
- [ ] Setup shadcn components
- [ ] Setup Supabase project + run SQL schema (file 09)

### Day 2: Auth + Core
- [ ] Setup Supabase Auth (email + OTP)
- [ ] Create AuthContext
- [ ] Build Landing page
- [ ] Build Dashboard page

### Day 3-4: Game System
- [ ] Build GameHub + GamePlayer
- [ ] Import game data files
- [ ] Build all game type renderers
- [ ] Save progress to ck_child_game_progress

### Day 5-7: AI Features
- [ ] Setup OpenAI integration
- [ ] Build Cikgu Firdaus (askAIAssistant)
- [ ] Build Quiz AI, Story Gen, BBM Gen
- [ ] Credit system (deduct/refund)

### Day 8-10: Payments
- [ ] CHIP checkout integration
- [ ] CHIP webhook handler
- [ ] Subscription management UI
- [ ] Credit pack purchase flow

### Day 11-14: Polish
- [ ] Parent dashboard
- [ ] Affiliate system
- [ ] Email automations
- [ ] Push notifications
- [ ] Admin panel

### Day 15+: QA & Launch
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Mobile testing
- [ ] Production deploy

---

## 🆘 Common Pitfalls

### ❌ DON'T:
- Use `import X from 'X'` for Edge Functions — use `npm:X@version`
- Forget to enable RLS on Supabase tables
- Hardcode Base44 URLs anywhere
- Skip webhook signature verification
- Deduct credits AFTER AI call (always BEFORE + refund on fail)

### ✅ DO:
- Use `@/` import alias consistently
- Test webhook with sandbox first
- Use TanStack Query for caching
- Lazy load heavy pages with `React.lazy`
- Use service worker for offline mode

---

> 🎉 **FINAL FILE!** You now have 100% complete migration kit (12 files).
> Read `00_README.md` for kit overview.