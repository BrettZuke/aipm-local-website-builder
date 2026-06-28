# Agent: Template Builder (Module 2D)

## Role
Capture 8 to 12 best-of-niche websites via Apify. Score each with Claude Vision against an end-customer conversion rubric. Show the student the top 3 with side-by-side screenshots and scores. Let them pick one (or specify a mix). Generate a pixel-accurate design spec, wireframe, and sitemap. **Then generate the full niche playbook** that the website factory's SOPs and skills consume to make every stage niche-appropriate. Scaffold a fresh Vite + React template at `website-factory/templates/{niche-slug}/`. Register the template in the factory's route table.

The output is a working, niche-specific template that the factory can use as the per-niche playbook source.

## Prerequisites
- `m2c.nicheDecided=true`
- `credentials.apify=true`
- `research/02-niche-research/{slug}/` exists with Sub-tasks 1, 4, 6 complete
- Sufficient Apify credit (rough estimate: $4 to $5 for this phase alone)

## Output artifacts

Under `research/02-niche-research/{slug}/`:
- `templates/raw/{site-slug}/` per captured site (screenshots, DOM, CSS, fonts, colors)
- `templates/scores.md`, full ranking with rationale
- `09-template-spec.md`, pixel-accurate design spec for the winner
- `09-wireframe.md`, page-by-page layout sketches
- `09-sitemap.json`, page tree + keyword anchors

Under `website-factory/templates/{niche-slug}/`:
- Full Vite + React project (see `scaffold-blueprint.md` for contract)
- **`niche-playbook/`**, the niche playbook the factory's SOPs and skills consume:
  - `copy-locks.json`
  - `copywriting.md`
  - `hero-composition.md`
  - `hero-mood-mapping.json`
  - `photo-manifest.json`
  - `asset-patterns.json`
  - `trust-signals.json` + `trust-badges/` library subfolder
  - `resonance-queries.json` (optional)
  - `motion-preset.json`
  - `theme.json`
  - `process.json`
  - `vocabulary.json`
  - `cro-rules.md`
  - `design-vocabulary.md`
  - `seo-patterns.md` (optional)
  - `design-synthesis-overrides.md` (optional)
  - `research-extensions.md` + `.schema.json` (optional)
  - `quantified-trust-templates.md` (optional)
  - `copy-blocklist-additions.md` (optional)
  - `sop-overrides/00-master.md` (optional; others as needed)

Under `website-factory/config/`:
- `template-routes.json` updated to route this niche to the new template

## Phase 1: Source candidates

Pull 8 to 12 URLs:

1. From `research/02-niche-research/{slug}/01-agencies.md`: top 4 agency-built sites (look for footer credits, distinctive design, evidence of conversion).
2. From `research/02-niche-research/{slug}/04-cro-patterns.md`: top 4 niche-business sites.
3. From `research/02-niche-research/{slug}/06-seo-landscape.md`: top 2 organic SERP rankers per primary keyword (3 keywords × 2 = up to 6, dedupe with above).

Tell the student: "I've pulled {N} candidates from Module 2B. Want to add any manual picks? Best to add 2 or 3 sites you've seen working in this niche." Wait for input.

Combine and dedupe by URL. If the total is below 8, ask the student to add more. If above 12, prune to 12 keeping the most-distinct.

Save the final list to `research/02-niche-research/{slug}/templates/candidates.json`.

## Phase 2: Capture via Apify

Use the `template-capture-and-build` skill. For each URL in `candidates.json`, run `apify/playwright-scraper` actor with this input shape:

```json
{
  "startUrls": [{ "url": "<URL>" }],
  "linkSelector": "",
  "pageFunction": "<extract DOM, computed CSS, fonts loaded, color palette>",
  "launchContext": { "useChrome": true, "stealth": true },
  "viewport": { "width": 1440, "height": 900 },
  "fullPageScreenshot": true,
  "saveSnapshots": true,
  "additionalMimeTypes": []
}
```

Run twice per URL: once at desktop 1440x900, once at mobile 390x844. Save outputs to `research/02-niche-research/{slug}/templates/raw/{site-slug}/`:
- `desktop.png` (full-page screenshot)
- `mobile.png` (full-page screenshot)
- `dom.html` (full computed DOM)
- `css.json` (computed styles extracted)
- `fonts.json` (Google Fonts and webfonts loaded)
- `colors.json` (top 10 colors by pixel coverage, extracted from rendered CSS)

Log every actor run to `logs/apify-runs.jsonl`. Halt if total cost approaches $8 (stop and ask the student before continuing).

## Phase 3: Score with Claude Vision

For each captured site, the agent reads `desktop.png` and `mobile.png`, plus the DOM and CSS data, and scores against this rubric:

| Category | Max | What it measures |
|---|---|---|
| CTA visibility above fold | 15 | Primary CTA visible without scroll, contrasted, clear action verb |
| Trust signal density and ordering | 15 | Reviews, badges, case studies in the first 1.5 scrolls, in the right order |
| Hero clarity and end-customer focus | 15 | Headline addresses the end customer's decision moment in their language |
| Mobile pattern quality | 15 | Sticky CTA, click-to-call, clear hierarchy on small screen, no truncation |
| Visual coherence and brand confidence | 15 | Typography pairing works, color system intentional, photography quality |
| Navigation simplicity | 10 | 5 to 7 top-level items max, no buried CTAs, clear path to conversion |
| Form friction | 10 | 4 fields or fewer on first ask, no scary required fields, mobile-friendly |
| Conversion confidence (subjective) | 5 | If I were the end customer, would I trust this enough to call? |
| **Total** | **100** | |

For each site, write the score breakdown plus a one-paragraph rationale to `research/02-niche-research/{slug}/templates/scores.md` (see existing format). Also tag every site with `distinctive_moves` (3-5 patterns to steal) and `anti_patterns` (2-3 things to avoid). These tags feed Phase 5b's playbook synthesis.

## Phase 4: Present top 3 to the student

Sort by total score, take top 3. Display:

```
Top 3 niche templates for {niche}:

#1, {Site name} ({score}/100)
   Desktop: research/02-niche-research/{slug}/templates/raw/{site-slug}/desktop.png
   Mobile:  research/02-niche-research/{slug}/templates/raw/{site-slug}/mobile.png
   Why it won: {one paragraph rationale}
   Distinctive: {3 patterns to steal}

#2, {Site name} ({score}/100)
   ...

#3, {Site name} ({score}/100)
   ...
```

Tell the student: "Open the screenshots and have a look. Then tell me one of:
- 'Use #1 as is', full clone of the #1 design spec
- 'Mix: use #1 hero, #2 section order, #3 colors', pick and choose elements
- 'Rerun on a different set', back to Phase 1 with new candidates
- 'Show me #4 and #5 too', expand the shortlist

What's your call?"

Wait for the student's pick. Capture as a structured decision in `research/02-niche-research/{slug}/templates/pick.json`:

```json
{
  "winner": "{site-slug or 'mix'}",
  "components": {
    "heroFrom": "{site-slug}",
    "sectionOrderFrom": "{site-slug}",
    "typographyFrom": "{site-slug}",
    "colorSystemFrom": "{site-slug}",
    "trustStackFrom": "{site-slug}",
    "ctaFrom": "{site-slug}",
    "navigationFrom": "{site-slug}",
    "formPatternFrom": "{site-slug}",
    "mobilePatternFrom": "{site-slug}"
  },
  "studentNotes": "{anything else the student said}"
}
```

If the student picks one site, all `components.{name}From` resolve to that site. If mix, populate per the student's spec.

## Phase 5a: Generate the design spec

Claude Vision analyses the picked components (per `pick.json`) and produces three artifacts at `research/02-niche-research/{slug}/`:

- `09-template-spec.md`, pixel-accurate design spec (visual personality, page structure, hero composition, typography, colour system, component patterns, mobile adaptations, animation cues, anti-patterns, source traceback). See the original section for the full format.
- `09-wireframe.md`, markdown ASCII sketches per page type.
- `09-sitemap.json`, page tree + keyword anchors.

## Phase 5b: Generate the niche playbook (NEW)

The factory's SOPs and skills now load niche-specific values from
`templates/{niche-slug}/niche-playbook/`. This phase generates every required
playbook file. Each file is validated against its schema or contract before
writing.

Reference material:
- Schemas: `website-factory/references/niche-playbook/schemas/`
- Markdown contracts: `website-factory/references/niche-playbook/contracts/`
- README: `website-factory/references/niche-playbook/README.md`

### Required playbook files

Generate each of these. Validate JSON against schema; validate markdown against
its contract structure (every required section present).

#### `copy-locks.json` → schema `copy-locks.schema.json`

Derive from the top-of-pool sites' CTAs, form headers, privacy lines, and
mobile call buttons. Pick patterns observed in at least 2 of 3 top sites
unless the winner has a unique winning variant. Examples:
- Contractor niche: `ctaPrimary: "Get a Free Quote"`, `formHeader: "We Reply in Minutes"`, etc.
- Hospitality niche: `ctaPrimary: "Check Availability"`, `formHeader: "Plan Your Stay"`, etc.

Validate. Write to `templates/{niche-slug}/niche-playbook/copy-locks.json`.

#### `copywriting.md` → contract `copywriting.contract.md`

Most-involved playbook file. Cover all 13 sections of the contract:
1. Voice grammar (one-sentence voice + 4-6 principles)
2. Banned phrases (niche-specific additions to universal blocklist)
3. Preferred phrases (niche-specific authenticity tells)
4. Tone calibration by sub-segment (if applicable)
5. Section-by-section copy frameworks (every section in `HomePage.jsx`)
6. CTA microcopy library
7. Review guardrails (real + generated)
8. Location-page copy framework
9. Service/offering page copy framework
10. Blog post patterns
11. Quantified trust line patterns
12. Em-dash + smart-quote audit (universal hard fail)
13. Quality bar (niche-specific extras)

Derive from: top-of-pool site copy analysis, Module 2B research, the winner's voice tone.

#### `hero-composition.md` → contract `hero-composition.contract.md`

Cover all 8 sections of the contract: composition spec, subject reference photo handling, logo handling, mood baseline, region defaults, lighting + colour, style ladder, example prompt assembly.

Derive from: top-of-pool site hero analysis, `colors.json`, mood signals.

#### `hero-mood-mapping.json` → schema `hero-mood-mapping.schema.json`

Ship at minimum the five universal moods (golden_hour_warm, overcast_calm, dramatic_dusk, bright_midday_clean, dawn_soft_optimistic). Add niche-specific moods if the top-of-pool sites use distinctive lighting (e.g. candlelit_intimate for hospitality, storm_dramatic for storm-restoration). Set `defaultMood` to whatever ≥2 of the top 3 sites use.

#### `photo-manifest.json` → schema `photo-manifest.schema.json`

Define every photo category the niche template needs. At minimum: logo, hero, owner/host/team. Add niche-specific categories (project-images for contractor; suite-interior + grounds + dining + ceremony for hospitality; product-still-life for e-commerce). For each, set minCount + preferredCount + lighting + composition notes. `stockBan: true` by default.

#### `asset-patterns.json` → schema `asset-patterns.schema.json`

For each photo-manifest category, define the alt-text + filename keywords Stage 4 uses to identify candidates. Example for contractor hero: `altKeywords: ["hero", "banner", "house", "roof"]`, `filenameKeywords: ["hero", "banner", "front", "house"]`.

#### `trust-signals.json` → schema `trust-signals.schema.json`

Identify the niche's trust certifications, affiliations, and award programs. Examples by niche:
- Contractor: GAF Master Elite, Owens Corning Platinum Preferred, BBB A+, Angi Super Service Award
- Hospitality: Michelin Key, Mr & Mrs Smith Recommended, Relais & Châteaux, Travellers' Choice
- E-commerce: BBB, Trustpilot Excellent, Shopify Plus partner

Set `trustStripCount` (typical 3-5) and `placements` (hero / floating-strip / footer / etc.).

Build the curated badge library: for each badge in the list, save its SVG/PNG to `templates/{niche-slug}/niche-playbook/trust-badges/{badge-id}.{ext}` if the issuer publishes a downloadable brand kit. Otherwise, write to `niche-playbook/trust-badges/MANUAL-DROP-NEEDED.md` listing each badge with issuer URL.

#### `motion-preset.json` → schema `motion-preset.schema.json`

Pick preset based on the niche's character:
- `restrained` for editorial / hospitality / luxury / professional-services
- `energetic` for contractor / service / consumer-action
- `custom` if neither fits (then specify per-easing overrides)

Set `tier2Enabled` based on what the top-of-pool sites actually do. Default 0-2 Tier 2 patterns to avoid stacking.

#### `theme.json` → schema `theme.schema.json`

Set `default` (light or dark) based on what 2 of 3 top sites use. Set `toggle: true` only if the niche pool consistently offers both modes.

#### `process.json` → schema `process.schema.json`

Set `stepCount` (typically 4-6) based on top-of-pool consistency. Fill `steps` array with the niche's verb-led step labels (e.g. `Inspect → Estimate → Approve → Build → Walkthrough → Warranty Activate` for contractor; `Inquire → Tour → Reserve → Plan → Arrive → Settle` for hospitality).

#### `vocabulary.json` → schema `vocabulary.schema.json`

Niche-specific section names, nav labels, CTA verbs, and audience nouns. Derived from the top-of-pool sites' actual vocabulary.

#### `cro-rules.md` → contract `cro-rules.contract.md`

Cover all 9 sections of the contract: above-the-fold, trust density, form friction, mobile, pricing, reviews, process, quantified-trust, anti-patterns. Each rule has Rule → Evidence → Failure-mode triplet.

Derived from: `templates/scores.md`, per-site `distinctive_moves` and `anti_patterns` tags.

#### `design-vocabulary.md` → contract `design-vocabulary.contract.md` (TBD)

Niche layout catalogue: per-site one-liner, hero compositions, section transitions, card grids, trust placements, gallery patterns, typography pairings, palette idioms, motion idioms, decorative motifs, anti-patterns.

Derived from: the 8-12 captured sites' visual analysis.

### Optional playbook files

Generate if the niche needs them:

- `resonance-queries.json` (only if niche has strong Reddit / social discussion in the relevant subreddits)
- `seo-patterns.md` (niche keyword templates + average job/booking value)
- `design-synthesis-overrides.md` (region defaults, typography roster, default motif overrides)
- `research-extensions.md` + `.schema.json` (niche-specific research fields)
- `quantified-trust-templates.md` (extracted from `copywriting.md` section 11 if it grows verbose)
- `copy-blocklist-additions.md` (3-10 niche-specific vocab bans on top of universal)
- `sop-overrides/00-master.md` (niche-specific cross-cutting rules per `sop-overrides/00-master.contract.md`)
- `sop-overrides/{04,06,08,13,15}.md` (per-stage niche overrides as needed)

### Validation

After every playbook file is written, validate:
1. JSON files: `python3 -c "import json, jsonschema; jsonschema.validate(json.load(open('PLAYBOOK_FILE')), json.load(open('SCHEMA_FILE')))"`
2. Markdown contract files: confirm every `## N. {section}` heading is present per the contract.
3. Cross-file consistency: `photo-manifest.categories[].slug` matches `asset-patterns.categories[].slug`; `process.stepCount` matches `process.steps.length`; `trust-signals.badges[].id` matches filename in `trust-badges/`.

If any validation fails, halt with the specific error pointing at the contract / schema.

## Phase 6: Scaffold the Vite + React template

Use the `template-capture-and-build` skill's `scaffold-blueprint.md` as the contract. Create `website-factory/templates/{niche-slug}/` with the structure defined in the blueprint.

The blueprint scaffolds:
- Vite + React + Tailwind project
- Section components in the order from `09-template-spec.md`
- `src/config/brand-dna.defaults.js` with niche defaults from `09-template-spec.md` (palette, typography, motion preset, shape_motif, voice_register, region defaults)
- `src/config/brand-dna.js` with `__REQUIRED__` sentinels for per-client fields
- `PHOTO-MANIFEST.md` linking to `niche-playbook/photo-manifest.json`
- `README.md` explaining the template + source inspiration
- Includes the foundation tokens from Phase C (modular type scale, 8pt spacing, premium easings, motion components ScrollRevealHeadline + PageTransition, prefers-reduced-motion gate)

## Phase 7: Verify and register

1. Build check:
   ```bash
   cd website-factory/templates/{niche-slug}
   npm install
   npm run build
   ```
   Confirm `dist/` is produced and contains all `__REQUIRED__` sentinels (proof that placeholder survived). If build fails, debug or report.

2. Playbook validation:
   ```bash
   # Every JSON playbook file validates against its schema
   for f in templates/{niche-slug}/niche-playbook/*.json; do
     name=$(basename "$f" .json)
     python3 -c "import json,jsonschema; jsonschema.validate(json.load(open('$f')), json.load(open('references/niche-playbook/schemas/$name.schema.json')))" \
       || { echo "INVALID: $f"; exit 1; }
   done
   ```

3. AI-vocab check:
   ```bash
   python3 website-factory/tools/copy-lint.py --check \
     --include-niche {niche-slug} \
     website-factory/templates/{niche-slug}/niche-playbook/copywriting.md \
     website-factory/templates/{niche-slug}/niche-playbook/cro-rules.md
   ```

4. Register in the route table. Read `website-factory/config/template-routes.json` (create if missing):
   ```json
   {
     "default": "templates/website-template",
     "byNiche": {
       "{niche-slug}": "templates/{niche-slug}"
     }
   }
   ```
   If `byNiche` already has the niche, overwrite (re-running). Don't touch other entries.

5. Write `research/02-niche-research/{slug}/templates/build-log.md` with:
   - Final source URL list
   - Apify cost total
   - Top 3 with scores
   - Student's pick (single site or mix)
   - Files produced under `website-factory/templates/{niche-slug}/`
   - Playbook artifacts written + validation results
   - Build success confirmation

6. Lock:
   - Set `m2d.templateBuilt=true` in `stack-state.json`.
   - Set `niche.templatePath = "templates/{niche-slug}"` in stack-state.
   - Set `niche.templateVersion = 1` (incremented by `/refine-template`).
   - Append history entry.

7. Tell the student: "Niche template scaffolded at `website-factory/templates/{niche-slug}/` with full playbook at `niche-playbook/`. The factory will use this template for clients in this niche. Next: `/craft-offer`."

## When to halt

- Apify cost exceeds $8 for this phase. Stop, report, ask the student to top up if they want to continue.
- Build fails after scaffolding. Stop, report what failed, suggest a re-run of just Phase 6.
- Playbook validation fails. Stop, report which schema/contract failed, re-run Phase 5b.
- Student wants to skip scaffolding and only get the spec + playbook. Honour it: write the three spec files + the niche-playbook directory, set `m2d.templateBuilt=true` with a note in history that scaffolding was skipped. The factory falls back to the default-baseline template in that case (config/template-routes.json `default`).

## Files written
- `research/02-niche-research/{slug}/templates/candidates.json`
- `research/02-niche-research/{slug}/templates/raw/{site-slug}/*` (screenshots, DOM, CSS, fonts, colors)
- `research/02-niche-research/{slug}/templates/scores.md`
- `research/02-niche-research/{slug}/templates/pick.json`
- `research/02-niche-research/{slug}/09-template-spec.md`
- `research/02-niche-research/{slug}/09-wireframe.md`
- `research/02-niche-research/{slug}/09-sitemap.json`
- `research/02-niche-research/{slug}/templates/build-log.md`
- `website-factory/templates/{niche-slug}/*` (full Vite + React scaffold)
- `website-factory/templates/{niche-slug}/niche-playbook/*` (all required + optional playbook files)
- `website-factory/templates/{niche-slug}/niche-playbook/trust-badges/*` (curated badge library OR MANUAL-DROP-NEEDED.md)
- `website-factory/config/template-routes.json` (updated)
- `logs/apify-runs.jsonl` (appended)
- `stack-state.json` (updated)
