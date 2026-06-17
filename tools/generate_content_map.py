from __future__ import annotations

import hashlib
import json
import re
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(r"E:\SENZA_MISURA_REBORN")
REPORTS = ROOT / "reports"
DATA = ROOT / "data"
MEDIA = ROOT / "public" / "media"
ARCHIVE = MEDIA / "archive"

SEED_URLS = [
    "http://www.senzamisura.org/senza_misura/",
    "http://www.senzamisura.org/senza_misura/Home.html",
    "https://adoratore.wixsite.com/senzamisura",
    "https://adoratore.wixsite.com/senzamisura/giubileo",
    "https://adoratore.wixsite.com/senzamisura/network",
    "https://adoratore.wixsite.com/senzamisura/cuoreafrica",
    "https://adoratore.wixsite.com/senzamisura/appuntamenti",
    "https://adoratore.wixsite.com/senzamisura/musica",
    "https://adoratore.wixsite.com/senzamisura/predicazioni",
    "https://adoratore.wixsite.com/senzamisura/ichurch",
    "https://adoratore.wixsite.com/senzamisura/contatti",
    "https://adoratore.wixsite.com/senzamisura/donazioni",
]
URL_RE = re.compile(r"https?://[^\s\"'<>\\]+", re.I)
EXT_RE = re.compile(r"\.(mp3|m4a|wav|ogg|flac|mp4|webm|mov|m4v|jpe?g|png|webp|gif|svg|ico|pdf|docx?|pptx?|xlsx?|zip|rar)(?:[/?#]|$)", re.I)

@dataclass
class Item:
    original_url: str
    title: str
    category: str
    file_type: str
    status: str
    local_path: str
    bytes: int
    keep_recommendation: str
    migration_strategy: str
    source: str
    sha256: str = ""


def normalize_url(raw: str) -> str:
    raw = raw.strip().rstrip(".,;]}>)")
    parts = urlsplit(raw)
    if not parts.scheme or not parts.netloc:
        return ""
    return raw


def ext_for(value: str) -> str:
    m = EXT_RE.search(value)
    if m:
        return m.group(1).lower().replace("jpeg", "jpg")
    suffix = Path(unquote(urlsplit(value).path if value.startswith("http") else value)).suffix.lower().lstrip(".")
    return suffix.replace("jpeg", "jpg") or "html"


def category_for(value: str, local_parent: str = "") -> str:
    parent = local_parent.lower()
    if parent in {"audio", "video", "images", "downloads", "archive"}:
        return "images" if parent == "images" else parent
    host = urlsplit(value).netloc.lower()
    if "youtu" in host:
        return "external-video"
    if "facebook" in host:
        return "external-archive"
    ext = ext_for(value)
    if ext in {"mp3", "m4a", "wav", "ogg", "flac"}:
        return "audio"
    if ext in {"mp4", "webm", "mov", "m4v"}:
        return "video"
    if ext in {"jpg", "png", "webp", "gif", "svg", "ico"}:
        return "images"
    if ext in {"pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "zip", "rar"}:
        return "downloads"
    return "page"


def strategy(cat: str) -> str:
    return {
        "audio": "Keep local original in /public/media/audio; index for Audio Library and Media Center; create optimized stream derivatives later.",
        "video": "Keep local original in /public/media/video; index for Video Library; generate posters/transcodes later.",
        "images": "Keep local original in /public/media/images; generate WebP/AVIF responsive variants during build.",
        "downloads": "Keep local document in /public/media/downloads; expose in Resources/Downloads with metadata.",
        "archive": "Keep as historical snapshot; use for text extraction and proof of legacy source.",
        "page": "Keep archived HTML snapshot and migrate text into structured content sections.",
        "external-video": "Indexed now; migrate with authorized YouTube export/download to remove external dependency.",
        "external-archive": "Indexed now; migrate Facebook album/media via approved export/API/manual process into local archive.",
    }.get(cat, "Keep, review, and migrate into modern platform.")


def title_for_url(url: str) -> str:
    path = unquote(urlsplit(url).path).strip("/")
    name = Path(path).stem or urlsplit(url).netloc or url
    name = re.sub(r"[_-]+", " ", name).strip()
    return name[:140] or url


def title_for_file(path: Path) -> str:
    name = path.stem
    name = re.sub(r"__[0-9a-f]{10}$", "", name)
    name = re.sub(r"[_-]+", " ", name).strip()
    return name[:140] or path.name


def sha_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 512), b""):
            h.update(chunk)
    return h.hexdigest()


def load_urls() -> dict[str, str]:
    urls = {u: "seed" for u in SEED_URLS}
    for folder in [REPORTS, ARCHIVE]:
        if not folder.exists():
            continue
        for path in folder.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in {".md", ".html", ".txt", ".json", ".csv"}:
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            for match in URL_RE.finditer(text):
                url = normalize_url(match.group(0))
                if url:
                    urls.setdefault(url, str(path.relative_to(ROOT)))
    return urls


def local_files() -> list[Path]:
    if not MEDIA.exists():
        return []
    return [p for p in MEDIA.rglob("*") if p.is_file() and not p.name.endswith(".part") and p.stat().st_size > 0]


def build() -> list[Item]:
    DATA.mkdir(parents=True, exist_ok=True)
    urls = load_urls()
    files = local_files()
    items: dict[str, Item] = {}

    by_digest: dict[str, Path] = {}
    for f in files:
        m = re.search(r"__([0-9a-f]{10})\.[^.]+$", f.name)
        if m:
            by_digest[m.group(1)] = f

    matched_files: set[Path] = set()
    for url, source in urls.items():
        cat = category_for(url)
        digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:10]
        local = by_digest.get(digest)
        local_path = ""
        size = 0
        sha = ""
        status = "indexed"
        if local:
            matched_files.add(local)
            local_path = str(local.relative_to(ROOT)).replace("\\", "/")
            size = local.stat().st_size
            sha = sha_file(local)
            status = "migrated-local"
        elif cat in {"audio", "video", "images", "downloads"}:
            status = "pending-download-or-manual-review"
        elif cat.startswith("external"):
            status = "indexed-external"
        items[url] = Item(url, title_for_url(url), cat, ext_for(url), status, local_path, size, "keep", strategy(cat), source, sha)

    for f in files:
        if f in matched_files:
            continue
        cat = category_for(str(f), f.parent.name)
        key = f"local://{str(f.relative_to(ROOT)).replace('\\', '/')}"
        items[key] = Item(key, title_for_file(f), cat, ext_for(str(f)), "migrated-local-unmatched", str(f.relative_to(ROOT)).replace("\\", "/"), f.stat().st_size, "keep", strategy(cat), "local-scan", sha_file(f))

    return sorted(items.values(), key=lambda x: (x.category, x.title.lower(), x.original_url))


def write(items: list[Item]) -> None:
    (DATA / "media-inventory.json").write_text(json.dumps([asdict(i) for i in items], ensure_ascii=False, indent=2), encoding="utf-8")
    library = []
    for i in items:
        if i.category in {"audio", "video", "images", "downloads", "external-video", "external-archive"}:
            year = re.search(r"(19|20)\d{2}", i.title + " " + i.original_url)
            library.append({
                "title": i.title,
                "category": i.category,
                "type": i.file_type,
                "year": year.group(0) if year else "",
                "sourceUrl": i.original_url if i.original_url.startswith("http") else "",
                "localPath": "/" + i.local_path.split("public/", 1)[-1] if i.local_path.startswith("public/") else i.local_path,
                "status": i.status,
                "tags": [t for t in [i.category, i.file_type, year.group(0) if year else ""] if t],
            })
    (DATA / "media-library.json").write_text(json.dumps(library, ensure_ascii=False, indent=2), encoding="utf-8")

    counts = {}
    statuses = {}
    for i in items:
        counts[i.category] = counts.get(i.category, 0) + 1
        statuses[i.status] = statuses.get(i.status, 0) + 1

    lines = [
        "# Senza Misura Reborn — Content Map",
        "",
        "> If any content exists only on the legacy websites, it must be migrated, preserved, indexed and made accessible from the new platform. No historical audio, video, teaching, document or downloadable resource may be lost during migration.",
        "",
        f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "## Source websites",
        "",
        "- http://www.senzamisura.org/senza_misura/",
        "- https://adoratore.wixsite.com/senzamisura",
        "",
        "## Inventory summary",
        "",
    ]
    for k, v in sorted(counts.items()):
        lines.append(f"- **{k}:** {v}")
    lines.extend(["", "## Status summary", ""])
    for k, v in sorted(statuses.items()):
        lines.append(f"- **{k}:** {v}")
    lines.extend([
        "",
        "## Preservation note",
        "",
        "This content map combines local migrated files, archived HTML snapshots, direct legacy links extracted from reports/pages, and external references requiring approved export (YouTube/Facebook). Items marked `pending-download-or-manual-review` are indexed and must be revisited before final launch if no local file exists yet.",
        "",
        "## Complete resource inventory",
        "",
        "| # | Title | Category | Type | Status | Original URL | Local Path | Keep Recommendation | Migration Strategy |",
        "|---:|---|---|---|---|---|---|---|---|",
    ])
    for n, i in enumerate(items, 1):
        row = [
            str(n),
            i.title.replace("|", "\\|")[:120],
            i.category,
            i.file_type,
            i.status,
            i.original_url.replace("|", "%7C"),
            i.local_path.replace("|", "%7C"),
            i.keep_recommendation,
            i.migration_strategy.replace("|", "\\|")[:220],
        ]
        lines.append("| " + " | ".join(row) + " |")
    content = "\n".join(lines) + "\n"
    (ROOT / "content-map.md").write_text(content, encoding="utf-8")
    (REPORTS / "content-map.md").write_text(content, encoding="utf-8")


def main() -> int:
    items = build()
    write(items)
    print(f"items={len(items)}")
    print(f"content_map={ROOT / 'content-map.md'}")
    print(f"media_library={DATA / 'media-library.json'}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
