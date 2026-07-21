---
name: vercel-deploy
description: "Use during Stage 11 of the website factory pipeline to deploy the built client website to Vercel production via the Vercel CLI. Verifies the local build passes, runs `vercel --prod --yes` from the client website folder, captures the production URL, smoke-checks it returns 200, and writes vercel-url.txt + deploy-log.json. Halts before deploy if QA gates 10.4a or 10.4b are not complete (or explicitly overridden). Disabled from auto-invocation: deploy is always user-driven via /stage11 or /build-all."
allowed-tools:
  - Bash
  - Read
  - Write
disable-model-invocation: true
---

# Vercel Deploy Skill

Deploy the built client website from `clients/[Client Name]/[Client Name] Website/`
to a Vercel project using the Vercel CLI.

## Pre-requisites

- Vercel CLI installed globally: `npm i -g vercel`
- User is logged in: `vercel login` (one-time setup, persists)
- The Vite build completes without errors: `npm run build`

## Execution steps

### Step 1, Navigate to the build folder

```bash
cd "clients/[Client Name]/[Client Name] Website"
```

### Step 2, Run the production build

```bash
npm run build
```

Confirm `dist/` folder exists and is non-empty. If the build fails, halt and report the error.

### Step 3, Link the project (first-time only)

If no `.vercel/` folder exists in the build directory, link it:

```bash
vercel link
```

Follow the prompts:
- Set up and deploy: Yes
- Which scope: pick the correct Vercel org/account
- Link to existing project? No (first time)
- Project name: `[client-slug]-website`
- Directory: `.` (current folder)
- Override settings: No

This creates `.vercel/project.json`. On subsequent deploys, this file handles the link
automatically.

### Step 4, Wire the AI chatbot key (agent handles this, student pastes a key once ever)

Every build ships the AI chat widget; it answers only when an AI key exists on
the project. The student's key lives in `website-factory/.env` (gitignored) as
`GROQ_API_KEY=...` and is reused for every client site. Run this flow in order:

1. Check whether the project already has a key:

```bash
vercel env ls 2>/dev/null | grep -E "GROQ_API_KEY|GEMINI_API_KEY|OPENAI_API_KEY"
```

If a key is listed, skip to Step 5.

2. No key on the project: look for the student's saved key in
`website-factory/.env` (line starting `GROQ_API_KEY=`). If found, add it to the
project without prompting the student:

```bash
KEY=$(grep -m1 "^GROQ_API_KEY=" ../../../.env | cut -d= -f2-)
printf '%s' "$KEY" | vercel env add GROQ_API_KEY production
```

(Adjust the `.env` path to wherever `website-factory/.env` sits relative to the
client website folder. Never echo or print the key itself.)

3. No saved key either: STOP and tell the student, in plain words, exactly this:

> Your website comes with an AI chat agent that answers visitor questions. It
> needs a free key to switch on. This takes 60 seconds and you only ever do it
> once:
> 1. Open https://console.groq.com/keys
> 2. Sign in with your Google account (free, no card needed)
> 3. Click "Create API Key", give it any name, and copy the key it shows you
> 4. Paste the key here in the chat
>
> I will save it and reuse it for every website you build from now on.

When the student pastes the key: save it as a `GROQ_API_KEY=...` line in
`website-factory/.env` (create the file if missing; it is gitignored), then add
it to the Vercel project with the piped command above.

If the student cannot get a key right now, continue anyway: the widget degrades
to Call + Get-a-quote buttons, nothing looks broken. Remind them at handoff.

### Step 5, Deploy to production

```bash
vercel --prod
```

Capture the production URL from the output (format: `https://[client-slug]-website.vercel.app`
or the custom domain if already configured).

### Step 6, Verify deployment

```bash
curl -s -o /dev/null -w "%{http_code}" https://[deployed-url]
```

Expect 200. If not 200, check Vercel dashboard for build/deployment errors.

Then prove the chatbot answers (only if a key was wired in Step 4):

```bash
curl -s -X POST https://[deployed-url]/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What services do you offer?"}]}'
```

Expect a short answer naming THIS client's actual services. If the response is
`{"error":"chat_not_configured"}`, the key is missing on the project: redo
Step 4 and redeploy. Report the chatbot's test answer to the student so they
see it working.

### Step 7, Save the URL

Write the production URL to:
```
clients/[Client Name]/Pipeline Data/deploy/vercel-url.txt
```

This file is read by the proposal agent at Stage 13 for the iframe preview.

### Step 8, Optional: custom domain setup

Custom domain configuration is done in the Vercel dashboard, not via CLI. After deploy:
1. Vercel dashboard > Project > Settings > Domains
2. Add `[client-domain].com` and `www.[client-domain].com`
3. Update DNS at client's registrar:
   - A record: `76.76.21.21` (Vercel IP)
   - CNAME www: `cname.vercel-dns.com`
4. Vercel auto-provisions SSL once DNS propagates (usually under 5 minutes)

## Update an existing deployment

Re-run `npm run build && vercel --prod` from the build folder. The existing
`.vercel/project.json` link handles everything else automatically.

## What to do if vercel link fails

1. Delete `.vercel/` folder and retry
2. Check `vercel whoami` to confirm you're logged in as the right account
3. If project already exists on Vercel, use "Link to existing project: Yes" and enter the
   project name

## Failure handling

| Failure | Action |
|---------|--------|
| Build fails (`npm run build` errors) | Fix the TypeScript/lint error and retry. Do not deploy a broken build. |
| vercel not found | Run `npm i -g vercel` and retry |
| 401 Unauthorized | Run `vercel login` and retry |
| Deployment times out | Check Vercel dashboard for build logs. Usually a dependency install issue. |
| Custom domain not resolving | DNS propagation can take up to 48 hours. Confirm A record is correct. |
