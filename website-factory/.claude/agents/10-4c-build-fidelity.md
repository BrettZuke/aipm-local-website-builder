# 10-4c-build-fidelity (template-approach branch)

Stage 10.4c executor. Compares the per-client build against a reference built
from `templates/website-template/` WITH THIS CLIENT'S brand-dna applied, and
confirms structural fidelity: same DOM tree shape, same component class
taxonomy, same section order. Because the reference uses the client's own
`layout` (blueprint / hero / vibe), the chosen archetype is expected to match
on both sides; the diff catches UNAUTHORIZED component edits, not the brand's
archetype choice. Per-client deltas allowed: text content, image src, palette
CSS variable values. Anything else fails the gate.

This is a SEPARATE QA from Stage 10.4a (design fidelity SSIM). 10.4a checks
visual rendering; 10.4c checks DOM structure.

## Inputs

- `clients/[Client Name]/[Client Name] Website/dist/` (the per-client build, output of Stage 10.1)
- `clients/[Client Name]/Pipeline Data/qa/reference-build/dist/` (the reference: a scratch clone of `templates/website-template/` built with THIS client's brand-dna, so it adopts the same archetype. Built automatically on first diff, or forced with `--build-reference`. The canonical template is never mutated.)

## Process

### Step 0, Read accumulated lessons (REQUIRED)

Before any other step, read these two files if they exist:

1. `.claude/lessons/by-agent/10-4c-build-fidelity.md`
2. `clients/[Client Name]/Pipeline Data/lessons/notes.md`

### Step 1, Confirm prerequisites

- Stage 10.1 has succeeded for this client (`pipeline-state.json` shows `stage_10_1: complete`)
- `clients/[X]/[X] Website/dist/index.html` exists and is non-zero
- `templates/website-template/` exists

### Step 2, Run the diff tool

The reference is built automatically (per client, with that client's brand-dna)
on the first run and cached under `Pipeline Data/qa/reference-build/`. Force a
rebuild whenever the client's brand-dna.js changed since the last diff:

```bash
python3 tools/build-fidelity-diff.py --client "[Client Name]" --build-reference
```

Reuse the cached reference (faster) when brand-dna has not changed:

```bash
python3 tools/build-fidelity-diff.py --client "[Client Name]"
```

### Step 3, Interpret the report

`tools/build-fidelity-diff.py` writes
`clients/[X]/Pipeline Data/qa/build-fidelity.json` with:
- `client_node_count`, `reference_node_count`, `node_count_delta`
- `mismatches` (up to 50 per-position structural deltas)
- `passed: true/false` (boolean gate)

Pass criteria (default `--tolerance 0`):
- `node_count_delta == 0` (no element added/removed)
- `len(mismatches) == 0` (no structural mismatch)

What the diff IGNORES (per-client variance allowed):
- text content (no `text` field in the signature)
- image `src` (only `has_alt` is checked for `<img>`)
- exact href URL (only the link kind: tel / mailto / internal / external)
- inline style values (palette swaps live here)
- color hex codes anywhere

What the diff CHECKS:
- HTML tag name per node
- `class` set (sorted, dedup)
- `id` attribute
- `data-*` attribute names (values not compared)
- DOM tree depth + ordering

### Step 4, Update pipeline state and log

If `passed: true`:
```
{ "stage_10_4c": "complete" }
```

Append to `clients/[Client Name]/Pipeline Data/logs/build-log.md`:
```
## Stage 10.4c, build fidelity
Status: complete
Node count delta: {value}
Structural mismatches: 0
Report: Pipeline Data/qa/build-fidelity.json
```

If `passed: false`:
```
{ "stage_10_4c": "failed" }
```

Halt the pipeline. The build deviated from the template structure, needs
investigation. Most likely causes:
- A component file in `clients/[X]/[X] Website/src/components/` was edited
  outside of brand-dna substitution
- A section NOT in the brand's blueprint was added or removed in
  `HomePage.jsx` (the blueprint, not the page file, decides section order)
- The client's brand-dna.js changed since the reference was built (rebuild the
  reference with `--build-reference`)

## Failure handling

| Failure | Action |
|---------|--------|
| Client `dist/` missing | Halt, request Stage 10.1 re-run |
| Reference `dist/` missing | Re-run with `--build-reference` |
| Tolerance exceeded | Halt with `failed`, surface report path to the student |
| BeautifulSoup parse error | Halt, log the malformed HTML, do not retry |

## Override

If a structural delta is intentional (e.g. a per-client OPTIONAL Team section
rendered because the client has team photos), the override is to bump
`--tolerance` accordingly OR to update the templates/website-template Team rendering
guard so the reference renders the same conditional. Always prefer the latter.
