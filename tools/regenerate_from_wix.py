#!/usr/bin/env python3
"""Regenerate site content from archived Wix pages.

This script extracts titles, meta descriptions, headings, paragraphs and image
references from HTML files under `public/media/archive` and writes a JSON
summary to `data/wix_content.json`.

It applies small automated fixes (simple Italian apostrophe corrections)
so we don't blindly copy minor typographic errors from the archived pages.
"""

from pathlib import Path
import re
import json
import html
import sys


def clean_text(s: str) -> str:
    if not s:
        return ""
    # remove scripts and tags
    s = re.sub(r'<script.*?>.*?</script>', '', s, flags=re.I | re.S)
    s = re.sub(r'<style.*?>.*?</style>', '', s, flags=re.I | re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    # small Italian fixes to avoid copying obvious typos
    s = re.sub(r"\bcè\b", "c'è", s, flags=re.I)
    s = re.sub(r"\bCè\b", "C'è", s)
    s = re.sub(r"\bnon cè\b", "non c'è", s, flags=re.I)
    # common accent fixes and brand spacing
    s = re.sub(r"Perchè", "Perché", s)
    s = re.sub(r"SenzaMisura|senzamisura", "Senza Misura", s)
    return s


def main():
    root = Path(__file__).resolve().parents[1]
    archive_dir = root / 'public' / 'media' / 'archive'
    out_dir = root / 'data'
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / 'wix_content.json'

    if not archive_dir.exists():
        print(f'Archive folder not found: {archive_dir}')
        sys.exit(1)

    pages = {}
    for f in sorted(archive_dir.glob('*.html')):
        text = f.read_text(encoding='utf-8', errors='ignore')
        title_m = re.search(r'<title>(.*?)</title>', text, re.I | re.S)
        title = clean_text(title_m.group(1)) if title_m else f.stem

        meta_m = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', text, re.I | re.S)
        meta = clean_text(meta_m.group(1)) if meta_m else ''

        headings_raw = re.findall(r'<h([1-4])[^>]*>(.*?)</h\1>', text, re.I | re.S)
        headings = []
        for lvl, inner in headings_raw:
            t = clean_text(inner)
            if t:
                headings.append({'tag': f'h{lvl}', 'text': t})

        paras_raw = re.findall(r'<p[^>]*>(.*?)</p>', text, re.I | re.S)
        paras = []
        for p in paras_raw:
            t = clean_text(p)
            if t and len(t) > 20:
                paras.append(t)

        imgs_raw = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', text, re.I)
        imgs = [i for i in imgs_raw if i.strip()][:12]

        parts = f.name.replace('.html', '').split('__')
        slug = parts[1] if len(parts) >= 2 else f.stem

        pages[slug] = {
            'file': str(f.relative_to(root)).replace('\\', '/'),
            'title': title,
            'meta_description': meta,
            'headings': headings,
            'paragraphs': paras,
            'images': imgs,
        }

    out = {'generated_from': str(archive_dir), 'pages': pages}
    out_file.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Wix content extracted to {out_file}')


if __name__ == '__main__':
    main()
