# Signed-contract email (`/api/send-contract`)

Your proposal has a built-in agreement step. When you and the client both sign
on the page and hit **Email the signed agreement**, this serverless function
builds a PDF of the contract (with both signatures embedded) and emails the
executed copy to **you** and to **your client**.

It only works once **you connect your own email**. Nothing is hardcoded, so
until you set the values below, the send button will return a clear
"email is not configured" message.

## What you need

1. A free **Resend** account: https://resend.com
2. A **verified sending domain** in Resend (Resend walks you through adding a
   few DNS records to a domain you own). This is what lets email send *from*
   your address. You do not need a separate inbox, only domain verification.
3. Your proposal deployed on **Vercel** (the same place the site deploys).

## Connect it (3 environment variables on your Vercel project)

In your Vercel project, go to **Settings, Environment Variables**, and add:

| Variable | What it is | Example |
|---|---|---|
| `RESEND_API_KEY` | Your API key from the Resend dashboard | `re_xxx...` |
| `RESEND_FROM` | Your verified sender, `Name <you@yourdomain.com>` | `Your Agency <hello@youragency.com>` |
| `AGENCY_EMAIL` | Where the signed copy is emailed to you | `you@youragency.com` |

Then set **`contract_email`** in your `clients/_agency/agency-brand.json` to the
same address as `RESEND_FROM` (just the email part). That address is shown to
the client on the signing screen ("emailed from ...").

Redeploy after adding the variables. Send a test from the live page and confirm
the PDF lands in your inbox.

## The contract wording

The agreement text lives in `AGREEMENT_SECTIONS` near the top of
`send-contract.js`. It ships as a plain, non-refundable service agreement with a
delivery guarantee (governed by England and Wales law). **Replace it with your
own contract template**, reviewed by your own solicitor, before using it for
real deals. The payment clause is left blank by design: whatever you type in the
**Contract payment terms** box in the proposal's seller panel becomes the
payment section, so you can adjust price and retainer per deal on the call.

Do not commit real API keys. They belong only in Vercel's environment settings.
