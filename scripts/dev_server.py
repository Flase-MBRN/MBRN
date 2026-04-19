#!/usr/bin/env python3
"""
Local development server for MBRN-HUB-V1.

- Serves from repository root
- Sends UTF-8 charset for text assets
- Disables caching to avoid stale JS/CSS during rapid UI iteration
"""

from __future__ import annotations

import argparse
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent


class NoCacheUTF8Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".md": "text/markdown; charset=utf-8",
    }

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        # Keep logs concise and readable in local terminal.
        print(f"[dev-server] {self.address_string()} - {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run local dev server for MBRN.")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=int(os.getenv("PORT", "8080")), help="Port (default: 8080)")
    args = parser.parse_args()

    os.chdir(REPO_ROOT)
    server = ThreadingHTTPServer((args.host, args.port), NoCacheUTF8Handler)
    print(f"[dev-server] Serving {REPO_ROOT} on http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[dev-server] Stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

