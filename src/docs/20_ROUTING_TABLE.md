# 🗺️ Routing Table — Complete Route Map

> Every route in CeriaKid app, classified by access level.
> Source of truth: `App.jsx`
> Last updated: 2026-05-30

---

## 🎯 Access Levels

| Level | Description | Auth Required | Sidebar |
|---|---|---|---|
| 🌐 **PUBLIC** | Anyone can access | ❌ No | ❌ No |
| 🔒 **AUTH** | Logged-in users | ✅ Yes | ✅ Yes |
| 🎮 **GAME** | Logged-in, fullscreen | ✅ Yes | ❌ No |
| 👑 **ADMIN** | Admin role only | ✅ + role | Custom |

---

## 🌐 PUBLIC Routes (5)

No authentication required. SEO-indexed.

| Path | Component | Purpose | SEO Priority |
|---|---|---|---|
| `/` | `Landing` | Marketing homepage | 🔴 P0 |
| `/terms` | `Terms` | Terms of service | 🟡 P2 |
| `/privacy` | `Privacy` | Privacy policy | 🟡 P2 |
| `/contact` | `Contact` | Contact form | 🟢 P3 |
| `/thank-you` | `ThankYou` | Post-checkout success | ❌ noindex |

**Implementation:**
```jsx
<Route path="/" element={<Landing />} />
<Route path="/terms" element={<Terms />} />
<Route path="/privacy" element={<Privacy />} />
<Route path="/contact" element={<Contact />} />
<Route path="/thank-you" element={<ThankYou />} />
```

---

## 🔒 AUTH Routes — With Sidebar (20)

Requires login. Wrapped dengan `AppLayout` (includes sidebar + header).

### Dashboard & Profile (5)
| Path | Component | Purpose |
|---|---|---|
| `/dashboard` | `Home` | Main dashboard |
| `/settings` | `ClientDashboard` | User settings & subscription |
| `/children-profiles` | `ChildrenProfiles` | Manage children |
| `/parent-dashboard` | `ParentDashboard` | Parent insights |
| `/syllabus` | `Syllabus` | Curriculum view |

### Games (4)
| Path | Component | Purpose |
|---|---|---|
| `/games-hub` | `GamesHub` | Game category selection |
| `/games-subjek` | `GamesSubjek` | Subject-based games |
| `/games/:category` | `GamesList` | Games by category |
| `/mini-games/:type` | `MiniGamesList` | Mini-games by type |

### KAFA (1)
| Path | Component | Purpose |
|---|---|---|
| `/kafa` | `KafaHub` | KAFA religious studies hub |

### AI Features (4)
| Path | Component | Purpose | Credits |
|---|---|---|---|
| `/ai-assistant` | `AIAssistant` | Cikgu Firdaus chat | 1-3/msg |
| `/story-generator` | `StoryGenerator` | Cikgu Mira stories | 10-20 |
| `/bbm-generator` | `BBMGenerator` | Cikgu Daniel BBM | 3-5 |
| `/quiz-ai` | `QuizAI` | Cikgu Rosie quiz | 1/q |

### Social & Gamification (3)
| Path | Component | Purpose |
|---|---|---|
| `/friends` | `FriendsList` | Friend management |
| `/challenges` | `Challenges` | Active challenges |
| `/scoreboard` | `Scoreboard` | Leaderboards |

### Monetization (2)
| Path | Component | Purpose |
|---|---|---|
| `/buy-credits` | `BuyCredits` | AI credit packages |
| `/affiliate` | `Affiliate` | Affiliate program |

**Implementation:**
```jsx
<Route element={<AppLayout />}>
  <Route path="/dashboard" element={<Home />} />
  <Route path="/settings" element={<ClientDashboard />} />
  {/* ...etc */}
</Route>
```

---

## 🎮 GAME Routes — Fullscreen (16)

Requires login. **NO sidebar** — fullscreen for immersive gameplay.

### Drawing & Story (2)
| Path | Component | Type |
|---|---|---|
| `/drawing` | `DrawingStudio` | Drawing tool |
| `/story-kid` | `StoryKid` | AI story player |

### Dynamic Game Players (2)
| Path | Component | Pattern |
|---|---|---|
| `/play/:category/:index` | `GamePlayer` | Subject game player |
| `/mini-games/:categoryId/play/:gameId` | `MiniGamePlayground` | Mini-game player |

### Static Game Routes (4)
| Path | Component | Purpose |
|---|---|---|
| `/abc` | `ABCGame` | ABC letter game |
| `/numbers` | `NumberGame` | Number recognition |
| `/quiz` | `QuizGame` | Generic quiz |
| `/shapes` | `ShapesGame` | Shape recognition |

### Interactive Games (8)
| Path | Component | Mechanic |
|---|---|---|
| `/games/memory` | `MemoryGame` | Memory match |
| `/games/dragdrop` | `DragDropGame` | Drag & drop |
| `/games/wordbuilder` | `WordBuilderGame` | Word building |
| `/games/sorting` | `SortingGame` | Sorting puzzles |
| `/games/tilematch` | `TileMatchGame` | Tile matching |
| `/games/story` | `StoryAdventureGame` | Story adventure |
| `/games/physics` | `PhysicsGame` | Physics puzzles |
| `/games/tracing` | `TracingGameGamified` | Letter tracing |

**Implementation:**
```jsx
{/* No AppLayout wrapper — fullscreen */}
<Route path="/drawing" element={<DrawingStudio />} />
<Route path="/play/:category/:index" element={<GamePlayer />} />
<Route path="/games/memory" element={<MemoryGame />} />
```

---

## 👑 ADMIN Routes (3)

Requires `user.role === 'admin'`. Protected by `<AdminGuard>`.

| Path | Component | Purpose |
|---|---|---|
| `/admin-dashboard` | `AdminDashboard` | Admin control panel |
| `/game-analytics` | `GameAnalytics` | Game stats & analytics |
| `/game-database` | `GameDatabase` | Game CRUD manager |

**Implementation:**
```jsx
<Route 
  path="/admin-dashboard" 
  element={
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  } 
/>
```

**AdminGuard logic:**
```jsx
if (user?.role !== 'admin') {
  return <Navigate to="/dashboard" />;
}
return children;
```

---

## 🔄 Catch-All

| Path | Component | Purpose |
|---|---|---|
| `*` | `PageNotFound` | 404 page |

---

## 📊 Route Summary

```
🌐 PUBLIC:      5 routes  (10%)
🔒 AUTH:       20 routes  (43%)
🎮 GAME:       16 routes  (34%)
👑 ADMIN:       3 routes  (6%)
🔄 CATCH-ALL:   1 route   (2%)
─────────────────────────
TOTAL:        45+ routes
```

---

## 🚀 Lazy Loading Strategy

**Eager-loaded (instant):** Public pages + Home
**Lazy-loaded (on-demand):** All other routes

```jsx
// Eager (in bundle)
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';

// Lazy (separate chunks)
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const MemoryGame = lazy(() => import('@/pages/games/MemoryGame'));
```

**Bundle impact:**
- Initial bundle: ~250KB (Landing + Home + framework)
- Per-route chunk: ~30-80KB each
- First Paint: <1.5s on 4G

---

## 🛡️ Route Protection Patterns

### Pattern 1: Public Routes
```jsx
<Route path="/" element={<Landing />} />
```

### Pattern 2: Auth Required (with layout)
```jsx
<Route element={<AppLayout />}>
  <Route path="/dashboard" element={<Home />} />
</Route>

// AppLayout checks auth, redirects if not logged in
```

### Pattern 3: Auth Required (no layout, e.g., games)
```jsx
<Route 
  path="/games/memory" 
  element={<MemoryGame />}  // Component itself checks auth
/>
```

### Pattern 4: Admin Only
```jsx
<Route 
  path="/admin-dashboard" 
  element={<AdminGuard><AdminDashboard /></AdminGuard>} 
/>
```

---

## 🎯 Migration to React Router (Other Platforms)

If migrating to Next.js / Remix / etc, route mapping:

### Next.js App Router
```
/                          → app/page.tsx
/dashboard                 → app/dashboard/page.tsx
/games/[category]          → app/games/[category]/page.tsx
/admin-dashboard           → app/admin/dashboard/page.tsx + middleware.ts
```

### Remix
```
/                          → routes/_index.tsx
/dashboard                 → routes/dashboard.tsx
/games/$category           → routes/games.$category.tsx
```

---

## 🔍 SEO Considerations

### Indexable (allow crawlers)
- `/` (Landing)
- `/terms`, `/privacy`, `/contact`
- `/syllabus` (if want public curriculum visibility)

### Not Indexable (noindex meta tag)
- `/thank-you`
- All `/dashboard`, `/settings`, etc. (behind auth)
- Game routes (no SEO value)
- Admin routes

### Sitemap Generation
```
Generate sitemap.xml dengan public routes only:
- https://ceriakid.com/
- https://ceriakid.com/terms
- https://ceriakid.com/privacy
- https://ceriakid.com/contact
```

---

## 📋 Validation Checklist

Bila migrate atau add route baru, ensure:

```
□ Route exists in App.jsx
□ Component imported (lazy if heavy)
□ Wrapped dalam right layout (AppLayout for sidebar)
□ Wrapped dalam AdminGuard if admin-only
□ Has RouteErrorBoundary (for graceful errors)
□ Has Suspense fallback (PageLoader)
□ SEO meta tags (if public)
□ Mobile responsive
□ Track pageview (auto via PixelPageViewTracker)
``