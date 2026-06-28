# Design Fidelity Checklist

Used by `design-fidelity-qa-agent` (Stage 10.4a) to score the live build
against the rendered templated reference for the active niche.

## Placeholder convention

Every `{{playbook.PATH}}` reference reads from
`templates/{active-niche-slug}/niche-playbook/` (Module 2D fills these
per niche). Every `{{brand-dna.PATH}}` reference reads from the per-client
`Pipeline Data/brand/brand-dna.json` Stage 7 produces. Items with neither
prefix are universal (apply to every client in every niche).

If a placeholder resolves to a falsy value (zero, empty list, null), the
related check is marked N/A and excluded from the pass-rate denominator.

## Region thresholds

Section weights and per-region SSIM thresholds. Aggregate target is
0.90 weighted mean across all regions, with no region below its threshold.

| Region | Threshold | Weight | Why |
|--------|-----------|--------|-----|
| Hero (above-fold) | 0.92 | 1.5 | First impression, conversion-critical |
| TrustStrip | 0.95 | 1.5 | Strict composition |
| Reviews | 0.88 | 1.0 | Card layout + carousel mechanics |
| WhyChooseUs | 0.88 | 1.0 | Two-column with full-bleed photo |
| Gallery | 0.88 | 1.0 | Carousel + accent borders |
| Process | 0.88 | 1.0 | Grid layout, numbered steps |
| SpecialOffers | 0.85 | 1.0 | Card grid with optional financing callout |
| Services | 0.85 | 1.0 | Service-card grid |
| Founder | 0.90 | 1.2 | Photo placement + supporting cards |
| Blog | 0.85 | 1.0 | Card preview |
| ServiceAreas | 0.85 | 1.0 | City grid + map embed |
| CTABanner | 0.88 | 1.0 | Inline form repeat |
| Footer | 0.88 | 1.0 | Multi-column + accent bullets |

## Composition checks (binary pass/fail, must all pass)

- [ ] Section order matches the canonical website-template:
  Nav → Hero → TrustStrip → Reviews → WhyChooseUs → Gallery →
  Process → SpecialOffers → Services → Founder → Blog →
  ServiceAreas → CTABanner → Footer
- [ ] Hero ends above the fold on desktop (1440 x 900 viewport)
- [ ] TrustStrip floats up into Hero with the negative margin-top
  defined in the website-template (the float offset is template-level,
  not niche-variable)
- [ ] Process is a grid of `{{playbook.process.stepCount}}` cards (NOT a
  flat list). If `stepCount >= 6`, render as a 3x2 grid; if 3-5, as a
  single row.
- [ ] Gallery is between WhyChooseUs and Process
- [ ] Founder photo position matches the website-template
- [ ] Section background alternation: primary and secondary only, no
  third color
- [ ] Every section has SectionPolygons (or HeroPolygons) overlay
- [ ] Mobile sticky CTA bar present (visible at viewport <= 768px)

## Component-level checks (Component Library compliance)

- [ ] All primary CTAs use the canonical button component from the
  website-template's Component Library
- [ ] All primary CTAs read `{{playbook.copy-locks.ctaPrimary}}` verbatim
- [ ] No buttons defined inline with custom styles
- [ ] LeadForm header reads `{{playbook.copy-locks.formHeader}}` verbatim
- [ ] LeadForm privacy line reads `{{playbook.copy-locks.formPrivacy}}`
  verbatim
- [ ] All glass panels use the opacity defined in the website-template
  tokens (do not override per client)
- [ ] All review pills use the multi-color exception logos
  (Google / Facebook / BBB), per the website-template's allowed
  exceptions to the monochrome icon rule
- [ ] All other icons are monochrome thin-line Heroicons (strokeWidth 1.5)
- [ ] All structural elements have border-radius 0 (zero exceptions
  except the green availability dot in nav)
- [ ] Primary button gradient uses the per-client accent stops:
  `{{brand-dna.palette.accent_light}}` →
  `{{brand-dna.palette.accent_mid}}` →
  `{{brand-dna.palette.accent}}` →
  `{{brand-dna.palette.accent_light}}`
- [ ] btn-glow shadow is on every primary CTA (3D effect baked in
  template)
- [ ] Hero bottom-right small polygon at opacity 1.0
- [ ] Process number badges match the website-template's number-badge
  treatment
- [ ] FloatingTrustStrip renders exactly
  `{{playbook.trust-signals.trustStripCount}}` badges, sourced from
  `{{playbook.trust-signals.badges}}` and filtered by the per-client
  `brand-dna.certifications` booleans
- [ ] No text-mark fallbacks for badges (only real SVG / PNG logo files
  from the niche-playbook trust-badges library)

## Color checks

- [ ] Accent color used ONLY on: CTAs, icon strokes, accent lines,
  active nav state, category labels. Nowhere else.
- [ ] Glass panel background uses the per-client primary color at the
  template-defined opacity:
  `rgba({{brand-dna.palette.primary-rgb}}, {{template.glass-opacity}})`
- [ ] Metallic-text uses the multi-stop accent gradient defined by
  `{{brand-dna.palette.accent_*}}` stops

## Typography checks

- [ ] Heading font matches `{{brand-dna.typography.heading}}`
- [ ] Body font matches `{{brand-dna.typography.body}}`
- [ ] Heading capitalization matches the website-template's heading
  treatment (typically uppercase for display headings)
- [ ] H1 size uses the template's clamp range; do not override per
  client
- [ ] Card-heading sizes match the template's `text-{size}` utilities

## Mobile checks (375px viewport)

- [ ] Hero stacks vertically: H1 + claims first, form second
- [ ] TrustStrip claims wrap onto multiple rows without overflow
- [ ] Process cards stack 1-column (was a grid on desktop)
- [ ] Gallery shows 1 card at a time with arrows for navigation
- [ ] Founder photo and text stack vertically
- [ ] Service Areas city grid wraps to 2 columns max
- [ ] MobileCTABar is visible and sticky at bottom
- [ ] No horizontal scroll on any section

## Em-dash audit

- [ ] grep for em-dash character returns zero matches across src/
  (excluding node_modules)
- [ ] grep for `&mdash;` returns zero matches
- [ ] grep for `&#8212;` returns zero matches

## Real photography vs placeholder

- [ ] No `placeholder.jpg`, `lorem-ipsum.png`, `photo-placeholder.svg`
- [ ] Hero image is the Stage 9 hero-generation output (desktop AND
  mobile variants)
- [ ] Owner photo is from `clients/[Client Name]/Pipeline Data/assets/owner/`
- [ ] All gallery photos resolve to real files (not 404)
- [ ] All service card photos resolve to real files

## Pass criteria

ALL of:
1. Aggregate weighted score >= 0.90
2. No individual region below its threshold
3. All composition checks pass
4. All component-level checks pass
5. All color, typography, mobile, em-dash, and photography checks pass

If ANY of the above fails, the loop continues (up to 5 iterations).
