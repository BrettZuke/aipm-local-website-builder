# SOP Compliance Checklist

Used by `sop-qa-agent` (Stage 10.4b). Items are organized by section.

Score format: each item is `[ ] id, description` with a `Fix:` line for
automated remediation guidance.

Gate: 95% (PASS / (PASS + FAIL), excluding N/A).

## Placeholder convention

Every `{{playbook.PATH}}` reference reads from
`templates/{active-niche-slug}/niche-playbook/` (Module 2D fills these
per niche). Every `{{brand-dna.PATH}}` reference reads from the per-client
`Pipeline Data/brand/brand-dna.json` Stage 7 produces. Items with neither
prefix are universal (apply to every client in every niche).

If a placeholder resolves to a falsy value (zero, empty list, null), the
related check is marked N/A and excluded from the pass-rate denominator.

---

## NAV (sticky)

- [ ] `nav.sticky`, Navbar is `position: sticky` or `fixed` at top
  Fix: Add `sticky top-0 z-50` to outer Nav div

- [ ] `nav.accent_top_line`, 2px accent line at top edge of navbar,
  color `{{brand-dna.palette.accent}}`
  Fix: Render `<span className="accent-line" />` as first child of nav

- [ ] `nav.logo_left`, Client logo in top-left, links to `/`
  Fix: `<a href="/"><img src={brandDna.logo.path} className="h-10" /></a>`

- [ ] `nav.green_dot_pulse`, Pulsing green dot beside phone number
  Fix: Use `<span className="pulse-dot" />` from tokens.css

- [ ] `nav.availability_text`, `{{playbook.copy-locks.availabilityLabel}}` beside green dot
  Fix: Nav component reads availability label from brand-dna.copy.availableNow (which Stage 7 fills from the niche playbook)

- [ ] `nav.phone_clickable`, Phone number is `<a href="tel:...">`
  Fix: `<a href={"tel:" + brandDna.contact.phone_tel_link}>{brandDna.contact.phone}</a>`

- [ ] `nav.cta_button`, `{{playbook.copy-locks.ctaPrimary}}` button on right
  Fix: Use canonical button component, size="sm", `href="#lead-form"`

- [ ] `nav.cta_anchors_form`, CTA link is `#lead-form` anchor, NOT `/contact`
  Fix: Verify href is anchor, not page path

- [ ] `nav.no_em_dashes`, No em-dashes in nav copy
  Fix: Replace any em-dash with colon, comma, or period

---

## HERO (above-fold)

- [ ] `hero.above_fold`, Hero ends before viewport fold on desktop (1440x900)
  Fix: Set hero height to `calc(100vh - 14rem)` so TrustStrip is visible above fold

- [ ] `hero.h1_format`, H1 follows the format defined in
  `{{playbook.copy.heroH1Format}}` (typically [Service] + [Location] +
  [Trust Signal] for contractor / home-services; varies per niche).
  Fix: Edit `brand-dna.hero.h1_headline` against the playbook format

- [ ] `hero.h1_max_words`, H1 is 10 words or fewer
  Fix: Trim `brand-dna.hero.h1_headline`

- [ ] `hero.eyebrow_above_h1`, Eyebrow text in accent color above H1
  Fix: Render `brand-dna.hero.eyebrow` as `<span>` with text-accent class

- [ ] `hero.accent_separator`, 2px accent separator line (w-16) between
  eyebrow and H1
  Fix: `<span className="accent-line w-16" />` between elements

- [ ] `hero.tagline_below_h1`, Tagline (`brand-dna.hero.tagline`) below H1
  Fix: Render after H1

- [ ] `hero.review_pills`, Review pills below tagline, one per platform
  in `{{playbook.trust-signals.placements}}` that includes "hero", filtered
  by per-client `brand-dna.trust` ratings
  Fix: Render `<ReviewPill platform="..." />` for each pill held

- [ ] `hero.review_pills_clickable`, Each review pill is `<a target="_blank">`
  Fix: ReviewPill component already wraps in anchor; verify href is set

- [ ] `hero.trust_claims`, Hero trust claim rows match
  `{{playbook.copy.heroTrustClaims}}` (an ordered list of claim strings the
  niche playbook supplies). Count is `len(heroTrustClaims)`.
  Fix: Render `<TrustClaimRow />` per entry from the playbook list

- [ ] `hero.trust_claim_icons_thin_line`, Icons are Heroicons strokeWidth 1.5
  Fix: Use HeroIconPaths from TrustClaimRow

- [ ] `hero.lead_form_right`, Frosted glass LeadForm in right column
  Fix: `<LeadForm id="lead-form" />` in right column

- [ ] `hero.glass_panel_opacity`, Form glass panel opacity matches the
  template's `--glass-opacity` token (do not override per client)
  Fix: Verify `--glass-opacity` token is unchanged

- [ ] `hero.lead_form_header`, Form header reads
  `{{playbook.copy-locks.formHeader}}` verbatim
  Fix: LeadForm component reads from playbook; verify not overridden

- [ ] `hero.lead_form_button`, Form submit button reads
  `{{playbook.copy-locks.ctaPrimary}}` verbatim
  Fix: LeadForm hardcoded label from playbook

- [ ] `hero.lead_form_privacy`, Privacy line reads
  `{{playbook.copy-locks.formPrivacy}}` verbatim
  Fix: LeadForm hardcoded text from playbook

- [ ] `hero.background_photo`, Hero uses Stage 9 hero image as background
  Fix: Set bg image to `/hero-final.png`

- [ ] `hero.overlay_gradient`, Dark gradient overlay over hero photo
  Fix: Add `<div className="hero-overlay" />` over image

- [ ] `hero.polygons_present`, `<HeroPolygons />` renders for depth
  Fix: Import and render at top of Hero section

- [ ] `hero.polygon_bottom_right`, Bottom-right small polygon at opacity 1.0
  Fix: Verify HeroPolygons component sets `fillOpacity={1.0}` on the
  small bottom-right polygon

- [ ] `hero.no_em_dashes`, No em-dashes in hero copy
  Fix: Replace in `brand-dna.hero` or copy-deck

---

## TRUSTSTRIP (floats below hero)

- [ ] `truststrip.float_offset`, marginTop matches the website-template's
  defined float offset (template-level constant, not niche-variable)
  Fix: Verify FloatingTrustStrip uses the template constant

- [ ] `truststrip.glass_panel`, Claims pill uses glass-panel class
  Fix: Verify in component

- [ ] `truststrip.claims_count`, Claims count equals
  `len({{playbook.copy.trustStripClaims}})`; each claim text matches the
  playbook list verbatim
  Fix: Component renders from playbook list; verify list length and contents

- [ ] `truststrip.dividers_accent`, Thin accent-color dividers between claims,
  color `{{brand-dna.palette.accent}}`
  Fix: Component handles this via accent CSS variable

- [ ] `truststrip.badges_count`, Badge count equals
  `{{playbook.trust-signals.trustStripCount}}`, sourced from the niche
  playbook badge library and filtered by per-client
  `brand-dna.certifications` booleans
  Fix: Verify FloatingTrustStrip filters by playbook + brand-dna

- [ ] `truststrip.no_text_fallback`, No text-mark fallbacks for missing
  badges (only real SVG / PNG logo files from
  `templates/{active-niche-slug}/niche-playbook/trust-badges/`)
  Fix: Verify component does not render text fallbacks

- [ ] `truststrip.badges_real_logos`, Badge images are real logo files
  Fix: Confirm files at the playbook-defined paths exist and load

---

## REVIEWS

- [ ] `reviews.header_format`, Header follows the format defined in
  `{{playbook.copy.reviewsHeaderFormat}}` (e.g. "Rated 5.0 Stars Across
  {N}+ {Platform} Reviews"), substituting per-client review counts from
  `brand-dna.trust`
  Fix: Use brand-dna.trust counts in section copy per playbook format

- [ ] `reviews.cards_visible`, 3 review cards visible at desktop, 1 at
  mobile (template-level layout, not niche-variable)
  Fix: Use `grid-cols-3 lg:grid-cols-3 md:grid-cols-1`

- [ ] `reviews.carousel_arrows`, Prev/next arrows for navigation
  Fix: Add carousel controls to Reviews section

- [ ] `reviews.dot_indicators`, Dot indicators below carousel
  Fix: Add indicators

- [ ] `reviews.translucent_quote`, Each card has a translucent quote mark
  (template-level treatment, not niche-variable)
  Fix: ReviewCard component handles this

- [ ] `reviews.platform_badge`, Each card shows platform name
  Fix: ReviewCard handles this

- [ ] `reviews.stars_match_rating`, Star count matches review rating
  Fix: ReviewCard accepts rating prop

- [ ] `reviews.accent_avatar_circle`, Reviewer initial in accent-color
  circle, fill `{{brand-dna.palette.accent}}`
  Fix: ReviewCard handles this

- [ ] `reviews.no_em_dashes`, No em-dashes in review text
  Fix: Audit copy-deck reviews

---

## WHYCHOOSEUS

- [ ] `whychooseus.value_props_min`, At least 4 value-prop bullets
  Fix: Generate from `copy-deck.why_choose_us`

- [ ] `whychooseus.icon_wrappers`, Each prop has the template's icon-3d
  wrapper
  Fix: Wrap icons in `<div className="icon-3d w-12 h-12">`

- [ ] `whychooseus.cta_button`, `{{playbook.copy-locks.ctaPrimary}}` button
  below props
  Fix: Use canonical button component

- [ ] `whychooseus.full_bleed_photo`, Right column has full-section-height
  photo
  Fix: Use `object-cover h-full`

- [ ] `whychooseus.edge_fade`, Photo has dark gradient fade on the inside
  edge
  Fix: Add overlay div

---

## GALLERY

- [ ] `gallery.position`, Gallery is between WhyChooseUs and Process
  Fix: Verify section order in Home page component

- [ ] `gallery.infinite_carousel`, Gallery is an infinite-scrolling
  carousel, not a static grid
  Fix: Implement with autoplay + arrows

- [ ] `gallery.accent_top_border`, Each card has an accent top border,
  color `{{brand-dna.palette.accent}}`
  Fix: GalleryCard handles this

- [ ] `gallery.aspect_ratio`, Cards are 4/3 aspect ratio
  Fix: GalleryCard handles this

- [ ] `gallery.accent_caption_bar`, Caption row has accent-color left bar
  Fix: GalleryCard handles this

- [ ] `gallery.real_photos`, All photos are real client photos, not
  placeholders
  Fix: Drop into `clients/[Client Name]/Pipeline Data/assets/photos/projects/`

---

## PROCESS

- [ ] `process.step_count`, Process renders
  `{{playbook.process.stepCount}}` steps (NOT a hardcoded number). Step
  titles match `{{playbook.process.steps[*].title}}` in order.
  Fix: Use `niche-playbook/process.json` to populate step list

- [ ] `process.grid_shape`, Grid columns chosen by stepCount: 3 cols
  when stepCount >= 6 (3x2), 4 cols when stepCount == 4, 5 cols when
  stepCount == 5
  Fix: Conditional grid layout in Process component

- [ ] `process.muted_digit_treatment`, Digit treatment per template
  spec (opacity, font size, font family come from template tokens,
  not per-client)
  Fix: ProcessNumberBadge handles this

- [ ] `process.thin_accent_divider`, Thin accent divider below digit,
  color `{{brand-dna.palette.accent}}`
  Fix: ProcessCard handles this

- [ ] `process.icon_box`, Each step has icon-3d box for icon
  Fix: ProcessCard handles this

- [ ] `process.accent_top_border`, Each card has accent top border,
  color `{{brand-dna.palette.accent}}`
  Fix: ProcessCard handles this

- [ ] `process.risk_reversal`, Risk-reversal line below grid, text from
  `{{playbook.copy.riskReversalLine}}` (e.g. "You are in control at every
  step. No pressure, no obligation, no surprise charges.")
  Fix: Read from playbook

- [ ] `process.cta_below`, `{{playbook.copy-locks.ctaPrimary}}` button
  below disclaimer
  Fix: Use canonical button component

---

## SPECIALOFFERS

- [ ] `specialoffers.cards_count`, Card count matches
  `len(brand-dna.special_offers.groups)`. If empty, the section renders
  nothing and the check is N/A.
  Fix: Map over `brand-dna.special_offers.groups`

- [ ] `specialoffers.discount_amount`, Discount amount matches
  per-group value in `brand-dna.special_offers.groups[*].discount_amount`
  Fix: Reference brand-dna value

- [ ] `specialoffers.financing_callout`, Left-bordered financing callout
  below cards if `brand-dna.special_offers.financing.enabled` is true.
  If false, mark as N/A.
  Fix: Conditional render based on brand-dna

- [ ] `specialoffers.no_em_dashes`, No em-dashes in offer copy

---

## SERVICES

- [ ] `services.card_count`, Between 4 and 6 service cards (template-level
  range)
  Fix: Generate from `seo-strategy.json` services

- [ ] `services.real_photos`, Each card has real service photo
  Fix: Drop photos into `clients/[Client Name]/Pipeline Data/assets/photos/services/`

- [ ] `services.accent_line`, Each card has a short accent line, color
  `{{brand-dna.palette.accent}}`
  Fix: ServiceCard handles this

- [ ] `services.learn_more_link`, Each card has "Learn More →" link in
  accent color
  Fix: ServiceCard handles this

---

## FOUNDER

- [ ] `founder.photo_position`, Photo position matches the website-template
  default (template-level, not niche-variable). Per-client may override
  via `brand-dna.founder.photo_position`.
  Fix: Order columns per template default

- [ ] `founder.real_owner_photo`, Owner photo from
  `clients/[Client Name]/Pipeline Data/assets/owner/`
  Fix: Drop owner photo file

- [ ] `founder.years_stat_card`, Floating accent-color stat card with
  "{N}+ YEARS OF EXPERIENCE" where N is `brand-dna.trust.years_in_business`
  Fix: Render from brand-dna

- [ ] `founder.eyebrow_about`, Eyebrow reads "ABOUT {COMPANY_NAME}" in
  accent color, color `{{brand-dna.palette.accent}}`
  Fix: Use `brand-dna.company_name`

- [ ] `founder.metallic_h2`, H2 uses metallic-text class
  Fix: `<MetallicHeading>...</MetallicHeading>`

- [ ] `founder.story_paragraphs`, Two paragraphs of founder story
  Fix: Render `brand-dna.founder.story_paragraph_1` and `story_paragraph_2`

- [ ] `founder.guarantee_quote`, Blockquote with
  `brand-dna.founder.personal_guarantee_quote`, accent-color left border
  Fix: `<blockquote className="border-l-2 border-accent pl-6">{quote}</blockquote>`

- [ ] `founder.quote_attribution`, Attribution: "{founder.name},
  {founder.title}"

- [ ] `founder.learn_more_button`, Outline button "LEARN MORE ABOUT US →"
  Fix: Use canonical OutlineButton

- [ ] `founder.supporting_cards`, Supporting cards row below founder
  photo+text (e.g. Vision / Mission for contractor niche; varies per
  niche playbook). Card titles from `{{playbook.copy.founderSupportingCards}}`
  Fix: Read card titles + bodies from playbook

- [ ] `founder.no_em_dashes`, No em-dashes in founder copy or quote
  Fix: Audit story paragraphs and personal_guarantee_quote

---

## BLOG

- [ ] `blog.cards_count`, 3 blog preview cards
  Fix: Generate from copy-deck blog section

- [ ] `blog.featured_image`, Each card has real featured image
  Fix: Generate or source images

- [ ] `blog.date_in_accent`, Date appears in accent color
  Fix: BlogCard handles this

- [ ] `blog.no_em_dashes`, No em-dashes in blog excerpts

---

## SERVICEAREAS

- [ ] `serviceareas.city_grid`, City grid covering
  `brand-dna.contact.service_areas`
  Fix: Map over `service_areas` array

- [ ] `serviceareas.maps_embed`, Google Maps iframe embed
  Fix: Use `brand-dna.contact.google_maps_embed_url`

- [ ] `serviceareas.cta_button`, `{{playbook.copy-locks.ctaPrimary}}` button
  Fix: Use canonical button component

---

## CTABANNER

- [ ] `ctabanner.inline_form_repeat`, Full LeadForm repeated inline
  Fix: `<LeadForm id="cta-banner-form" />`

- [ ] `ctabanner.section_polygons`, SectionPolygons present

---

## FOOTER

- [ ] `footer.accent_top_line`, 2px accent line at top of footer, color
  `{{brand-dna.palette.accent}}`
  Fix: `<span className="accent-line" />` as first child

- [ ] `footer.columns`, Multi-column layout per template (typically 4
  columns: Brand, Company, Services, Contact+CTA)
  Fix: `grid grid-cols-1 md:grid-cols-4 gap-8`

- [ ] `footer.accent_bullets`, All nav links have accent-color bullet
  prefix
  Fix: Add `before:content-["+"] before:text-accent` to anchor styles

- [ ] `footer.trust_row`, Trust row with rating + license fields from
  `brand-dna.trust`, separator must be space-period-space (NOT em-dash)
  Fix: Use brand-dna.trust values with safe separators

- [ ] `footer.copyright_split`, Copyright bar: "© {COMPANY_NAME}" left,
  "Made with love by {{AGENCY_NAME}}" right
  Fix: `flex justify-between` on copyright row

- [ ] `footer.no_em_dashes`, No em-dashes in any footer copy

---

## MOBILE (375x812 viewport)

- [ ] `mobile.cta_bar_visible`, MobileCTABar renders at bottom
  Fix: Verify `md:hidden` class allows mobile only

- [ ] `mobile.cta_bar_time_aware`, Bar shows
  `{{playbook.copy-locks.mobileCallLabel}}` during business hours and
  `{{playbook.copy-locks.ctaPrimary}}` after hours
  Fix: MobileCTABar component handles this; verify hoursStart/hoursEnd

- [ ] `mobile.hero_stacks`, Hero stacks vertically: H1 + claims first,
  form second

- [ ] `mobile.no_horizontal_scroll`, No section overflows horizontally
  Fix: Audit each section, add `overflow-hidden` where needed

- [ ] `mobile.process_1_col`, Process cards stack 1-column

- [ ] `mobile.gallery_1_card`, Gallery shows 1 card at a time

- [ ] `mobile.touch_targets`, All buttons and links are min 44px tap target

---

## GLOBAL

- [ ] `global.em_dash_audit`, `grep -rn` for em-dash + `&mdash;` +
  `&#8212;` across `src/` returns 0
  Fix: Replace all em-dashes with colons, periods, or commas

- [ ] `global.cta_label_consistent`, Every primary CTA reads
  `{{playbook.copy-locks.ctaPrimary}}`
  Fix: Use canonical button everywhere; never inline-style buttons

- [ ] `global.cta_anchors_form`, No CTA links to `/contact`; all anchor
  to on-page form
  Fix: Verify all primary buttons use `#lead-form` or section-specific
  anchor

- [ ] `global.no_placeholders`, No placeholder filenames anywhere
  Fix: `find public -name "*placeholder*" -o -name "*lorem*"` returns 0

- [ ] `global.real_logo_present`, Client logo is the real client SVG/PNG,
  not a generic
  Fix: Verify file in `clients/[Client Name]/Pipeline Data/assets/logo/`
  matches what's served

- [ ] `global.thank_you_page_exists`, `/thank-you` page renders
  Fix: Generate the ThankYou page

- [ ] `global.btn_glow_on_primary_ctas`, All primary buttons render with
  btn-glow shadow
  Fix: Canonical button component applies btn-glow by default

- [ ] `global.zero_radius`, All structural elements have border-radius 0
  Fix: Audit; only exception is `.pulse-dot` (status indicator)

- [ ] `global.sharp_corners_inputs`, All form inputs have border-radius 0
  Fix: `form-input` class enforces this

- [ ] `global.font_loaded`, Heading and body fonts load via Google Fonts
  per `{{brand-dna.typography.heading_url}}` and `body_url`
  Fix: Verify `index.html` has correct Google Fonts URL

- [ ] `global.section_polygons_every_section`, Every section has
  SectionPolygons (or HeroPolygons for Hero)
  Fix: Audit each section file; add if missing

- [ ] `global.section_alternation`, Sections alternate primary/secondary
  backgrounds only
  Fix: Audit; no third color permitted

- [ ] `global.lighthouse_mobile_score`, Lighthouse mobile score >= 80
  (informational)
  Fix: Optimize images, lazy-load, reduce bundle
