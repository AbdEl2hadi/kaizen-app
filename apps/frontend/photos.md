# Kaizen Landing Page — Photos, UI Improvements & Background Video

All images should follow the existing brand style: **soft pastel, friendly, cartoon-illustrated wellness aesthetic**, sage green `#4CAF7D` / coral `#FF6F5E` / cream `#F0E6D2` palette, cloud/scalloped shapes, bold geometric sans headlines. Export as **PNG with transparent background** where noted.

---

## 1. Images to Generate (AI Prompts Included)

### 1.1 Tortoise Mascot Activity Pack (HIGH PRIORITY)
Replaces the single mascot with a family of lifestyle poses. Each is a transparent PNG, same character as `moscot-noback.png` (round shell, gentle smile, sage-green shell accents).

| File | Size | Usage | AI Prompt |
| ---- | ---- | ----- | --------- |
| `mascot-walking.png` | ~512×512 px, transparent | Feature card 3 ("Motivation that Lasts") — walking forward confidently | "Cute friendly cartoon tortoise mascot walking forward confidently with a determined smile, holding a small green flag, soft pastel illustration style, sage green and cream colors, rounded shapes, thick clean outlines, plain transparent background, no text, centered, full body" |
| `mascot-meditating.png` | ~512×512 px, transparent | Deep-dive stats card or Feature card 1 — sitting peacefully | "Cute friendly cartoon tortoise mascot sitting peacefully in meditation pose with closed eyes and a calm smile, tiny candle beside it, soft pastel illustration style, sage green and mint colors, rounded shapes, thick clean outlines, plain transparent background, no text, centered, full body" |
| `mascot-reading.png` | ~512×512 px, transparent | Feature card 2 ("All-in-One Tracking") — reading a book | "Cute friendly cartoon tortoise mascot reading a small green book with round glasses, cozy and focused expression, soft pastel illustration style, sage green and cream colors, rounded shapes, thick clean outlines, plain transparent background, no text, centered, full body" |
| `mascot-celebrating.png` | ~512×512 px, transparent | CTA banner — arms raised in celebration | "Cute friendly cartoon tortoise mascot celebrating with both arms raised up holding a small golden trophy and confetti around, joyful open smile, soft pastel illustration style, sage green and coral accents, rounded shapes, thick clean outlines, plain transparent background, no text, centered, full body" |
| `mascot-sleepy.png` | ~512×512 px, transparent | FAQ section decoration (optional) | "Cute sleepy cartoon tortoise mascot yawning with one hand covering mouth, eyes half closed, wearing a tiny nightcap, soft pastel illustration style, cream and sage green colors, rounded shapes, thick clean outlines, plain transparent background, no text, centered, full body" |

**Consistency tip:** generate all 5 in one session/style reference so the character stays identical across poses.

### 1.2 Feature Card Illustrations (HIGH PRIORITY)
Replace the 3 CSS mini-mockups inside the feature cloud-cards with real illustrations. Transparent PNG, landscape ~800×600 px.

| File | Card | AI Prompt |
| ---- | ---- | --------- |
| `feature-ai.png` | AI-Powered Insights | "Soft pastel cartoon illustration of a friendly glowing green brain surrounded by small sparkles, checkmarks and rising bar charts, floating on a mint green cloud, sage green #4CAF7D and mint palette, rounded shapes, thick clean outlines, transparent background, no text, landscape orientation" |
| `feature-tracking.png` | All-in-One Tracking | "Soft pastel cartoon illustration of a giant coral colored clipboard with three checklists, small calendar and bell icons floating beside it, coral #FF6F5E accents on cream background, rounded shapes, thick clean outlines, transparent background, no text, landscape orientation" |
| `feature-motivation.png` | Motivation that Lasts | "Soft pastel cartoon illustration of a golden trophy with a growing plant sprouting from it, three flame icons and a small star rising upward, warm yellow and cream palette with sage green accents, rounded shapes, thick clean outlines, transparent background, no text, landscape orientation" |

### 1.3 Hero Section Artwork (HIGH PRIORITY)

| File | Size | Usage | AI Prompt |
| ---- | ---- | ----- | --------- |
| `hero-backdrop.png` | 1600×900 px | Subtle full-bleed background behind the hero grid (opacity ~0.5, blurred) | "Very soft pastel abstract illustration of rolling hills, tiny clouds, small plants and a winding path, dreamy and minimal, mint green #E8F5E9 to pale yellow #FFFDE7 to light coral #FFF0ED gradient, no characters, no text, no sharp edges, soft focus, wide landscape" |
| `hero-illustration.png` | ~800×600 px | Replaces the CSS-only Safari mockup inside the hero browser window (product screenshot style) | "Clean pastel cartoon illustration of a habit tracker dashboard interface: rounded checklist cards with green checkmarks, a circular 65-day streak ring, small progress bars, a tiny tortoise mascot icon in the corner, mint and white palette with sage green and coral accents, rounded shapes, thick clean outlines, transparent background, no readable text" |
| `streak-ring.png` | ~400×400 px | Optional — standalone streak ring for the hero right side | "Pastel cartoon illustration of a thick circular progress ring 92 percent filled in sage green #4CAF7D with a small flame emoji and the number 65 inside, white background circle, soft shadows, rounded style, no text other than the number 65, transparent background" |

### 1.4 CTA Banner Artwork

| File | Size | Usage | AI Prompt |
| ---- | ---- | ----- | --------- |
| `cta-illustration.png` | 900×500 px | Behind CTA headline (white, 15–20% opacity) | "Soft pastel cartoon illustration of a group of small tortoises climbing a winding staircase that leads to a glowing star on top, tiny leaves and plants along the stairs, coral #FF6F5E and warm cream palette, no text, no characters facing camera, transparent background, wide landscape" |

### 1.5 OG / Social Share Image (MEDIUM PRIORITY)

| File | Size | Usage | AI Prompt |
| ---- | ---- | ----- | --------- |
| `og-kaizen.png` | 1200×630 px | Social preview (`og:image` meta tag) | "Landing page social banner: soft pastel mint background, cute cartoon tortoise mascot in the center holding a green checkmark flag, text area on the left reserved for headline 'Small Steps. Big Change.', sage green #4CAF7D, coral #FF6F5E and cream accents, rounded shapes, thick clean outlines, no actual text in image" |

### 1.6 Favicon / App Icon (MEDIUM PRIORITY)

| File | Size | Usage | AI Prompt |
| ---- | ---- | ----- | --------- |
| `kaizen-icon.png` | 512×512 px (then 32×32, 180×180) | Browser favicon + PWA icon | "Flat minimal app icon: rounded square in sage green #4CAF7D with a simple white tortoise shell logo mark in the center, flat vector style, soft rounded corners, no text, centered, no background outside the rounded square" |

---

## 2. UI Improvements (Actionable)

### 2.1 Hero
- **Replace the CSS Safari mockup** with the `hero-illustration.png` product shot — real product visuals convert better than abstract mockups.
- **Add `hero-backdrop.png`** as a soft blurred layer behind the grid so the pastel gradient feels less flat.
- Wrap the two CTA buttons in an `aria-label`d link pointing to the real app route (currently dead `<button>`s).
- Add a small **social proof row** under the CTAs: "★ 4.9 — 12,000+ habit builders" (trust signal above the fold).

### 2.2 Trust Row (Awards)
- Currently 3 badges; design.md says 4. Add a 4th badge ("5M+ Habits Completed") and make the row scroll-able on mobile instead of wrapping awkwardly.

### 2.3 Feature Cards
- Swap CSS mini-mockups for the **feature illustrations** (section 1.2).
- Add a **"Learn more" text link** on each card for interactivity and depth.
- Unify card padding: `p-10` on all three (currently consistent, keep it).

### 2.4 Deep Dive
- Replace the emoji progress bars with real chart imagery OR keep bars but add an **animated counter** (design doc already mentions animated values — implement count-up on scroll into view).
- Add a mini **testimonial strip** below the stats ("'I haven't missed a day in 6 months' — Maya").

### 2.5 FAQ
- Add the **sleepy mascot** as a floating accent beside the heading (mobile: hide).
- Currently no FAQ on desktop uses real links — fine, but ensure `aria-expanded` and keyboard nav work (already implemented).

### 2.6 CTA Banner
- Add `cta-illustration.png` at low opacity behind the headline for depth.
- Make CTA buttons real `<a>` links to signup route.
- Reduce emoji usage in the mini browser mockups (`📋`, `☀️`, `🏃`) — replace with tiny SVG icons for a more premium look.

### 2.7 Global
- **Add `og:image`** meta tag pointing to `og-kaizen.png`.
- **Add favicon** + PWA icons from section 1.6.
- Add `loading="lazy"` to all non-hero images and `fetchpriority="high"` on the hero illustration.
- Ensure `prefers-reduced-motion` media query disables the new video background (critical for accessibility).
- Add a scroll-triggered `fadeUp` on section headings (currently only subheading has it).

---

## 3. Landing Page Background Video

Use one **looping, muted, autoplay** video (`<video autoplay loop muted playsinline poster="hero-backdrop.png">`, `aria-hidden`, `object-cover`, absolutely positioned behind hero content, opacity ~0.35–0.5, with a gradient overlay on top for text legibility). Keep files small: 10–20 s loop, ≤5 MB, `video/mp4` (H.264) + optional `video/webm` fallback.

**Recommended concepts (any AI video generator can produce these):**

| # | Concept | Style | Why it fits | Duration / Specs |
| -- | ------- | ----- | ----------- | ---------------- |
| 1 | **Slow growing plant / sprout timelapse** | Soft pastel 3D animation, mint-green background | Matches "growth" + "one step at a time" philosophy; subtle and calm | 15 s loop, 1920×1080, muted, slow easing |
| 2 | **Tortoise walking across soft hills** | Cartoon 3D, pastel, gentle bounce | Mascot storytelling — steady consistent progress made literal | 20 s loop, 1920×1080, character walks then loops |
| 3 | **Floating cloud shapes with particles** | 2D motion graphics in brand colors (mint, cream, coral) | Purely decorative, never distracts from copy, matches cloud-card design language | 12 s loop, 1920×1080, 5–8 fps particles, very low motion |
| 4 | **Rising steps / staircase to a glowing sun** | Cartoon illustration style | Matches CTA illustration and "Big Change" promise | 15 s loop, 1920×1080, slow upward pan |
| 5 | **Japanese sumi-e / watercolor ink bloom** (dark mode) | Gentle ink diffusing in water, dark green tones | Honors the Kaizen (改善) Japanese origin; perfect for dark-mode hero | 15 s loop, 1920×1080, dark palette `#141715`–green |

**Implementation notes:**
- Place the video **only in the hero section** (a full-page fixed video hurts performance and readability).
- Overlay: `linear-gradient(180deg, rgba(248,250,245,0.6), rgba(248,250,245,0.9))` on light mode; dark equivalent `rgba(20,23,21,0.65)`.
- Load via `preload="metadata"`, pause when tab hidden (`visibilitychange` listener) to save bandwidth.
- **Best pick:** Concept #1 (plant growth) for light mode + #5 (ink bloom) as the dark-mode variant — two video files, both tiny loops.