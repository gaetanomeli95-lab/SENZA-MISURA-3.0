#!/usr/bin/env python3
"""
Download Wix images to local storage and create a mapping file for URL rewriting.
Extracts images from data/wix_content.json, downloads them to public/media/wix_images/,
and saves a mapping file for runtime URL substitution.
"""

import json
import os
import requests
import urllib.parse
import hashlib
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
MEDIA_DIR = BASE_DIR / 'public' / 'media' / 'wix_images'
WIX_CONTENT_FILE = DATA_DIR / 'wix_content.json'
MAPPING_FILE = DATA_DIR / 'wix_image_mapping.json'

# Ensure output directory exists
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

def extract_filename_from_url(url: str) -> str:
    """Generate a safe local filename from Wix URL."""
    # Parse the URL and extract the media ID
    parsed = urllib.parse.urlparse(url)
    # Extract the hash/ID before the query params
    parts = parsed.path.split('/')
    if len(parts) > 2:
        media_id = parts[-1]  # e.g., "4f23b2_5c25a8ee5b054bb6a89d005b42f0e969~mv2.png"
        return media_id
    # Fallback: use hash of URL
    return hashlib.md5(url.encode()).hexdigest() + '.jpg'

def download_image(url: str, max_retries: int = 3) -> tuple[bool, str]:
    """
    Download an image from a Wix URL and save it locally.
    Returns (success, local_path_or_error).
    """
    try:
        filename = extract_filename_from_url(url)
        local_path = MEDIA_DIR / filename
        
        # Skip if already downloaded
        if local_path.exists():
            return True, f"/media/wix_images/{filename}"
        
        # Download with retry logic
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
                response.raise_for_status()
                
                # Write to file
                with open(local_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"✓ Downloaded: {filename}")
                return True, f"/media/wix_images/{filename}"
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    raise
                print(f"  Retry {attempt + 1}/{max_retries} for {url}")
    
    except Exception as e:
        print(f"✗ Failed to download {url}: {e}")
        return False, url  # Return original URL as fallback

def main():
    print("Downloading Wix images...")
    
    # Load Wix content
    if not WIX_CONTENT_FILE.exists():
        print(f"Error: {WIX_CONTENT_FILE} not found. Run regenerate_from_wix.py first.")
        return
    
    with open(WIX_CONTENT_FILE, 'r', encoding='utf-8') as f:
        wix_data = json.load(f)
    
    # Collect all unique image URLs
    image_urls = set()
    pages = wix_data.get('pages', {})
    for page_name, page_data in pages.items():
        for img_url in page_data.get('images', []):
            if img_url:
                image_urls.add(img_url)
    
    print(f"Found {len(image_urls)} unique images to download")
    
    # Download and create mapping
    mapping = {}
    succeeded = 0
    failed = 0
    
    for url in sorted(image_urls):
        success, local_path = download_image(url)
        mapping[url] = local_path
        if success:
            succeeded += 1
        else:
            failed += 1
    
    # Save mapping file
    with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults:")
    print(f"  ✓ Downloaded: {succeeded}")
    print(f"  ✗ Failed: {failed}")
    print(f"  Mapping saved to: {MAPPING_FILE}")

if __name__ == '__main__':
    main()
