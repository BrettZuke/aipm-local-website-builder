#!/usr/bin/env python3
"""Set your agency signature, once.

Run this any time (the /set-signature command runs it for you):

    python3 website-factory/tools/set-signature.py

It opens a drawing page in your browser. You draw your signature and click Save.
This writes it to clients/_agency/assets/founder-signature.png, and every proposal
you build from then on stamps it on the executed contract automatically. There is
nothing to move: draw, click Save, done. Close the tab when it says Saved.
"""
import argparse
import base64
import http.server
import json
import socketserver
import threading
import time
import webbrowser
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
HTML = TOOL_DIR / "sign-setup.html"
ASSETS = TOOL_DIR.parent / "clients" / "_agency" / "assets"
OUT = ASSETS / "founder-signature.png"

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
MAX_BYTES = 400 * 1024
saved = threading.Event()


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *args):  # keep the terminal quiet
        pass

    def do_GET(self):
        if self.path.split("?")[0] in ("/", "/index.html", "/sign-setup.html"):
            body = HTML.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != "/save":
            self.send_response(404)
            self.end_headers()
            return
        try:
            n = int(self.headers.get("Content-Length", 0) or 0)
            data = json.loads(self.rfile.read(n) or b"{}")
            raw_url = str(data.get("png", ""))
            b64 = raw_url.split(",", 1)[1] if "," in raw_url else raw_url
            raw = base64.b64decode(b64)
            if not raw.startswith(PNG_MAGIC):
                raise ValueError("that was not a PNG image")
            if len(raw) > MAX_BYTES:
                raise ValueError("signature image is too large")
            ASSETS.mkdir(parents=True, exist_ok=True)
            OUT.write_bytes(raw)
            self._json(200, {"ok": True})
            saved.set()
        except Exception as e:  # report a clean error back to the page
            self._json(400, {"ok": False, "error": str(e)})

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> int:
    ap = argparse.ArgumentParser(description="Draw and save your agency signature once.")
    ap.add_argument("--port", type=int, default=0, help="Port to serve on (0 = pick a free one).")
    ap.add_argument("--timeout", type=int, default=600, help="Seconds to wait for you to save.")
    ap.add_argument("--no-open", action="store_true", help="Do not auto-open the browser.")
    args = ap.parse_args()

    if not HTML.exists():
        print(f"ERROR: sign-setup.html not found next to this script ({HTML}).")
        return 1

    httpd = socketserver.TCPServer(("127.0.0.1", args.port), Handler)
    httpd.allow_reuse_address = True
    port = httpd.server_address[1]
    url = f"http://127.0.0.1:{port}/"
    threading.Thread(target=httpd.serve_forever, daemon=True).start()

    print(f"Opening the signature page in your browser: {url}")
    print("Draw your signature, click Save, then come back here. (Ctrl+C to cancel.)")
    if not args.no_open:
        try:
            webbrowser.open(url)
        except Exception:
            print("Could not auto-open your browser. Open this link yourself:", url)

    rc = 1
    try:
        if saved.wait(timeout=args.timeout):
            time.sleep(0.4)  # let the page receive its "Saved" response first
            print(f"\nSaved your signature -> {OUT}")
            print("Done. It is now stamped on every proposal you build. You can close the tab.")
            rc = 0
        else:
            print("\nTimed out waiting for a signature. Run it again whenever you are ready.")
    except KeyboardInterrupt:
        print("\nCancelled. No signature was saved.")
    finally:
        httpd.shutdown()
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
