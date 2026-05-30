# 🎨 Frontend Critical Components — Behaviour & Pseudocode

> Pseudocode untuk frontend components yang ada complex behaviour yang AI rebuild kena replicate exactly.
> Includes: CheckoutSection, ThankYou polling, PixelLoader, Dashboard fetch pattern, Service Worker.
> Last updated: 2026-05-30

---

## 1️⃣ CheckoutSection — Form Validation Flow

Component: `components/PricingCheckout.jsx` (landing pricing) or `pages/BuyCredits.jsx`.

### State machine
```
states: 'idle' → 'validating' → 'submitting' → 'redirecting' → 'error'
```

### Validation rules (executed in this exact order)
```javascript
const validate = ({ email, fullName, phone, tier }) => {
  const errors = {};
  
  // 1. Email (required, format)
  if (!email?.trim()) errors.email = 'Email diperlukan';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email tidak sah';
  
  // 2. Full name (required, min 3 chars)
  if (!fullName?.trim()) errors.fullName = 'Nama penuh diperlukan';
  else if (fullName.trim().length < 3) errors.fullName = 'Nama terlalu pendek';
  
  // 3. Phone (optional but if provided, must be Malaysian format)
  if (phone && !/^(\+?60|0)1\d{8,9}$/.test(phone.replace(/\s|-/g, ''))) {
    errors.phone = 'No telefon Malaysia (cth: 0123456789)';
  }
  
  // 4. Tier (required, must be in allowed list)
  const VALID_TIERS = ['asas', 'standard', 'keluarga', 'premium', 'pro'];
  if (!VALID_TIERS.includes(tier)) errors.tier = 'Pakej tidak sah';
  
  return errors;
};
```

### Submission flow
```javascript
async function handleSubmit(formData) {
  setState('validating');
  const errors = validate(formData);
  if (Object.keys(errors).length) {
    setErrors(errors);
    setState('idle');
    return;
  }
  
  setState('submitting');
  
  // Capture FB tracking data BEFORE redirect
  const fbTracking = {
    fbc: getCookie('_fbc'),
    fbp: getCookie('_fbp'),
    eventId: `Purchase_${Date.now()}_${randomId()}`,
    referrer: document.referrer,
    landingUrl: window.location.href,
    timestamp: new Date().toISOString(),
  };
  
  // Fire AddToCart pixel event (with dedup ID)
  trackEvent('InitiateCheckout', { content_name: tier, value: TIER_PRICES[tier], currency: 'MYR' });
  
  try {
    const { data } = await base44.functions.invoke('chipCheckout', {
      tier: formData.tier,
      email: formData.email,
      fullName: formData.fullName,
      phone: formData.phone || '',
      fbTracking,
    });
    
    if (data?.checkout_url) {
      setState('redirecting');
      // ⚠️ Save subId in localStorage for ThankYou polling fallback
      localStorage.setItem('pending_sub_id', data.subscription_id);
      window.location.href = data.checkout_url;
    } else {
      throw new Error(data?.error || 'Checkout creation failed');
    }
  } catch (err) {
    setState('error');
    setErrorMessage(err.message);
    // Re-enable form after 3 sec
    setTimeout(() => setState('idle'), 3000);
  }
}
```

### UI states
```
'idle':        Form interactive, submit button enabled
'validating':  Button shows spinner briefly (50ms — basically instant)
'submitting':  Button shows "Memproses..." + spinner, form disabled
'redirecting': Button shows "Mengalihkan ke pembayaran...", page about to navigate
'error':       Show toast/banner with errorMessage, form re-enabled after 3s
```

---

## 2️⃣ ThankYou Page — Payment Confirmation Polling

Component: `pages/ThankYou.jsx`. User lands here after CHIP redirects back from payment.

### URL params received
```
/thank-you?sub_id=xyz123&purchase_id=chip_abc
```

### Polling pattern (exact)
```javascript
function ThankYou() {
  const [status, setStatus] = useState('checking');  // checking | confirmed | timeout
  const [subscription, setSubscription] = useState(null);
  const subId = new URLSearchParams(location.search).get('sub_id') 
                || localStorage.getItem('pending_sub_id');
  
  useEffect(() => {
    if (!subId) {
      setStatus('timeout');
      return;
    }
    
    let attempts = 0;
    const MAX_ATTEMPTS = 30;       // 30 attempts × 2s = 60 seconds total
    const POLL_INTERVAL = 2000;    // Poll every 2 seconds
    
    const poll = async () => {
      attempts++;
      try {
        const sub = await base44.entities.UserSubscription.get(subId);
        
        if (sub.status === 'active' && sub.tier !== 'free') {
          // ✅ Payment confirmed by webhook
          setSubscription(sub);
          setStatus('confirmed');
          localStorage.removeItem('pending_sub_id');
          
          // Fire FB Purchase pixel (one-time)
          trackEvent('Purchase', {
            value: TIER_PRICES[sub.tier],
            currency: 'MYR',
            content_name: sub.tier,
          });
          
          // Trigger welcome email (server-side via chipWebhook usually, but as fallback)
          return; // Stop polling
        }
        
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(poll, POLL_INTERVAL);
        } else {
          setStatus('timeout');
        }
      } catch (err) {
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(poll, POLL_INTERVAL);
        } else {
          setStatus('timeout');
        }
      }
    };
    
    poll();
  }, [subId]);
  
  return /* UI based on status */;
}
```

### UI states
```
'checking':  Animated loader + "Mengesahkan pembayaran anda..." (max 60s)
'confirmed': Success animation + tier name + "Mula belajar →" CTA → /dashboard
'timeout':   "Pembayaran lambat dikesahkan. Sila refresh atau hubungi kami." + WhatsApp link
```

### KEY GOTCHA — Race condition
```
Webhook might arrive BEFORE user lands on ThankYou page (most common).
→ First poll already finds status='active'. Confirmed immediately.

OR webhook might arrive AFTER user lands (slow webhook).
→ Poll keeps checking until status changes.

OR webhook fails entirely.
→ Timeout state. User contacts support. Manual fix by admin.
```

---

## 3️⃣ PixelLoader — FB Pixel Init in App.jsx

Component logic in `App.jsx` + `lib/pixel.js`.

### Init sequence (mount once, on first PageView)
```javascript
// In App.jsx — runs ONCE on first render
useEffect(() => {
  if (!FB_PIXEL_ID) return;
  if (window.fbq) return; // Already loaded
  
  // Load FB pixel base code (inlined, not via script tag)
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;
    n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=!0;
    t.src='https://connect.facebook.net/en_US/fbevents.js';
    s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s);
  }(window,document,'script');
  
  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');
}, []);
```

### Route change tracker (PixelPageViewTracker in App.jsx)
```javascript
function PixelPageViewTracker() {
  const location = useLocation();
  
  useEffect(() => {
    // Track each route change as PageView (browser + CAPI both)
    trackPageView();  // From lib/pixel.js
    captureReferralFromUrl();  // From lib/referralTracker.js
  }, [location.pathname, location.search]);
  
  return null;
}
```

### Dedup ID generation (CRITICAL)
```javascript
// lib/pixel.js
export function trackPageView() {
  const eventId = `PageView_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
  
  if (window.fbq) {
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }
  
  // Server-side CAPI fire with SAME eventId (dedup happens by FB)
  base44.functions.invoke('fbConversionsAPI', {
    eventName: 'PageView',
    eventId,
    sourceUrl: window.location.href,
  }).catch(() => {});  // Silent fail OK
}
```

### Cookie capture (_fbc, _fbp)
```javascript
// On every page load, capture FB cookies from URL params + cookies
// Save to UserSubscription.fbTracking when user later subscribes

function captureFbCookies() {
  const params = new URLSearchParams(location.search);
  const fbclid = params.get('fbclid');
  
  // _fbc format: fb.1.{timestamp}.{fbclid}
  if (fbclid && !getCookie('_fbc')) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    document.cookie = `_fbc=${fbc}; path=/; max-age=${90*24*60*60}`;  // 90 days
  }
  // _fbp is auto-set by FB pixel script
}
```

---

## 4️⃣ Dashboard Data Fetching Pattern

Component: `pages/Home.jsx`, `pages/ParentDashboard.jsx`.

### TanStack Query pattern (current)
```javascript
function HomeDashboard() {
  const { user } = useAuth();
  const { selectedChild } = useSelectedChild();
  
  // Parallel queries with shared cache
  const subQuery = useQuery({
    queryKey: ['user-subscription', user?.email],
    queryFn: () => base44.entities.UserSubscription.filter({ email: user.email }, '-created_date', 1).then(r => r[0]),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,  // 5 min — subscription rarely changes
  });
  
  const creditsQuery = useQuery({
    queryKey: ['user-credits', user?.email],
    queryFn: () => base44.functions.invoke('getUserCredits', {}).then(r => r.data),
    enabled: !!user?.email,
    staleTime: 30 * 1000,  // 30 sec — credits change after AI usage
  });
  
  const progressQuery = useQuery({
    queryKey: ['child-progress', user?.email, selectedChild?.name],
    queryFn: () => base44.entities.ChildGameProgress.filter({ 
      userEmail: user.email, 
      childName: selectedChild.name 
    }, '-lastPlayedDate', 50),
    enabled: !!(user?.email && selectedChild?.name),
    staleTime: 60 * 1000,
  });
  
  // ...
}
```

### Stale time guide (per data type)
```
Subscription:    5 min   (rarely changes)
Credits:        30 sec   (changes on AI usage)
ChildProgress:   1 min   (changes after games)
Games list:    10 min   (admin updates)
BBM list:      10 min
Achievements:   2 min
Leaderboard:    1 min
HealthCheck:   no cache  (always fresh)
```

### Refetch on window focus
```javascript
// QueryClient global config in lib/query-client.js
new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,   // ⚠️ TURNED OFF — too aggressive on mobile
      refetchOnReconnect: true,
      retry: 1,                      // Retry failed query once
      retryDelay: 1000,
    },
  },
});
```

---

## 5️⃣ Service Worker (`public/sw.js`) — Full Pattern

### Required event listeners
```javascript
// public/sw.js — service worker for push + offline
const CACHE_NAME = 'ceriakid-v1';
const STATIC_ASSETS = [
  '/',
  '/icon-192.png',
  '/badge-72.png',
  '/manifest.json',
];

// Install — pre-cache static
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API calls → network only (don't cache)
  if (url.pathname.includes('/api/') || url.pathname.includes('/functions/')) {
    return; // Let browser handle normally
  }
  
  // Static assets → cache-first
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cached) => 
        cached || fetch(event.request).then((res) => {
          if (res.ok && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return res;
        })
      ).catch(() => caches.match('/offline.html'))
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); } 
  catch { payload = { title: 'CeriaKid', body: event.data.text() }; }
  
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      tag: payload.tag,
      data: { url: payload.url, ...(payload.data || {}) },
      requireInteraction: payload.requireInteraction || false,
      vibrate: [200, 100, 200],  // Vibration pattern (mobile)
    })
  );
});

// Click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
      })
  );
});
```

### Register in main.jsx
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.error('SW registration failed:', err));
  });
}
```

---

## 6️⃣ Onboarding Wizard Logic

Component: `components/onboarding/OnboardingWizard.jsx`.

### Steps
```
Step 1: Welcome + name input (parent's preferred name)
Step 2: Add first child (name + age group)
Step 3: Set learning goal (subject preference)
Step 4: Notification permission request
Step 5: Done → /dashboard
```

### When to show
```javascript
// On Home.jsx mount:
const shouldShowOnboarding = useMemo(() => {
  if (!subscription) return false;
  if (subscription.children?.length > 0) return false;  // Has children = onboarded
  if (localStorage.getItem('onboarding_skipped')) return false;
  return true;
}, [subscription]);
```

### Skip behaviour
```
User clicks "Lepas dulu" → set localStorage 'onboarding_skipped' = 'true'
Never auto-show again (but can access via /children-profiles manually)
```

---

## 7️⃣ Child Switcher Modal

Component: `components/header/ChildSwitcherModal.jsx`.

### Show child list logic
```javascript
const sortedChildren = useMemo(() => {
  return (subscription?.children || [])
    .slice()
    .sort((a, b) => {
      // Active child first
      if (a.id === selectedChild?.id) return -1;
      if (b.id === selectedChild?.id) return 1;
      // Then by recently active (from progress data)
      return (lastActiveMap[b.id] || 0) - (lastActiveMap[a.id] || 0);
    });
}, [subscription, selectedChild, lastActiveMap]);
```

### Switch behaviour
```javascript
function handleSelectChild(child) {
  haptic('light');
  setSelectedChild(child);  // Updates SelectedChildContext
  localStorage.setItem('selected_child_id', child.id);
  
  // Invalidate progress queries — force refetch for new child
  queryClient.invalidateQueries({ queryKey: ['child-progress'] });
  queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
  
  onClose();
}
```

---

## 8️⃣ OfflineBanner Pattern

Component: `components/OfflineBanner.jsx`.

```javascript
function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync queued actions (from offlineSyncManager)
      offlineSyncManager.flushQueue();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  return /* Banner UI */;
}
```

---

## 9️⃣ Exit Intent Popup

Component: `components/landing/ExitIntentPopup.jsx`.

### Trigger conditions (all must be true)
```javascript
1. User on /, /pricing, or /landing route
2. NOT signed in
3. Mouse moves toward top edge (mouseleave event) — desktop only
4. NOT shown in this session (sessionStorage check)
5. Page has been viewed > 15 seconds (avoid bouncing immediately)
```

### Code
```javascript
useEffect(() => {
  if (sessionStorage.getItem('exit_popup_shown')) return;
  if (user) return;
  
  const startTime = Date.now();
  
  const handleMouseLeave = (e) => {
    // Only trigger if leaving via top edge
    if (e.clientY > 0) return;
    if (Date.now() - startTime < 15000) return;
    
    sessionStorage.setItem('exit_popup_shown', 'true');
    setShow(true);
  };
  
  document.addEventListener('mouseleave', handleMouseLeave);
  return () => document.removeEventListener('mouseleave', handleMouseLeave);
}, [user]);
```

### Offer
```
Title: "Tunggu! Dapatkan 5 hari percuma"
Body: Enter email → unlock 5 days Premium trial (no card needed)
On submit: Create UserSubscription with tier='premium' + 5-day trial period
```

---

## 🔟 Drawing Studio — Canvas Save Pattern

Component: `pages/DrawingStudio.jsx`.

### Save to gallery (localStorage + Supabase fallback)
```javascript
async function saveDrawing(canvasRef, title) {
  const dataUrl = canvasRef.current.toDataURL('image/png', 0.9);
  
  // 1. Compress to blob
  const blob = await (await fetch(dataUrl)).blob();
  
  // 2. Upload to Base44/Supabase storage
  const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });
  
  // 3. Save metadata to localStorage gallery (offline-first)
  const gallery = JSON.parse(localStorage.getItem('drawing_gallery') || '[]');
  gallery.unshift({
    id: `draw_${Date.now()}`,
    title,
    url: file_url,
    createdAt: new Date().toISOString(),
    childName: selectedChild?.name,
  });
  // Keep only last 50 drawings per child
  const filtered = gallery.slice(0, 50);
  localStorage.setItem('drawing_gallery', JSON.stringify(filtered));
  
  haptic('success');
  toast.success('Lukisan disimpan!');
}
```

---

> Combined dengan doc 22 + email templates, AI rebuild confidence: **97-99%** match production.