from __future__ import annotations

import csv
import hashlib
import html
import json
import mimetypes
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable

ROOT = Path(r"E:\SENZA_MISURA_REBORN")
DATA_DIR = ROOT / "data"
PUBLIC_MEDIA = ROOT / "public" / "media"
ARCHIVE_DIR = PUBLIC_MEDIA / "archive"
AUDIO_DIR = PUBLIC_MEDIA / "audio"
VIDEO_DIR = PUBLIC_MEDIA / "video"
IMAGES_DIR = PUBLIC_MEDIA / "images"
DOWNLOADS_DIR = PUBLIC_MEDIA / "downloads"
REPORTS_DIR = ROOT / "reports"

START_URLS = [
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

ALLOWED_INTERNAL_HOSTS = {
    "www.senzamisura.org",
    "senzamisura.org",
    "adoratore.wixsite.com",
    "adoratore.wix.com",
    "c8c1a902-9001-4bc4-95af-241c1e25bf5d.filesusr.com",
    "static.wixstatic.com",
    "static.parastorage.com",
}

DIRECT_DOWNLOAD_EXTENSIONS = {
    ".mp3", ".m4a", ".wav", ".ogg", ".flac",
    ".mp4", ".webm", ".mov", ".m4v",
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico",
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar",
}

PAGE_EXTENSIONS = {"", ".html", ".htm", ".php", ".asp", ".aspx"}
EXTERNAL_MEDIA_HOSTS = {"youtube.com", "www.youtube.com", "youtu.be", "facebook.com", "www.facebook.com", "m.facebook.com"}
USER_AGENT = "SenzaMisuraRebornDigitalPreservation/1.0 (+heritage preservation)"
TIMEOUT = 35
MAX_PAGES = 500

@dataclass
class Resource:
    original_url: str
    final_url: str
    title: str
    category: str
    file_type: str
    content_type: str
    source_page: str
    status: str
    keep_recommendation: str
    migration_strategy: str
    local_path: str = ""
    bytes: int = 0
    sha256: str = ""
    error: str = ""

class LinkExtractor(HTMLParser):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url
        self.links: set[str] = set()
        self.title_parts: list[str] = []
        self._in_title = False

    def handle_starttag(self, tag: str, attrs):
        attrs_dict = dict(attrs)
        if tag.lower() == "title":
            self._in_title = True
        for attr in ("href", "src", "poster", "data-src", "data-href"):
            value = attrs_dict.get(attr)
            if value:
                self.add_link(value)
        srcset = attrs_dict.get("srcset") or attrs_dict.get("data-srcset")
        if srcset:
            for part in srcset.split(","):
                url = part.strip().split(" ")[0]
                if url:
                    self.add_link(url)

    def handle_endtag(self, tag: str):
        if tag.lower() == "title":
            self._in_title = False

    def handle_data(self, data: str):
        if self._in_title:
            self.title_parts.append(data.strip())

    def add_link(self, raw: str):
        if not raw or raw.startswith(("mailto:", "tel:", "javascript:", "#")):
            return
        self.links.add(normalize_url(urllib.parse.urljoin(self.base_url, html.unescape(raw))))

    @property
    def title(self) -> str:
        return " ".join(part for part in self.title_parts if part).strip()

def ensure_dirs() -> None:
    for path in [DATA_DIR, ARCHIVE_DIR, AUDIO_DIR, VIDEO_DIR, IMAGES_DIR, DOWNLOADS_DIR, REPORTS_DIR]:
        path.mkdir(parents=True, exist_ok=True)

def normalize_url(url: str) -> str:
    url = url.strip()
    parsed = urllib.parse.urlsplit(url)
    scheme = parsed.scheme.lower() or "https"
    netloc = parsed.netloc.lower()
    path = urllib.parse.quote(urllib.parse.unquote(parsed.path), safe="/%:@")
    query = parsed.query
    return urllib.parse.urlunsplit((scheme, netloc, path, query, ""))

def url_ext(url: str) -> str:
    path = urllib.parse.urlsplit(url).path
    return Path(urllib.parse.unquote(path)).suffix.lower()

def host_of(url: str) -> str:
    return urllib.parse.urlsplit(url).netloc.lower()

def is_internal(url: str) -> bool:
    host = host_of(url)
    return host in ALLOWED_INTERNAL_HOSTS or host.endswith(".wixstatic.com") or host.endswith(".parastorage.com")

def is_external_media(url: str) -> bool:
    host = host_of(url)
    return host in EXTERNAL_MEDIA_HOSTS or any(host.endswith("." + h) for h in EXTERNAL_MEDIA_HOSTS)

def category_for(url: str, content_type: str = "") -> str:
    ext = url_ext(url)
    ctype = content_type.lower()
    if ext in {".mp3", ".m4a", ".wav", ".ogg", ".flac"} or ctype.startswith("audio/"):
        return "audio"
    if ext in {".mp4", ".webm", ".mov", ".m4v"} or ctype.startswith("video/"):
        return "video"
    if ext in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico"} or ctype.startswith("image/"):
        return "images"
    if ext in {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar"}:
        return "downloads"
    if "youtube.com" in url or "youtu.be" in url:
        return "external-video"
    if "facebook.com" in url:
        return "external-archive"
    return "page"

def file_type_for(url: str, content_type: str = "") -> str:
    ext = url_ext(url).lstrip(".")
    if ext:
        return ext
    if content_type:
        guessed = mimetypes.guess_extension(content_type.split(";")[0].strip())
        if guessed:
            return guessed.lstrip(".")
    return "html" if category_for(url, content_type) == "page" else "unknown"

def local_dir_for(category: str) -> Path:
    if category == "audio":
        return AUDIO_DIR
    if category == "video":
        return VIDEO_DIR
    if category == "images":
        return IMAGES_DIR
    if category == "downloads":
        return DOWNLOADS_DIR
    return ARCHIVE_DIR

def safe_filename(url: str, content_type: str = "") -> str:
    parsed = urllib.parse.urlsplit(url)
    decoded_path = urllib.parse.unquote(parsed.path).strip("/")
    name = decoded_path.replace("/", "__") or "index"
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._") or "resource"
    ext = Path(name).suffix
    if not ext:
        guessed_ext = mimetypes.guess_extension(content_type.split(";")[0].strip()) if content_type else None
        ext = guessed_ext or ".html"
        name += ext
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:10]
    stem = name[:150 - len(ext)] if len(name) > 160 else Path(name).stem
    suffix = Path(name).suffix or ext
    return f"{stem}__{digest}{suffix}"

def request_url(url: str, method: str = "GET"):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": USER_AGENT})
    return urllib.request.urlopen(req, timeout=TIMEOUT)

def fetch_page(url: str) -> tuple[str, str, str, bytes]:
    with request_url(url) as resp:
        final_url = normalize_url(resp.geturl())
        content_type = resp.headers.get("Content-Type", "")
        raw = resp.read()
    charset_match = re.search(r"charset=([\w-]+)", content_type, re.I)
    charset = charset_match.group(1) if charset_match else "utf-8"
    try:
        text = raw.decode(charset, errors="replace")
    except LookupError:
        text = raw.decode("utf-8", errors="replace")
    return final_url, content_type, text, raw

def extract_all_links(base_url: str, text: str) -> tuple[str, set[str]]:
    parser = LinkExtractor(base_url)
    parser.feed(text)
    links = set(parser.links)
    for match in re.finditer(r"url\(([^)]+)\)", text):
        raw = match.group(1).strip("'\" ")
        if raw and not raw.startswith("data:"):
            links.add(normalize_url(urllib.parse.urljoin(base_url, html.unescape(raw))))
    for match in re.finditer(r"https?://[^\s'\"<>\\)]+", text):
        raw = match.group(0).rstrip(".,;]")
        links.add(normalize_url(raw))
    return parser.title, links

def save_binary(url: str, source_page: str) -> Resource:
    category = category_for(url)
    target_dir = local_dir_for(category)
    try:
        with request_url(url) as resp:
            final_url = normalize_url(resp.geturl())
            content_type = resp.headers.get("Content-Type", "")
            category = category_for(final_url, content_type)
            target_dir = local_dir_for(category)
            filename = safe_filename(final_url, content_type)
            target = target_dir / filename
            hasher = hashlib.sha256()
            total = 0
            if target.exists() and target.stat().st_size > 0:
                data = target.read_bytes()
                return Resource(
                    original_url=url,
                    final_url=final_url,
                    title=Path(urllib.parse.urlsplit(final_url).path).name or final_url,
                    category=category,
                    file_type=file_type_for(final_url, content_type),
                    content_type=content_type,
                    source_page=source_page,
                    status="already-downloaded",
                    keep_recommendation="keep",
                    migration_strategy=strategy_for(category, final_url),
                    local_path=str(target.relative_to(ROOT)),
                    bytes=len(data),
                    sha256=hashlib.sha256(data).hexdigest(),
                )
            with target.open("wb") as f:
                while True:
                    chunk = resp.read(1024 * 256)
                    if not chunk:
                        break
                    f.write(chunk)
                    hasher.update(chunk)
                    total += len(chunk)
        return Resource(
            original_url=url,
            final_url=final_url,
            title=Path(urllib.parse.urlsplit(final_url).path).name or final_url,
            category=category,
            file_type=file_type_for(final_url, content_type),
            content_type=content_type,
            source_page=source_page,
            status="downloaded",
            keep_recommendation="keep",
            migration_strategy=strategy_for(category, final_url),
            local_path=str(target.relative_to(ROOT)),
            bytes=total,
            sha256=hasher.hexdigest(),
        )
    except Exception as exc:
        return Resource(
            original_url=url,
            final_url=url,
            title=Path(urllib.parse.urlsplit(url).path).name or url,
            category=category_for(url),
            file_type=file_type_for(url),
            content_type="",
            source_page=source_page,
            status="error",
            keep_recommendation="keep-manual-review",
            migration_strategy=strategy_for(category_for(url), url),
            error=str(exc),
        )

def strategy_for(category: str, url: str) -> str:
    if category == "audio":
        return "Migrate to /public/media/audio, generate searchable metadata, expose in Audio Library and Media Center. Optional web-optimized derivative can be created later."
    if category == "video":
        return "Migrate to /public/media/video, create poster/metadata, expose in Video Library and Media Center."
    if category == "images":
        return "Migrate to /public/media/images, optimize to WebP/AVIF, preserve original in archive."
    if category == "downloads":
        return "Migrate to /public/media/downloads, index title/description, expose in Resources/Downloads."
    if category == "external-video":
        return "Preserve URL now; migrate via official source export or authorized downloader, then store local copy in /public/media/video."
    if category == "external-archive":
        return "Preserve URL now; export/download album/media manually or with approved platform tool, then store in /public/media/archive and images."
    return "Preserve HTML snapshot in /public/media/archive, extract internal links, migrate relevant text into CMS/content layer."

def record_external(url: str, source_page: str) -> Resource:
    category = category_for(url)
    return Resource(
        original_url=url,
        final_url=url,
        title=url,
        category=category,
        file_type="external-url",
        content_type="external",
        source_page=source_page,
        status="indexed-external",
        keep_recommendation="keep-and-migrate-with-approved-export",
        migration_strategy=strategy_for(category, url),
    )

def crawl() -> list[Resource]:
    ensure_dirs()
    resources: dict[str, Resource] = {}
    seen_pages: set[str] = set()
    queue: list[str] = [normalize_url(url) for url in START_URLS]

    while queue and len(seen_pages) < MAX_PAGES:
        url = queue.pop(0)
        if url in seen_pages:
            continue
        ext = url_ext(url)
        if ext in DIRECT_DOWNLOAD_EXTENSIONS:
            resources[url] = save_binary(url, "seed/direct")
            continue
        if is_external_media(url):
            resources[url] = record_external(url, "seed/external")
            continue
        if not is_internal(url):
            continue

        seen_pages.add(url)
        try:
            final_url, content_type, text, raw = fetch_page(url)
            title, links = extract_all_links(final_url, text)
            local_name = safe_filename(final_url, content_type or "text/html")
            if not local_name.endswith((".html", ".htm")):
                local_name += ".html"
            local_path = ARCHIVE_DIR / local_name
            local_path.write_bytes(raw)
            resources[url] = Resource(
                original_url=url,
                final_url=final_url,
                title=title or final_url,
                category="page",
                file_type="html",
                content_type=content_type,
                source_page="seed/crawl",
                status="archived-page",
                keep_recommendation="keep",
                migration_strategy=strategy_for("page", final_url),
                local_path=str(local_path.relative_to(ROOT)),
                bytes=len(raw),
                sha256=hashlib.sha256(raw).hexdigest(),
            )

            for link in sorted(links):
                if link in resources:
                    continue
                if is_external_media(link):
                    resources[link] = record_external(link, final_url)
                    continue
                if not is_internal(link):
                    continue
                link_ext = url_ext(link)
                if link_ext in DIRECT_DOWNLOAD_EXTENSIONS:
                    resources[link] = save_binary(link, final_url)
                    time.sleep(0.15)
                elif link_ext in PAGE_EXTENSIONS and link not in seen_pages and link not in queue:
                    queue.append(link)
        except Exception as exc:
            resources[url] = Resource(
                original_url=url,
                final_url=url,
                title=url,
                category=category_for(url),
                file_type=file_type_for(url),
                content_type="",
                source_page="seed/crawl",
                status="error",
                keep_recommendation="keep-manual-review",
                migration_strategy=strategy_for(category_for(url), url),
                error=str(exc),
            )
        time.sleep(0.2)

    return list(resources.values())

def write_outputs(resources: list[Resource]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    json_path = DATA_DIR / "media-inventory.json"
    csv_path = DATA_DIR / "media-inventory.csv"
    md_path = ROOT / "content-map.md"

    resources_sorted = sorted(resources, key=lambda r: (r.category, r.title.lower(), r.original_url))
    json_path.write_text(json.dumps([asdict(r) for r in resources_sorted], ensure_ascii=False, indent=2), encoding="utf-8")

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(asdict(resources_sorted[0]).keys()) if resources_sorted else [])
        if resources_sorted:
            writer.writeheader()
            for resource in resources_sorted:
                writer.writerow(asdict(resource))

    counts: dict[str, int] = {}
    statuses: dict[str, int] = {}
    for resource in resources_sorted:
        counts[resource.category] = counts.get(resource.category, 0) + 1
        statuses[resource.status] = statuses.get(resource.status, 0) + 1

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
    for category, count in sorted(counts.items()):
        lines.append(f"- **{category}:** {count}")
    lines.extend(["", "## Status summary", ""])
    for status, count in sorted(statuses.items()):
        lines.append(f"- **{status}:** {count}")
    lines.extend([
        "",
        "## Migration rules",
        "",
        "- **Pages:** HTML snapshots are preserved in `/public/media/archive`; textual content must be migrated into structured CMS/content files.",
        "- **Audio:** Direct files are preserved in `/public/media/audio`; they must power the Audio Library and Netflix-style Media Center.",
        "- **Video:** Direct files are preserved in `/public/media/video`; YouTube links are indexed and require authorized export/download before removing external dependency.",
        "- **Images:** Originals are preserved in `/public/media/images`; optimized WebP/AVIF derivatives can be generated during website build.",
        "- **Downloads:** PDF/document files are preserved in `/public/media/downloads`; they must be exposed through Resources/Downloads.",
        "- **External archives:** Facebook/YouTube content is indexed now and flagged for approved manual/API migration to avoid loss.",
        "",
        "## Complete resource inventory",
        "",
        "| # | Title | Category | Type | Status | Original URL | Local Path | Keep | Migration Strategy |",
        "|---:|---|---|---|---|---|---|---|---|",
    ])
    for index, resource in enumerate(resources_sorted, start=1):
        title = (resource.title or resource.original_url).replace("|", "\\|").replace("\n", " ")[:120]
        original = resource.original_url.replace("|", "%7C")
        local = resource.local_path.replace("|", "%7C")
        strategy = resource.migration_strategy.replace("|", "\\|").replace("\n", " ")[:220]
        lines.append(
            f"| {index} | {title} | {resource.category} | {resource.file_type} | {resource.status} | {original} | {local} | {resource.keep_recommendation} | {strategy} |"
        )
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    (REPORTS_DIR / "content-map.md").write_text(md_path.read_text(encoding="utf-8"), encoding="utf-8")

def main() -> int:
    print("Senza Misura Reborn digital preservation started")
    print(f"Root: {ROOT}")
    resources = crawl()
    write_outputs(resources)
    print(f"Resources indexed: {len(resources)}")
    print(f"Content map: {ROOT / 'content-map.md'}")
    print(f"JSON inventory: {DATA_DIR / 'media-inventory.json'}")
    print(f"CSV inventory: {DATA_DIR / 'media-inventory.csv'}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
