#!/usr/bin/env python3
"""wire-proposal-email.py — push the contract-signing env vars to a proposal's
Vercel project so the "Send contract to sign" flow works on the live deployment.

Run this AFTER the proposal folder is linked to a Vercel project (i.e. after the
first `vercel link` / `vercel --prod`), then redeploy so the vars take effect.

Reads RESEND_API_KEY, RESEND_FROM, AGENCY_EMAIL, SIGNING_SECRET from the builder
root `.env.local` (falls back to the process environment). If SIGNING_SECRET is
missing it generates one and writes it back to `.env.local`.

Usage:
    python3 tools/wire-proposal-email.py "clients/<Client>/<Client> Proposal"

Secrets are passed to the Vercel CLI via stdin, never as command-line arguments,
and are never printed. Nothing is committed.
"""
import os
import sys
import secrets
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent          # website-factory/
BUILDER_ROOT = REPO_ROOT.parent                              # aipm-local-website-builder/
ENV_LOCAL = BUILDER_ROOT / ".env.local"

REQUIRED = ["RESEND_API_KEY", "RESEND_FROM", "AGENCY_EMAIL", "SIGNING_SECRET"]


def parse_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        # strip inline comments and surrounding quotes
        val = val.split("  #", 1)[0].strip().strip('"').strip("'")
        if key:
            out[key] = val
    return out


def load_values() -> dict[str, str]:
    values = parse_env_file(ENV_LOCAL)
    # process env wins over the file if set
    for k in REQUIRED:
        if os.getenv(k):
            values[k] = os.getenv(k)
    # auto-generate the signing secret if absent, persist it
    if not values.get("SIGNING_SECRET"):
        gen = secrets.token_hex(32)
        values["SIGNING_SECRET"] = gen
        _append_env_local("SIGNING_SECRET", gen)
        print("  generated a new SIGNING_SECRET and saved it to .env.local")
    return values


def _append_env_local(key: str, val: str) -> None:
    ENV_LOCAL.parent.mkdir(parents=True, exist_ok=True)
    prefix = "" if (not ENV_LOCAL.exists() or ENV_LOCAL.read_text().endswith("\n")) else "\n"
    with ENV_LOCAL.open("a") as f:
        f.write(f"{prefix}{key}={val}\n")


def set_vercel_env(proposal_dir: Path, name: str, value: str) -> None:
    """Set one env var on the linked Vercel project's production env. Remove any
    existing value first (add fails if it already exists)."""
    subprocess.run(
        ["vercel", "env", "rm", name, "production", "--yes"],
        cwd=proposal_dir, capture_output=True, text=True,
    )  # ignore result: fine if it did not exist yet
    add = subprocess.run(
        ["vercel", "env", "add", name, "production"],
        cwd=proposal_dir, input=value, capture_output=True, text=True,
    )
    if add.returncode != 0:
        raise RuntimeError(f"vercel env add {name} failed: {add.stderr.strip()[:300]}")


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: python3 tools/wire-proposal-email.py \"clients/<Client>/<Client> Proposal\"", file=sys.stderr)
        return 2
    proposal_dir = Path(sys.argv[1])
    if not proposal_dir.is_absolute():
        proposal_dir = (REPO_ROOT / proposal_dir).resolve()
    if not (proposal_dir / ".vercel" / "project.json").exists():
        print(
            f"ERROR: {proposal_dir} is not linked to a Vercel project yet.\n"
            "Deploy the proposal once first (vercel link / vercel --prod), then re-run this.",
            file=sys.stderr,
        )
        return 1

    values = load_values()
    missing = [k for k in REQUIRED if not values.get(k)]
    if missing:
        print(
            f"ERROR: missing {', '.join(missing)} in {ENV_LOCAL} (or the environment).\n"
            "Run /setup-agency Section 14 (Resend) first. See templates/proposal/RESEND-SETUP.md.",
            file=sys.stderr,
        )
        return 1

    print(f"Wiring contract-email env vars onto the Vercel project for:\n  {proposal_dir}")
    for name in REQUIRED:
        set_vercel_env(proposal_dir, name, values[name])
        print(f"  set {name}")
    print(
        "\nDone. Redeploy for the vars to take effect:\n"
        f"  cd \"{proposal_dir}\" && vercel --prod\n"
        "Then send yourself a test from the live page to confirm the email + PDF land."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
