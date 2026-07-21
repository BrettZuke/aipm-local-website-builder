# AI Chatbot Setup (you do ONE thing, once, ever)

Every website you build comes with an AI chat agent (the bubble in the bottom
right corner). It answers visitor questions about your client's business,
services, area, and hours, and pushes people toward the quote form or a phone
call. The business facts are filled in automatically when the site is built,
so you never write anything for it.

## The one thing you do: get a free key (60 seconds, one time)

The chat agent runs on a free AI service called Groq. You need one key. You
get it once and it powers EVERY website you ever build.

1. Open https://console.groq.com/keys
2. Sign in with your Google account (free, no card needed)
3. Click "Create API Key", give it any name, copy the key it shows you
4. When Claude asks for it during your first website deploy, paste it into
   the chat

That is it. Claude saves the key privately on your computer and wires it into
every client site automatically from then on. You never do this again.

## What if I skip it?

Nothing looks broken. The chat bubble still works, it just offers "Call now"
and "Get a fast quote" buttons instead of typed answers. Add the key any time
and ask Claude to redeploy the site; the chat switches on.

## How do I know it is working?

After every deploy, Claude asks the live chatbot a test question ("What
services do you offer?") and shows you the answer. You can also open the live
site yourself, click the bubble, and ask it anything about the business.

---

Everything below is technical reference. You do not need it; Claude handles it.

## Manual setup (reference)

Other providers work too: set exactly ONE of `GROQ_API_KEY` (free,
console.groq.com/keys), `GEMINI_API_KEY` (free tier, aistudio.google.com/apikey),
or `OPENAI_API_KEY` (paid, platform.openai.com/api-keys).

From the client's website folder:

```bash
vercel env add GROQ_API_KEY production
vercel --prod
```

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

