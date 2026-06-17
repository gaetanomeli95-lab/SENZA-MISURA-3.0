from __future__ import annotations

import argparse
import hashlib
import json
import re
import socket
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(r"E:\SENZA_MISURA_REBORN")
DATA = ROOT / "data"
MEDIA = ROOT / "public" / "media"
AUDIO = MEDIA / "audio"
VIDEO = MEDIA / "video"
IMAGES = MEDIA / "images"
DOWNLOADS = MEDIA / "downloads"
USER_AGENT = "SenzaMisuraRebornPendingDownloader/1.0"
DIRECT_CATEGORIES = {"audio", "video", "images", "downloads"}
DIRECT_HOST_HINTS = ("senzamisura.org", "filesusr.com", "wixstatic.com", "parastorage.com")
EXT_RE = re.compile(r"\.(mp3|m4a|wav|ogg|flac|mp4|webm|mov|m4v|jpe?g|png|webp|gif|svg|ico|pdf|docx?|pptx?|xlsx?|zip|rar)(?:[/?#]|$)", re.I)


def ext_for(url: str) -> str:
    m = EXT_RE.search(urllib.parse.urlsplit(url).path + "?")
    if m:
        return m.group(1).lower().replace("jpeg", "jpg")
    return Path(urllib.parse.unquote(urllib.parse.urlsplit(url).path)).suffix.lower().lstrip(".") or "bin"


def target_dir(category: str) -> Path:
    return {"audio": AUDIO, "video": VIDEO, "images": IMAGES, "downloads": DOWNLOADS}.get(category, MEDIA / "archive")


def safe_name(url: str) -> str:
    parts = urllib.parse.urlsplit(url)
    name = urllib.parse.unquote(parts.path).strip("/").replace("/", "__") or "resource"
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._") or "resource"
    ext = ext_for(url)
    if not name.lower().endswith("." + ext):
        name += "." + ext
    suffix = Path(name).suffix
    stem = Path(name).stem[:145]
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:10]
    return f"{stem}__{digest}{suffix}"


def load_pending() -> list[dict]:
    path = DATA / "media-library.json"
    items = json.loads(path.read_text(encoding="utf-8"))
    pending = []
    for item in items:
        url = item.get("sourceUrl") or ""
        category = item.get("category") or ""
        if category not in DIRECT_CATEGORIES:
            continue
        if item.get("localPath"):
            continue
        if not url.startswith("http"):
            continue
        if not any(h in urllib.parse.urlsplit(url).netloc.lower() for h in DIRECT_HOST_HINTS):
            continue
        pending.append(item)
    pending.sort(key=lambda x: (x.get("category") != "audio", x.get("title", ""), x.get("sourceUrl", "")))
    return pending


def download(item: dict, per_file_timeout: int) -> tuple[str, int, str]:
    url = item["sourceUrl"]
    category = item["category"]
    dest_dir = target_dir(category)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / safe_name(url)
    if dest.exists() and dest.stat().st_size > 0:
        return "already", dest.stat().st_size, str(dest.relative_to(ROOT))
    if dest.exists() and dest.stat().st_size == 0:
        dest.unlink()
    tmp = dest.with_suffix(dest.suffix + ".part")
    if tmp.exists():
        tmp.unlink()
    socket.setdefaulttimeout(per_file_timeout)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    total = 0
    with urllib.request.urlopen(req, timeout=per_file_timeout) as resp:
        with tmp.open("wb") as f:
            while True:
                chunk = resp.read(1024 * 256)
                if not chunk:
                    break
                f.write(chunk)
                total += len(chunk)
    tmp.replace(dest)
    return "downloaded", total, str(dest.relative_to(ROOT))


def cleanup_partials() -> int:
    count = 0
    for part in MEDIA.rglob("*.part"):
        try:
            part.unlink()
            count += 1
        except OSError:
            pass
    return count


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-files", type=int, default=80)
    parser.add_argument("--max-seconds", type=int, default=600)
    parser.add_argument("--per-file-timeout", type=int, default=35)
    args = parser.parse_args()

    removed = cleanup_partials()
    print(f"removed_partials={removed}", flush=True)
    pending = load_pending()
    print(f"pending_candidates={len(pending)}", flush=True)
    started = time.time()
    done = 0
    errors = 0
    for item in pending:
        if done >= args.max_files:
            break
        if time.time() - started > args.max_seconds:
            print("time_budget_reached", flush=True)
            break
        url = item["sourceUrl"]
        print(f"[{done + 1}/{min(args.max_files, len(pending))}] {item['category']} {item['title'][:90]}", flush=True)
        try:
            status, size, local = download(item, args.per_file_timeout)
            print(f"  {status} {size} {local}", flush=True)
            done += 1
        except Exception as exc:
            errors += 1
            print(f"  error {url} :: {exc}", flush=True)
            done += 1
    subprocess.run([sys.executable, str(ROOT / "tools" / "generate_content_map.py")], check=False)
    print(f"processed={done} errors={errors}", flush=True)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
