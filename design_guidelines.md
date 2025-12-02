# WeParlay.io Design Guidelines

## Design Approach
**Reference-Based: Premium Gaming/Betting Luxury**
Drawing inspiration from high-end platforms like Stake.com, Roobet, and luxury crypto platforms, combined with the sleek sophistication of Apple and the boldness of premium sports brands. Dark, dramatic, and unapologetically luxurious.

## Typography
- **Primary**: Inter or Manrope (clean, modern sans-serif via Google Fonts)
- **Display/Headlines**: Montserrat Bold or Poppins Bold for impact
- **Accent/Premium Features**: Playfair Display or Cormorant (serif for luxury touch on VIP elements)
- **Hierarchy**: Hero (text-5xl to text-7xl), Section Headers (text-3xl to text-4xl), Body (text-base to text-lg), Fine Print (text-sm)

## Layout System
**Spacing Primitives**: Tailwind units of 3, 4, 6, 8, 12, 16, 20, 24
- Container max-width: max-w-7xl
- Section padding: py-16 md:py-24 lg:py-32
- Component spacing: gap-6 to gap-12
- Card padding: p-6 to p-8

## Component Library

**Navigation**
- Fixed header with backdrop blur (backdrop-blur-xl bg-black/80)
- Logo left, nav center, "Become VIP" CTA right (gold gradient button)
- Mobile: Hamburger menu with slide-in overlay

**Buttons**
- Primary VIP: Gold gradient (from-amber-400 via-yellow-500 to-amber-600) with subtle shadow
- Secondary: Platinum/silver gradient (from-gray-300 via-slate-200 to-gray-300)
- Standard: White border with transparent bg, white text
- All buttons: rounded-lg, px-8 py-3, font-semibold

**Cards**
- Dark glass-morphism: bg-slate-900/60 with border border-slate-700/50
- VIP Cards: Add gold border (border-amber-500/30) and subtle gold glow
- Hover: Lift effect (transform scale-105) and increased glow

**King VIP Engine Promotional Badge**
- Ornate card with double border (outer gold gradient, inner platinum)
- Crown icon or shield emblem
- "26-Point Analysis" prominently displayed
- Animated subtle pulse glow effect on gold accents
- Premium chip/badge design with metallic gradients

**Stats/Numbers Display**
- Large bold numbers with gold gradient fill
- Small descriptive text below in muted gray
- Arranged in 3-4 column grid

**VIP Tier Cards**
- Three tiers: Silver, Gold, Platinum/Diamond
- Each with tier-specific color accents (silver-400, amber-500, purple-400)
- Pricing prominent, features list with checkmarks
- "Current Plan" or "Upgrade" CTAs

**Testimonials**
- Quote cards with user avatar, name, tier badge
- Star ratings in gold
- 2-column on desktop, stacked mobile

## Images

**Hero Background** (Required)
- High-energy sports action montage: Stadium crowd, close-up betting slips, championship moments
- Dark overlay (bg-gradient-to-b from-black/70 via-black/50 to-black)
- Positioned: Full viewport height (min-h-screen), background-size: cover
- Overlay buttons with backdrop-blur-md bg-white/10

**King VIP Engine Section**
- Dashboard preview mockup showing analytics interface with charts, predictions, 26-point scores
- Positioned in dedicated section with premium frame treatment

**Social Proof**
- Winner celebration photos (subtle, tasteful)
- Generic sports betting environment shots

**VIP Lifestyle Imagery**
- Luxurious lifestyle shots (abstract, aspirational)
- Used as background elements in VIP tier sections

## Page Structure

**Hero Section**
- Full-screen sports imagery background
- Centered content: Bold headline "Elite Sports Betting Intelligence"
- Subheadline highlighting AI advantage
- Dual CTAs: "Start Free Trial" (gold) + "See The Engine" (outline)
- Floating stats bar: "94% Win Rate" | "50K+ Members" | "$2M+ Payouts"

**King VIP Engine Showcase** (Immediately after hero)
- Large section (py-24)
- Left: Dashboard mockup image
- Right: Feature breakdown with 26-point system highlights
- Gold "Flagship Feature" badge
- Premium styling with gold accents throughout

**Features Grid**
- 3-column layout: AI Analysis, Live Data, Expert Picks
- Icons with gold accents, concise descriptions
- Dark glass-morphism cards

**VIP Tiers Comparison**
- 3-column pricing cards (Silver, Gold, Platinum)
- Feature comparison table below
- Prominent "Most Popular" badge on Gold tier

**Social Proof Section**
- 2-3 column testimonial cards
- Big numbers: Total payouts, active users, avg. ROI
- Winner stories with photos

**Final CTA**
- Dark section with gold accents
- "Join The Winners Circle" headline
- Email capture + primary CTA
- Trust badges: Secure, Licensed, 24/7 Support

**Footer**
- Rich multi-column: Quick Links, Resources, Legal, Contact
- Newsletter signup
- Social icons
- Disclaimer text (responsible gambling)
- Copyright with gold accent line separator

**Color Philosophy** (For Implementation)
- Base: Deep blacks (bg-black, bg-slate-950)
- Glass layers: slate-900/60 with borders
- Gold: amber-400 to yellow-600 gradients
- Platinum: gray-200 to slate-300
- Accent vibrants: emerald-500 (wins), red-500 (alerts), blue-500 (info)