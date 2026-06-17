#!/usr/bin/env python3
import os
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
APP_JS = ROOT / 'src' / 'app.js'
INDEX_URL = 'http://localhost:4173'

checks = [
    'audioPlayer',
    'audioDock',
    'queueList',
    'media-add-queue',
    'addToQueue',
    'playNext',
    'playPrev',
    'dockPrev',
    'dockNext',
]

def check_source():
    found = {}
    text = APP_JS.read_text(encoding='utf-8')
    for c in checks:
        found[c] = c in text
    return found

def fetch_index():
    try:
        with urllib.request.urlopen(INDEX_URL, timeout=5) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            return True, html[:8000]
    except Exception as e:
        return False, str(e)

def main():
    print('QA Player Check')
    src_checks = check_source()
    for k, v in src_checks.items():
        print(f'{k}: {"OK" if v else "MISSING"}')
    ok, content = fetch_index()
    if ok:
        print('\nIndex fetched from localhost:4173 (truncated):')
        if '/src/app.js' in content:
            print('Index includes script /src/app.js -> OK')
        else:
            print('Script tag not found in served index HTML')
    else:
        print('\nFailed to fetch index:', content)

if __name__ == "__main__":
    main()
