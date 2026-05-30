# 🎨 Brand Kit — Design Tokens & Guidelines

> Complete brand reference: colors, fonts, gradients, design tokens.
> Source: `index.css` + `tailwind.config.js`
> Last updated: 2026-05-30

---

## 🎯 Brand Identity

**Name:** CeriaKid
**Tagline:** Platform Pembelajaran Interaktif untuk Anak Malaysia
**Target:** Anak-anak 4-12 tahun + parents Malaysia
**Tone:** Playful, friendly, educational, trustworthy

---

## 🎨 Color Palette

### Primary Colors (HSL values from index.css)

```css
/* Brand primary palette */
--primary:    280 60% 55%   /* Purple #A855F7 — main CTA, brand */
--secondary:  190 80% 55%   /* Cyan #22D3EE — secondary actions */
--accent:     340 80% 60%   /* Pink #EC4899 — highlights, badges */
--background: 270 60% 97%   /* Light lavender #F8F4FF */
--foreground: 260 30% 20%   /* Dark slate #2D2347 */
```

### Game Colors (7 vibrant accents)

```css
--game-yellow: 45 95% 55%   /* #F5C518 */
--game-pink:   340 80% 65%  /* #EC4899 */
--game-blue:   200 85% 58%  /* #3B82F6 */
--game-green:  145 65% 48%  /* #22C55E */
--game-purple: 280 60% 55%  /* #A855F7 */
--game-orange: 25 95% 58%   /* #F97316 */
--game-red:    0 75% 58%    /* #EF4444 */
```

### Usage in Tailwind
```jsx
<div className="bg-primary text-primary-foreground">Primary</div>
<div className="bg-game-yellow">Yellow card</div>
<div className="bg-game-pink">Pink card</div>
```

---

## 🌈 Gradients (Signature Brand Look)

### Primary Gradient — Purple to Pink
```css
background: linear-gradient(135deg, #a855f7, #ec4899);
```
**Use for:** Main CTAs, hero sections, welcome emails

### Credit Gradient — Orange to Red
```css
background: linear-gradient(135deg, #f59e0b, #ef4444);
```
**Use for:** Credit purchases, AI features, energy/urgency

### Background Pattern
```css
background-image:
  radial-gradient(circle at 20% 80%, hsla(340, 80%, 65%, 0.15) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, hsla(200, 85%, 58%, 0.15) 0%, transparent 50%),
  radial-gradient(circle at 50% 50%, hsla(45, 95%, 55%, 0.1) 0%, transparent 50%);
```
**Use for:** Subtle bg texture (apply `.bg-pattern` class)

---

## 🔤 Typography

### Font Family
**Nunito** (Google Fonts) — Rounded, friendly, kid-appropriate

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

--font-nunito: 'Nunito', sans-serif;
```

### Weights Available
- `400` — Regular (body text)
- `600` — Semibold (emphasis)
- `700` — Bold (headings)
- `800` — Extra Bold (display)
- `900` — Black (hero titles)

### Usage
```jsx
<h1 className="font-nunito font-black text-4xl">Hero Title</h1>
<p className="font-nunito font-normal">Body text</p>
```

### Letter Spacing Tokens
```css
.tracking-label-tight    /* 0.12em — small labels */
.tracking-label          /* 0.15em — default labels */
.tracking-label-wide     /* 0.18em — emphasis labels */
```

---

## 🎭 Design System: Claymorphism + Pastel Candy

### Clay Style (Soft 3D Look)

**Standard Clay:**
```css
.clay {
  background: linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1));
  box-shadow:
    8px 8px 16px rgba(0,0,0,0.08),
    -4px -4px 12px rgba(255,255,255,0.9),
    inset 2px 2px 4px rgba(255,255,255,0.6),
    inset -1px -1px 3px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.5);
}
```

**Clay Button:**
```css
.clay-button {
  background: linear-gradient(145deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1));
  box-shadow:
    6px 6px 12px rgba(0,0,0,0.1),
    -3px -3px 8px rgba(255,255,255,0.8),
    inset 1px 1px 3px rgba(255,255,255,0.6);
  transition: all 0.15s ease;
}

.clay-button:active {
  box-shadow: inset 3px 3px 6px rgba(0,0,0,0.12);
  transform: scale(0.97);
}
```

### Pro Glass Style (Premium Glassmorphism)
```css
.pro-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65));
  backdrop-filter: blur(22px);
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 18px 50px rgba(31, 16, 92, 0.08);
}
```

---

## 📐 Border Radius Scale

```css
--radius: 1.25rem (20px)  /* Default */

/* Tailwind tokens */
rounded-sm    = 16px
rounded-md    = 18px
rounded-lg    = 20px (default)
rounded-2xl   = 24px
rounded-3xl   = 32px (cards, modals)
```

**Rule of thumb:** Bigger radius = more playful. CeriaKid uses MORE rounded corners.

---

## ✨ Animations

### Custom Keyframes

```css
/* Float (used for floating mascots/icons) */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
/* Class: .animate-float (3s ease-in-out infinite) */

/* Bounce In (correct answers) */
@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
/* Class: .animate-bounce-in (0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)) */

/* Wiggle (interactive feedback) */
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
/* Class: .animate-wiggle (0.5s ease-in-out) */

/* Pulse Scale (CTAs, attention) */
@keyframes pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
/* Class: .animate-pulse-scale (2s ease-in-out infinite) */
```

### Framer Motion (used heavily)
- Page transitions: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`
- Card hover: `whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}`
- Stagger children: `delay: index * 0.05`

---

## 📱 Responsive Breakpoints

Standard Tailwind:
```
sm:  640px   /* Tablet portrait */
md:  768px   /* Tablet landscape */
lg:  1024px  /* Desktop */
xl:  1280px  /* Wide desktop */
2xl: 1536px  /* Ultra-wide */
```

**Mobile-first approach:** Default styles for mobile, scale up dengan breakpoints.

---

## 🎨 Component Style Patterns

### Primary CTA Button
```jsx
<button className="
  px-6 py-3 
  bg-gradient-to-r from-purple-600 to-pink-500 
  text-white font-bold 
  rounded-2xl 
  shadow-lg shadow-purple-500/30 
  hover:shadow-xl hover:scale-105 
  active:scale-95 
  transition-all
">
  Mula Sekarang →
</button>
```

### Card Pattern
```jsx
<div className="
  bg-white/90 backdrop-blur-sm 
  border border-white/40 
  rounded-3xl 
  p-6 
  shadow-xl shadow-purple-950/10
">
  Card content
</div>
```

### Hero Section
```jsx
<section className="
  min-h-screen 
  bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 
  bg-pattern
">
  Hero content
</section>
```

---

## 🌐 Logo & Brand Assets

### Logo Locations
```
Primary logo:    /icon-512x512.png
Favicon:         /favicon.ico
App icons:       /icon-192x192.png, /icon-512x512.png
Apple touch:     /apple-touch-icon.png
PWA manifest:    /manifest.json
```

### Brand Mascots (4 Cikgu AI)
- 👨‍🏫 **Cikgu Firdaus** — Tutor AI (purple theme)
- 👩‍🏫 **Cikgu Rosie** — Quiz generator (pink theme)
- 👩‍🏫 **Cikgu Mira** — Story generator (yellow theme)
- 👨‍🏫 **Cikgu Daniel** — BBM generator (blue theme)

---

## 📋 Brand Voice Guidelines

### Language Mix
- **Primary:** Bahasa Melayu (default)
- **Secondary:** English
- **Style:** Casual, friendly, gunakan "anda" (formal-but-warm)

### Tone Examples

✅ **DO:**
- "Selamat datang ke CeriaKid! 🎉"
- "Anak anda dah belajar 5 game minggu ni — superb!"
- "Cuba game baru hari ni? 🎮"

❌ **DON'T:**
- "Welcome to our educational platform."  (too formal)
- "You haven't played any games."  (negative)
- "Click here to subscribe now!!!" (spammy)

### Emoji Usage
- ✅ Use generously — kids audience loves it
- 🎯 Common: 🎉 ✨ 🚀 ⭐ 🎮 📚 ❤️ 👏 🏆
- 🚫 Avoid: 🍆 💩 🔞 (inappropriate)

---

## 🎨 Color Accessibility

### Contrast Ratios (WCAG AA Compliant)

```
✅ Primary on white:    7.2:1 (AAA)
✅ Foreground on bg:    12.5:1 (AAA)
✅ White on gradient:   5.8:1 (AA Large)
⚠️ Yellow on white:     2.1:1 (FAIL — only use as bg)
```

### Always Test
```bash
# Use Chrome DevTools → Lighthouse → Accessibility
# OR online: webaim.org/resources/contrastchecker/
```

---

## 🎯 Quick Reference for AI Builders

If rebuilding the brand visual identity:

```
Primary brand color:  #A855F7 (purple)
Accent color:         #EC4899 (pink)
Font:                 Nunito (400-900 weights)
Border radius:        20px (default), 32px (cards)
Style:                Claymorphism + pastel candy
Shadows:              Soft, multi-layer
Animations:           Playful, bouncy (framer-motion)
Mood:                 Playful, friendly, educational
Target:               Malaysian kids 4-12 + parents
```

### Inspiration Sources (Similar Style)
- Duolingo (playful + claymorphic)
- Khan Academy Kids (warm + friendly)
- Lingokids (vibrant + playful)

---

## 🔗 Asset Files Reference

| Asset | Path | Notes |
|---|---|---|
| index.css | `src/index.css` | All design tokens + animations |
| tailwind config | `tailwind.config.js` | Color mappings |
| Logo PNG | `public/icon-512x512.png` | App icon |
| Favicon | `public/favicon.ico` | Browser tab |
| PWA manifest | `public/manifest.json` | App install |
| Fonts | Google Fonts CDN | Nunito loaded via @import |