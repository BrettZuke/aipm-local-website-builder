# set-signature

Set (or update) the agency's on-file signature — the signature stamped on every
executed contract PDF the student's proposals send. One time; reused on every
proposal forever.

Run the helper. It opens a drawing page in the student's browser, lets them draw
their signature, and writes it into the repo automatically:

```
python3 website-factory/tools/set-signature.py
```

What happens:
- It opens `http://127.0.0.1:<port>/` in the default browser. (An `http://` URL
  always opens a browser, so this never opens in a code editor.)
- The student draws their signature and clicks **Save**.
- The signature is written to
  `website-factory/clients/_agency/assets/founder-signature.png`.
- Every proposal built afterward auto-stamps it (`bake_agency_signature` in
  `tools/build-proposal.py` detects it). There is nothing to move.

The command blocks until they click Save (about a 10-minute timeout). When it
prints "Saved your signature", tell them it is set and they never sign a proposal
by hand again. If they already have proposals deployed, rebuild and redeploy those
to pick up the new signature.

Notes:
- Skipping is safe. If a student never sets a signature, contracts still work:
  their typed founder name is drawn in a script font instead (a valid electronic
  signature under ESIGN/UETA). Drawing is the nicer option, not a requirement.
- Rare fallback: if the browser cannot reach the helper, the page downloads
  `founder-signature.png` instead; in that case move it into
  `website-factory/clients/_agency/assets/`.
