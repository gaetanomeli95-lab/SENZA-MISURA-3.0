#!/usr/bin/env python3
import json
import os
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "media-library.json"
OUT_JSON = ROOT / "data" / "media-migration-report.json"
OUT_UPDATED = ROOT / "data" / "media-library-updated.json"
OUT_CSV = ROOT / "reports" / "missing-media.csv"


def load_library():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def check_items(items):
    total = len(items)
    found = 0
    missing = []
    updated = []
    for it in items:
        lp = it.get("localPath") or ""
        expected = ROOT / "public" / lp.lstrip("/")
        exists = expected.exists()
        if exists:
            found += 1
            new_status = it.get("status", "").lower()
            if "migrated" not in new_status:
                new_status = "migrated-local"
            it["status"] = new_status
        else:
            missing.append({
                "title": it.get("title"),
                "localPath": lp,
                "expectedPath": str(expected),
                "sourceUrl": it.get("sourceUrl"),
                "status": it.get("status"),
            })
            new_status = it.get("status", "")
            if "pending" not in new_status and "external" not in new_status:
                it["status"] = "pending-download-or-manual-review"
        updated.append(it)
    return {"total": total, "found": found, "missing_count": len(missing), "missing": missing, "updated_items": updated}


def write_reports(report):
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump({"summary": {"total": report["total"], "found": report["found"], "missing": report["missing_count"]}, "missing": report["missing"]}, f, ensure_ascii=False, indent=2)

    OUT_UPDATED.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_UPDATED, "w", encoding="utf-8") as f:
        json.dump(report["updated_items"], f, ensure_ascii=False, indent=2)

    # CSV for missing
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_CSV, "w", encoding="utf-8", newline="") as csvf:
        writer = csv.DictWriter(csvf, fieldnames=["title", "localPath", "expectedPath", "sourceUrl", "status"])
        writer.writeheader()
        for m in report["missing"]:
            writer.writerow(m)


def main():
    if not DATA_FILE.exists():
        print(f"Data file not found: {DATA_FILE}")
        return
    items = load_library()
    report = check_items(items)
    write_reports(report)
    print(f"Checked {report['total']} items: found={report['found']} missing={report['missing_count']}")
    print(f"Reports written: {OUT_JSON}, {OUT_UPDATED}, {OUT_CSV}")


if __name__ == '__main__':
    main()
