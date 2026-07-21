# AI Chatbot Setup (2 minutes per client site)

Every website you build ships with an AI chat widget (bottom-right bubble). It
answers visitor questions about THIS client's business, services, area, and
hours, and pushes people to the quote form or a phone call. The business facts
are baked in automatically at build time (`api/_business.json`), so there is
nothing to write per client.

The widget needs one thing to come alive: an AI API key on the site's Vercel
project. Until you add one, the bubble still works but offers "Call now" and
"Get a fast quote" instead of chat, so nothing ever looks broken.

## Step 1: get a free API key (once, reuse it for every client site)

Pick ONE provider:

- **Groq (recommended, free, no card):** sign up at https://console.groq.com/keys
  and create an API key.
- **Google Gemini (free tier):** https://aistudio.google.com/apikey
- **OpenAI (paid):** https://platform.openai.com/api-keys

You can use the same key across all your client sites.

## Step 2: add the key to the client site's Vercel project

From the client's website folder (the one you deploy from):

```bash
vercel env add GROQ_API_KEY production
```

Paste the key when prompted. Use `GEMINI_API_KEY` or `OPENAI_API_KEY` instead
if you chose those providers. Set exactly ONE of the three.

## Step 3: redeploy

```bash
vercel --prod
```

Open the live site, click the chat bubble, ask "what services do you offer?"
and confirm it answers with this client's actual services.

## Notes

- The key lives only on the server (`api/chat.mjs`); it is never sent to the
  browser and never committed to the repo.
- Built-in protections: replies capped short, 20 messages per minute per
  visitor, off-topic questions steered back to the business.
- Optional: set `CHAT_MODEL` env var to override the default model.
- Turn the widget off for one client with `chatbot: { enabled: false }` in
  that site's `src/config/brand-dna.js`.
- Groq's free tier has daily limits. Plenty for a local business site; if a
  site outgrows it, that is a great problem, upgrade or switch provider.

## Feeding it your client's knowledge

The factory writes `api/_business.json` at every build. Besides the basics
(services, areas, phone, hours) it now includes a `knowledge` block distilled
from the whole pipeline: the owner's story, per-service descriptions, FAQs,
current offers, credentials, and address. The assistant answers from this
first, so it is an expert on THAT business, not a generic bot.

To make it even smarter for one client, open `api/_business.json` and extend
the `knowledge` string with anything else the owner wants it to know
(financing policy, warranty terms, brand promises, seasonal notes), then
redeploy. Keep it under roughly 6,000 characters; the endpoint caps it there.

