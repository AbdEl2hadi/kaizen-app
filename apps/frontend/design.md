# Kaizen Landing Page — Design System

## Overview

A single-file SaaS landing page for **Kaizen**, a web-based habit-tracking app. The design uses a soft pastel, friendly, cartoon-illustrated wellness aesthetic with scalloped/cloud-shaped cards, pastel gradients, bold geometric sans-serif headlines, and subtle animations.

**File:** `kaizen-landing.html` (self-contained — all CSS, SVG, and JS inlined)

---

## Brand Identity

| Aspect              | Detail                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Tagline**         | "Small Steps. Big Change."                                                              |
| **Tone**            | Encouraging, warm, approachable, growth-oriented                                        |
| **Mascot**          | Tortoise (symbol of steady, consistent progress)                                        |
| **Meta-philosophy** | Kaizen = Japanese philosophy of continuous improvement through small, incremental steps |

---

## Color Palette

### Light Mode (default)

| Token             | Hex                   | Usage                                                                  |
| ----------------- | --------------------- | ---------------------------------------------------------------------- |
| `--primary`       | `#4CAF7D`             | Sage green — buttons, highlights, tortoise border, decorative elements |
| `--primary-dark`  | `#3D9B6A`             | Primary hover states                                                   |
| `--primary-light` | `#6DC99A`             | Gradient accents, dark mode highlights                                 |
| `--accent`        | `#FF6F5E`             | Coral — CTA banner, secondary badges                                   |
| `--accent-light`  | `#FF8F7A`             | CTA gradient variant                                                   |
| `--cream`         | `#F0E6D2`             | Warm beige — feature card variant                                      |
| `--cream-dark`    | `#E0D6C2`             | Darker cream                                                           |
| `--mint`          | `#E8F5E9`             | Light green — feature card variant, habit rows                         |
| `--mint-soft`     | `#F1F8E9`             | Softer mint — deep-dive section bg                                     |
| `--pale-yellow`   | `#FFFDE7`             | Feature card variant                                                   |
| `--charcoal`      | `#2D3B36`             | Headlines, primary button bg, footer bg                                |
| `--gray`          | `#6B6B6B`             | Body text                                                              |
| `--gray-light`    | `#9EA7A3`             | Secondary text, metadata                                               |
| `--white`         | `#FFFFFF`             | Cards, backgrounds                                                     |
| `--bg-soft`       | `#F8FAF5`             | Page background (soft mint-white)                                      |
| `--shadow`        | `rgba(45,59,54,0.08)` | Card shadows                                                           |
| `--shadow-hover`  | `rgba(45,59,54,0.12)` | Hover shadows                                                          |

### Dark Mode (`.dark` class)

All variables inverted for low-light viewing:

| Token           | Dark Value        |
| --------------- | ----------------- |
| Page background | `#141715`         |
| Card surfaces   | `#262927`         |
| Headlines       | `#E8EAE9`         |
| Body text       | `#B0B4B2`         |
| Footer          | `#0D0F0E`         |
| Shadows         | `rgba(0,0,0,0.4)` |

Dark mode is activated via a **blocking script** in `<head>` that checks `localStorage` → `prefers-color-scheme`, applying the `dark` class before paint to prevent flash. A sun/moon toggle button in the navbar lets users override, persisted in `localStorage`.

### Color Balance (60–30–10 Rule)

| Proportion | Role               | Token                            | Usage                                                                |
| ---------- | ------------------ | -------------------------------- | -------------------------------------------------------------------- |
| **60%**    | Neutral/background | `--bg-soft`, `--white`, `--gray` | Page backgrounds, cards, body text — the quiet majority              |
| **30%**    | Primary identity   | `--primary`, `--mint`, `--cream` | Feature cards, buttons, decorative shapes — the dominant brand voice |
| **10%**    | Accent emphasis    | `--accent`                       | CTAs, badges, highlights — sparingly, for attention                  |

This ensures the palette reads as harmonious rather than competing. Accent (coral) must never exceed ~10% of any given viewport to avoid visual shouting.

---

## Typography

| Use                   | Font              | Weight  | Size                                           |
| --------------------- | ----------------- | ------- | ---------------------------------------------- |
| **Headlines** (h1–h4) | Plus Jakarta Sans | 700–800 | `clamp(2.5rem, 5vw, 4rem)` down to `1.0625rem` |
| **Body text**         | Inter             | 400–500 | `1.125rem` (body) / `0.9375rem` (small)        |
| **Labels / pills**    | Inter             | 600–700 | `0.75rem–0.8125rem`                            |
| **Navigation**        | Inter             | 500     | `0.9375rem`                                    |

Key typographic rules:

- `h1` uses `clamp(2.5rem, 5vw, 4rem)` with `letter-spacing: -0.025em` for tight headline
- Section headings use `clamp(1.75rem, 3vw, 2.5rem)` to `clamp(2rem, 3.5vw, 3rem)`
- All body text is set at `#6B6B6B` (light) / `#B0B4B2` (dark)
- Headlines are `#2D3B36` (light) / `#E8EAE9` (dark)

---

## Spacing & Vertical Rhythm

A 4px unit scale defines all spacing for visual harmony:

| Token         | Value  | Usage                                            |
| ------------- | ------ | ------------------------------------------------ |
| `--space-xs`  | `4px`  | Icon margins, badge padding                      |
| `--space-sm`  | `8px`  | Tight inner padding, gap between inline elements |
| `--space-md`  | `16px` | Card padding, button padding, text spacing       |
| `--space-lg`  | `32px` | Between stacked elements within a section        |
| `--space-xl`  | `64px` | Between major sections                           |
| `--space-2xl` | `96px` | Page-top / page-bottom padding                   |

All section spacings should align to this scale to maintain consistent vertical rhythm. Avoid arbitrary padding values not divisible by 4.

---

## Section Layout

### 1. Navbar

- **Position:** Fixed top, transparent background, `z-index: 1000`
- **Height:** `80px` (`--nav-h`)
- **Content:** Logo (82px, PNG), 3 nav links + CTA button + theme toggle + hamburger
- **Responsive:** On ≤768px, text links hide and hamburger menu appears
- **Dark mode:** Semi-transparent dark background with `backdrop-filter: blur(16px)`

### 2. Hero

- **Layout:** Two-column grid (1fr 1fr) with 60px gap
- **Background:** 4-stop pastel gradient (`#E8F5E9 → #FFFDE7 → #FFF0ED → #F1F8E9`)
- **Left column:** Pill badges, h1 headline, subtitle, CTA buttons
- **Right column:** Browser-window mockup (540px) with floating animation + tortoise peek illustration (bottom-right)
- **Browser mockup content:** Habit checklist grid with checkmarks, streak ring SVG (65-day streak), progress bar
- **Responsive:** Single column stack on ≤1024px, centered text

### 3. Trust Row (Awards)

- **Background:** White with bottom border
- **Content:** 4 award badges (icons + text) in a centered flex row
- **Responsive:** Wraps with reduced gap on ≤768px

### 4. Features Intro

- **Text:** Centered, two section labels (coral then mint), heading, subtitle
- **Animation:** `fadeUp` keyframe on subheading

### 5. Feature Cards (3 columns)

- **Layout:** 3-column grid, 30px gap, cloud-card containers
- **Card styles:** Primary (green), accent (coral), cream (beige) backgrounds
- **Card shape:** `border-radius: 40px 16px 40px 16px / 24px 40px 24px 40px` — scalloped/cloud-like
- **Decorative bumps:** 8 circular pseudo-elements positioned around each card's perimeter for cloud visual
- **Content:** SVG icon, heading, description, mini mockup browser
- **Responsive:** 2 columns on ≤1024px, 1 column on ≤768px

### 6. Deep Dive

- **Background:** Linear gradient (`--bg-soft` → `--mint-soft`)
- **Layout:** Two-column grid (1fr 1fr)
- **Left column:** Cloud card with heading, 4 stat items (2×2 grid), animated values
- **Right column:** Browser mockup (460px) with stats table, chart bars (sleep, meditation, reading, exercise)
- **Tortoise decor:** (removed per user request)

### 7. FAQ

- **Background:** White (`#141715` dark)
- **Container:** Max-width 760px, centered
- **Items:** Accordion with chevron rotation, max-height animation
- **Hover:** Subtle green tint on row hover
- **Open state:** `max-height: 300px` with 14px top padding

### 8. CTA Banner

- **Background:** Coral gradient with `gradientShift` animation (8s ease-in-out)
- **Content:** 3 tilted browser mockups (rotated -6°, 0°, +6°) in perspective, heading, subtitle, 2 CTA badges ("Start Free Trial" / "Launch Web App")
- **Browser mockups:** Mini habit rows in mint/yellow/green backgrounds
- **Tortoise decor:** (removed per user request)

### 9. Footer

- **Background:** `#2D3B36` charcoal (`#0D0F0E` dark)
- **Grid:** 5 columns (2fr 1fr 1fr 1fr 1fr)
- **Content:** Logo (76px, white with `brightness(0) invert(1)`), brand description, 4 link columns, social icons
- **Bottom bar:** Copyright + legal links, top border separator
- **Responsive:** 3 columns → 2 columns → 1 column

---

### Easing & Timing Curve

All animations share a consistent easing curve for bodily harmony: `cubic-bezier(0.34, 1.56, 0.64, 1)` — a spring-like overshoot that feels lively but not jarring. No animation uses `linear` or `ease-in` exclusively, which read as mechanical.

---

## Animations

| Name            | Duration | Element         | Behavior                  |
| --------------- | -------- | --------------- | ------------------------- |
| `float`         | 6s       | Browser windows | Gentle up/down hover      |
| `peekBounce`    | 3s       | Tortoise peek   | Small bounce + scale      |
| `walkAcross`    | 20s      | (removed)       | —                         |
| `gradientShift` | 8s       | CTA banner      | Background position cycle |
| `pulseGlow`     | 3s       | CTA browsers    | Shadow pulse              |
| `fadeUp`        | 0.6s     | Feature subtext | Entrance slide-up fade    |
| Chevron rotate  | 0.3s     | FAQ toggle      | 180° rotation on open     |

**Accessibility:** `@media (prefers-reduced-motion: reduce)` disables all animations.

---

## UI Components

### Cloud Card

A signature visual element with rounded scalloped edges:

```
cloud-card
├── .scallop-bumps (absolute overlay)
│   └── 8 × span elements (circular bumps at top/bottom/left/right)
└── .card-content (z-index: 2, relative)
```

**Shape:** `border-radius: 40px 16px 40px 16px / 24px 40px 24px 40px`

**Rationale:** Asymmetrical radii create a soft, organic cloud silhouette. The pattern alternates large (40px) and small (16px) corners — this diagonal pairing (top-left ↔ bottom-right both large; top-right ↔ bottom-left both small) keeps the shape balanced rather than lopsided.

### Browser Window Mockup

Used in Hero, Deep Dive, CTA, and Feature cards to position Kaizen as a web app:

```
browser-window
├── .browser-titlebar
│   ├── .browser-dot.red / .yellow / .green (traffic lights)
│   └── .browser-url (centered URL bar)
└── .browser-content (dark mode compatible)
```

### Pill Badges

Small rounded pills used in Hero and section labels:

- Sage (primary green), Coral (accent), Cream (beige)
- `border-radius: 100px`, small caps with letter-spacing

### Buttons

- **Primary (`--charcoal` bg):** Full-width rounded pill, hover lifts + shadows
- **Outline:** Transparent with 2px charcoal border, fills on hover
- **CTA badges:** Dark charcoal bg with hover lift, used in CTA section
- **Theme toggle:** Round button (38px), rotates 15° on hover, swaps sun/moon SVG icons

### Tortoise Image

Styled as a raw photo (no border, no circle crop). Only one remains in the hero section.

---

## Assets

| File                     | Type                    | Usage                                            |
| ------------------------ | ----------------------- | ------------------------------------------------ |
| `kaizen-logo-noBack.png` | PNG (transparent alpha) | Navbar (82px) + Footer (76px, inverted to white) |
| `moscot-noback.png`      | PNG (transparent alpha) | Tortoise mascot in hero section                  |

---

## Responsive Breakpoints

| Breakpoint  | Key Changes                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **≤1024px** | Hero → single column, feature cards → 2 cols, deep dive → single column, footer → 3 cols. Browser window fills width.                                |
| **≤768px**  | Nav links hidden (hamburger), feature cards → 1 col, trust badges tighter, CTA browsers scaled down, footer → 2 cols. Tortoise peek shrinks to 76px. |
| **≤480px**  | Padding reduced, buttons smaller, CTA browsers wrap, footer → 1 col, CTA button compacted.                                                           |

---

## Dark Mode

- **Trigger:** System preference OR manual toggle button (sun/moon in navbar)
- **Persistence:** Saved in `localStorage` as `kaizen-theme` ('dark' | 'light')
- **Flash prevention:** Blocking `<script>` in `<head>` applies class before any paint
- **Scope:** `html.dark` class overrides CSS variables and component-specific styles
- **Key differences:**
  - Page bg: `#F8FAF5` → `#141715`
  - Cards: `#FFFFFF` → `#262927`
  - Text: `#6B6B6B` → `#B0B4B2`
  - Headlines: `#2D3B36` → `#E8EAE9`
  - Navbar gains translucent dark bg with blur
  - Browser chrome becomes dark (`#1E2023` titlebar, `#333640` URL bar)
  - Hero gradient becomes muted dark greens
  - Footer becomes deeper `#0D0F0E`

---

## Accessibility

- `aria-label` on all interactive elements (nav, buttons, toggle)
- `aria-expanded` on FAQ accordion questions
- `role="navigation"` on navbar
- `:focus-visible` ring in primary green
- `.sr-only` class for screen-reader-only content
- `@media (prefers-reduced-motion: reduce)` disables all animations and transitions
- Semantic heading structure (h1 → h2 → h3 → h4)
- Keyboard support: FAQ items open on Enter/Space

---

## Performance & File Structure

- **Single self-contained file:** All HTML, CSS (~600 lines), SVG icons (inline), and JS (~40 lines) in one document
- **Two external assets:** Logo PNG and tortoise PNG (small, cacheable)
- **Google Fonts:** Preconnected with `rel="preconnect"` for faster load
- **Responsive images:** No `srcset` needed — single PNG files
- **No JavaScript framework:** Vanilla JS only (DOM queries, class toggling, localStorage)
