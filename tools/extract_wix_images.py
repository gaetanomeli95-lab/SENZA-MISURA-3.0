"""Extract real images from the original Wix site."""
import re, urllib.request, os, json, time
from pathlib import Path

ROOT = Path(r"E:\SENZA_MISURA_REBORN")
OUT_DIR = ROOT / "public" / "media" / "images" / "real"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PAGES = [
    "https://adoratore.wixsite.com/senzamisura",
    "https://adoratore.wixsite.com/senzamisura/giubileo",
    "https://adoratore.wixsite.com/senzamisura/network",
    "https://adoratore.wixsite.com/senzamisura/cuoreafrica",
    "https://adoratore.wixsite.com/senzamisura/musica",
    "https://adoratore.wixsite.com/senzamisura/ichurch",
    "https://adoratore.wixsite.com/senzamisura/predicazioni",
    "https://adoratore.wixsite.com/senzamisura/contatti",
]

IMG_RE = re.compile(r'src\s*=\s*"([^"]+\.(?:jpg|jpeg|png|webp|gif))"', re.IGNORECASE)
WIX_STATIC = re.compile(r'static\.wixstatic\.com|wix\.com|\.filesusr\.com', re.IGNORECASE)

found = set()
for url in PAGES:
    print(f"Fetching {url}...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  skip: {e}")
        continue
    for m in IMG_RE.finditer(html):
        img_url = m.group(1)
        # Normalize relative URLs
        if img_url.startswith("//"):
            img_url = "https:" + img_url
        elif img_url.startswith("/"):
            img_url = "https://adoratore.wixsite.com" + img_url
        # Keep only real hosted images (skip tiny icons / placeholders)
        if WIX_STATIC.search(img_url) or img_url.startswith("http"):
            found.add(img_url)
    time.sleep(0.6)

print(f"\nFound {len(found)} image URLs.\n")

# Download each unique image
downloaded = []
for img_url in sorted(found):
    name = img_url.split("/")[-1].split("?")[0]
    if not name or len(name) < 3:
        name = f"img_{hash(img_url) & 0xFFFFFFFF}.jpg"
    target = OUT_DIR / name
    if target.exists():
        downloaded.append({"url": img_url, "file": str(target.relative_to(ROOT)), "status": "cached"})
        print(f"  cached {name}")
        continue
    try:
        req = urllib.request.Request(img_url, headers={"User-Agent":"Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            if len(data) < 1024:
                print(f"  skip tiny {name}")
                continue
            target.write_bytes(data)
            downloaded.append({"url": img_url, "file": str(target.relative_to(ROOT)), "status": "downloaded", "size": len(data)})
            print(f"  saved {name} ({len(data)} bytes)")
    except Exception as e:
        print(f"  ERROR {name}: {e}")
    time.sleep(0.4)

report = ROOT / "data" / "extracted-images.json"
report.write_text(json.dumps(downloaded, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\nDone. {len(downloaded)} images. Report: {report}")
