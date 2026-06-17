from __future__ import annotations

import csv
import hashlib
import html
import json
import mimetypes
import re
import socket
import time
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT = Path(r"E:\SENZA_MISURA_REBORN")
REPORTS = ROOT / "reports"
DATA = ROOT / "data"
MEDIA = ROOT / "public" / "media"
ARCHIVE = MEDIA / "archive"
AUDIO = MEDIA / "audio"
VIDEO = MEDIA / "video"
IMAGES = MEDIA / "images"
DOWNLOADS = MEDIA / "downloads"

SEED_PAGES = [
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
    "https://adoratore.wixsite.com/senzamisura/predicazioni-2019",
    "https://adoratore.wixsite.com/senzamisura/predicazioni-2018",
    "https://adoratore.wixsite.com/senzamisura/predicazioni-2017",
    "https://adoratore.wixsite.com/senzamisura/predicazioni-2016",
    "https://adoratore.wixsite.com/senzamisura/predicazioni-2015",
    "https://adoratore.wixsite.com/senzamisura/predicazioni-2014",
    "https://adoratore.wixsite.com/senzamisura/contatti",
    "https://adoratore.wixsite.com/senzamisura/donazioni",
]

INTERNAL_PAGE_HOSTS = {"adoratore.wixsite.com", "www.senzamisura.org", "senzamisura.org"}
DIRECT_HOSTS = {
    "www.senzamisura.org", "senzamisura.org",
    "c8c1a902-9001-4bc4-95af-241c1e25bf5d.filesusr.com",
    "static.wixstatic.com", "static.parastorage.com",
}
EXTERNAL_ARCHIVE_HOSTS = {"www.youtube.com", "youtube.com", "youtu.be", "www.facebook.com", "facebook.com", "m.facebook.com"}
USER_AGENT = "SenzaMisuraRebornHeritageHarvest/1.0"
TIMEOUT = 25
socket.setdefaulttimeout(TIMEOUT)

@dataclass
class Item:
    original_url: str
    final_url: str
    title: str
    category: str
    file_type: str
    source: str
    status: str
    keep_recommendation: str
    migration_strategy: str
    local_path: str = ""
    bytes: int = 0
    sha256: str = ""
    error: str = ""

URL_RE = re.compile(r"https?://[^\s\"'<>\\]+", re.IGNORECASE)
HREF_RE = re.compile(r"(?:href|src|poster|data-src|data-href)=['\"]([^'\"]+)['\"]", re.IGNORECASE)
SRCSET_RE = re.compile(r"(?:srcset|data-srcset)=['\"]([^'\"]+)['\"]", re.IGNORECASE)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
MEDIA_EXT_RE = re.compile(r"\.(mp3|m4a|wav|ogg|flac|mp4|webm|mov|m4v|jpe?g|png|webp|gif|svg|ico|pdf|docx?|pptx?|xlsx?|zip|rar)(?:[/?#]|$)", re.IGNORECASE)

CATEGORY_EXTS = {
    "audio": {"mp3", "m4a", "wav", "ogg", "flac"},
    "video": {"mp4", "webm", "mov", "m4v"},
    "images": {"jpg", "jpeg", "png", "webp", "gif", "svg", "ico"},
    "downloads": {"pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "zip", "rar"},
}

def ensure_dirs() -> None:
    for p in [DATA, ARCHIVE, AUDIO, VIDEO, IMAGES, DOWNLOADS, REPORTS]:
        p.mkdir(parents=True, exist_ok=True)

def clean_url(raw: str, base: str | None = None) -> str:
    raw = html.unescape(raw.strip()).strip("'\" ")
    raw = raw.rstrip(".,;]}>")
    while raw.endswith(")") and raw.count("(") < raw.count(")"):
        raw = raw[:-1]
    if base:
        raw = urllib.parse.urljoin(base, raw)
    parts = urllib.parse.urlsplit(raw)
    if not parts.scheme or not parts.netloc:
        return ""
    path = urllib.parse.quote(urllib.parse.unquote(parts.path), safe="/%:@._-~")
    return urllib.parse.urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, parts.query, ""))

def host(url: str) -> str:
    return urllib.parse.urlsplit(url).netloc.lower()

def title_from_html(text: str, fallback: str) -> str:
    match = TITLE_RE.search(text)
    if match:
        return re.sub(r"\s+", " ", html.unescape(match.group(1))).strip()
    return fallback

def ext_from_url(url: str) -> str:
    match = MEDIA_EXT_RE.search(urllib.parse.urlsplit(url).path + "?")
    if match:
        return match.group(1).lower().replace("jpeg", "jpg")
    suffix = Path(urllib.parse.unquote(urllib.parse.urlsplit(url).path)).suffix.lower().lstrip(".")
    return suffix.replace("jpeg", "jpg")

def category(url: str) -> str:
    h = host(url)
    if h in EXTERNAL_ARCHIVE_HOSTS:
        if "youtu" in h:
            return "external-video"
        return "external-archive"
    ext = ext_from_url(url)
    for cat, exts in CATEGORY_EXTS.items():
        if ext in exts:
            return cat
    return "page"

def target_dir(cat: str) -> Path:
    return {"audio": AUDIO, "video": VIDEO, "images": IMAGES, "downloads": DOWNLOADS}.get(cat, ARCHIVE)

def safe_name(url: str, fallback_ext: str = "") -> str:
    parts = urllib.parse.urlsplit(url)
    decoded = urllib.parse.unquote(parts.path).strip("/") or "index"
    decoded = re.sub(r"/v1/.*$", "", decoded)
    decoded = decoded.replace("/", "__")
    decoded = re.sub(r"[^A-Za-z0-9._-]+", "_", decoded).strip("._") or "resource"
    ext = ext_from_url(url) or fallback_ext.strip(".")
    if ext and not decoded.lower().endswith("." + ext.lower()):
        decoded += "." + ext
    if not ext and "." not in Path(decoded).name:
        decoded += ".html"
    suffix = Path(decoded).suffix
    stem = Path(decoded).stem[:145]
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:10]
    return f"{stem}__{digest}{suffix}"

def request(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    return urllib.request.urlopen(req, timeout=TIMEOUT)

def fetch_text(url: str) -> tuple[str, str, bytes, str]:
    with request(url) as resp:
        final = clean_url(resp.geturl())
        ctype = resp.headers.get("Content-Type", "")
        raw = resp.read()
    charset = "utf-8"
    m = re.search(r"charset=([\w-]+)", ctype, re.I)
    if m:
        charset = m.group(1)
    try:
        text = raw.decode(charset, errors="replace")
    except LookupError:
        text = raw.decode("utf-8", errors="replace")
    return final, ctype, raw, text

def extract_urls(text: str, base: str | None = None) -> set[str]:
    out: set[str] = set()
    for m in URL_RE.finditer(text):
        url = clean_url(m.group(0))
        if url:
            out.add(url)
    for m in HREF_RE.finditer(text):
        url = clean_url(m.group(1), base)
        if url:
            out.add(url)
    for m in SRCSET_RE.finditer(text):
        for part in m.group(1).split(","):
            url = clean_url(part.strip().split(" ")[0], base)
            if url:
                out.add(url)
    return out

def strategy(cat: str) -> str:
    if cat == "audio":
        return "Preserve original in /public/media/audio, index metadata, expose in Audio Library and Netflix-style Media Center."
    if cat == "video":
        return "Preserve original in /public/media/video, create poster/metadata, expose in Video Library and Media Center."
    if cat == "images":
        return "Preserve original in /public/media/images and later generate optimized WebP/AVIF derivatives."
    if cat == "downloads":
        return "Preserve in /public/media/downloads and expose through Resources/Downloads with searchable metadata."
    if cat == "external-video":
        return "Indexed now; migrate via official/authorized export to remove YouTube dependency while preserving public reference."
    if cat == "external-archive":
        return "Indexed now; export album/media via approved Facebook archive/API/manual process into /public/media/archive and images."
    return "Archive HTML snapshot, extract text/media, migrate content into structured platform content model."

def item_for_external(url: str, source: str) -> Item:
    cat = category(url)
    return Item(url, url, url, cat, "external-url", source, "indexed-external", "keep-and-migrate", strategy(cat))

def download_file(url: str, source: str) -> Item:
    cat = category(url)
    dest_dir = target_dir(cat)
    filename = safe_name(url)
    dest = dest_dir / filename
    if dest.exists() and dest.stat().st_size > 0:
        data = dest.read_bytes()
        return Item(url, url, filename, cat, ext_from_url(url) or "unknown", source, "already-downloaded", "keep", strategy(cat), str(dest.relative_to(ROOT)), len(data), hashlib.sha256(data).hexdigest())
    if dest.exists() and dest.stat().st_size == 0:
        dest.unlink()
    tmp = dest.with_suffix(dest.suffix + ".part")
    try:
        with request(url) as resp:
            final = clean_url(resp.geturl()) or url
            ctype = resp.headers.get("Content-Type", "")
            final_cat = category(final)
            if final_cat != cat:
                cat = final_cat
                dest_dir = target_dir(cat)
                dest = dest_dir / safe_name(final, mimetypes.guess_extension(ctype.split(";")[0].strip()) or "")
                tmp = dest.with_suffix(dest.suffix + ".part")
            h = hashlib.sha256()
            total = 0
            with tmp.open("wb") as f:
                while True:
                    chunk = resp.read(1024 * 128)
                    if not chunk:
                        break
                    f.write(chunk)
                    h.update(chunk)
                    total += len(chunk)
            tmp.replace(dest)
        return Item(url, final, dest.name, cat, ext_from_url(final) or ext_from_url(url) or "unknown", source, "downloaded", "keep", strategy(cat), str(dest.relative_to(ROOT)), total, h.hexdigest())
    except Exception as exc:
        if tmp.exists():
            try:
                tmp.unlink()
            except OSError:
                pass
        return Item(url, url, filename, cat, ext_from_url(url) or "unknown", source, "error", "keep-manual-review", strategy(cat), error=str(exc))

def archive_page(url: str, source: str) -> tuple[Item, str]:
    try:
        final, ctype, raw, text = fetch_text(url)
        name = safe_name(final, "html")
        if not name.endswith((".html", ".htm")):
            name += ".html"
        dest = ARCHIVE / name
        dest.write_bytes(raw)
        h = hashlib.sha256(raw).hexdigest()
        title = title_from_html(text, final)
        return Item(url, final, title, "page", "html", source, "archived-page", "keep", strategy("page"), str(dest.relative_to(ROOT)), len(raw), h), text
    except Exception as exc:
        return Item(url, url, url, "page", "html", source, "error", "keep-manual-review", strategy("page"), error=str(exc)), ""

def load_existing_texts() -> list[tuple[str, str]]:
    texts: list[tuple[str, str]] = []
    for folder in [REPORTS, ARCHIVE]:
        if not folder.exists():
            continue
        for path in folder.rglob("*"):
            if path.is_file() and path.suffix.lower() in {".md", ".html", ".json", ".txt", ".csv"}:
                try:
                    texts.append((str(path.relative_to(ROOT)), path.read_text(encoding="utf-8", errors="replace")))
                except OSError:
                    pass
    return texts

def write_outputs(items: dict[str, Item]) -> None:
    ordered = sorted(items.values(), key=lambda i: (i.category, i.title.lower(), i.original_url))
    DATA.mkdir(parents=True, exist_ok=True)
    json_path = DATA / "media-inventory.json"
    csv_path = DATA / "media-inventory.csv"
    json_path.write_text(json.dumps([asdict(i) for i in ordered], ensure_ascii=False, indent=2), encoding="utf-8")
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        if ordered:
            w = csv.DictWriter(f, fieldnames=list(asdict(ordered[0]).keys()))
            w.writeheader()
            for item in ordered:
                w.writerow(asdict(item))
    counts: dict[str, int] = {}
    statuses: dict[str, int] = {}
    for item in ordered:
        counts[item.category] = counts.get(item.category, 0) + 1
        statuses[item.status] = statuses.get(item.status, 0) + 1
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
    lines += ["", "## Status summary", ""]
    for k, v in sorted(statuses.items()):
        lines.append(f"- **{k}:** {v}")
    lines += [
        "",
        "## Complete resource inventory",
        "",
        "| # | Title | Category | Type | Status | Original URL | Local Path | Keep Recommendation | Migration Strategy |",
        "|---:|---|---|---|---|---|---|---|---|",
    ]
    for n, item in enumerate(ordered, 1):
        row = [
            str(n),
            (item.title or item.original_url).replace("|", "\\|").replace("\n", " ")[:120],
            item.category,
            item.file_type,
            item.status,
            item.original_url.replace("|", "%7C"),
            item.local_path.replace("|", "%7C"),
            item.keep_recommendation,
            item.migration_strategy.replace("|", "\\|").replace("\n", " ")[:240],
        ]
        lines.append("| " + " | ".join(row) + " |")
    content = "\n".join(lines) + "\n"
    (ROOT / "content-map.md").write_text(content, encoding="utf-8")
    (REPORTS / "content-map.md").write_text(content, encoding="utf-8")

def main() -> int:
    ensure_dirs()
    items: dict[str, Item] = {}
    page_queue = [clean_url(u) for u in SEED_PAGES]
    seen_pages: set[str] = set()
    candidate_urls: set[str] = set()

    for source, text in load_existing_texts():
        candidate_urls |= extract_urls(text)

    while page_queue and len(seen_pages) < 80:
        page = page_queue.pop(0)
        if not page or page in seen_pages:
            continue
        if host(page) not in INTERNAL_PAGE_HOSTS:
            continue
        seen_pages.add(page)
        item, text = archive_page(page, "seed-page")
        items[item.original_url] = item
        found = extract_urls(text, item.final_url)
        candidate_urls |= found
        for url in found:
            if host(url) in INTERNAL_PAGE_HOSTS and category(url) == "page" and "/senzamisura" in urllib.parse.urlsplit(url).path:
                if url not in seen_pages and url not in page_queue:
                    page_queue.append(url)

    for source, text in load_existing_texts():
        candidate_urls |= extract_urls(text)

    normalized = sorted({clean_url(u) for u in candidate_urls if clean_url(u)})
    direct = []
    external = []
    for url in normalized:
        cat = category(url)
        h = host(url)
        if cat in {"audio", "video", "images", "downloads"} and (h in DIRECT_HOSTS or h.endswith(".wixstatic.com") or h.endswith(".parastorage.com")):
            direct.append(url)
        elif cat in {"external-video", "external-archive"}:
            external.append(url)

    print(f"pages archived/indexed: {len(seen_pages)}")
    print(f"direct resources discovered: {len(direct)}")
    print(f"external resources indexed: {len(external)}")

    for url in external:
        items.setdefault(url, item_for_external(url, "extracted-link"))

    for index, url in enumerate(direct, 1):
        if url in items and items[url].status in {"downloaded", "already-downloaded"}:
            continue
        print(f"[{index}/{len(direct)}] {category(url)} {url}")
        items[url] = download_file(url, "extracted-link")

    write_outputs(items)
    print(f"inventory items: {len(items)}")
    print(ROOT / "content-map.md")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
