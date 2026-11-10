#!/usr/bin/env python3
"""Refresh official-source availability and publish the dashboard data."""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCES_FILE = ROOT / "data" / "sources.json"
OUTPUT_FILE = ROOT / "data" / "grants.json"
USER_AGENT = "CommunityGrantWatch/1.0 (GitHub Actions scheduled source monitor)"


def check_source(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT}, method="GET")
    try:
        with urlopen(request, timeout=30) as response:
            response.read(1024)
            return f"Available (HTTP {response.status})"
    except HTTPError as error:
        return f"Needs review (HTTP {error.code})"
    except URLError as error:
        return f"Needs review ({error.reason})"


def main() -> int:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    config = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    grants = []
    sources = []
    for source in config["sources"]:
        health = check_source(source["url"])
        sources.append({"name": source["name"], "url": source["url"], "lastChecked": now, "health": health})
        for seed in source["seedGrants"]:
            grants.append({**seed, "source": source["name"], "url": source["url"], "lastVerified": now})
    OUTPUT_FILE.write_text(json.dumps({"generatedAt": now, "sources": sources, "grants": grants}, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {len(grants)} grants from {len(sources)} official sources.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
