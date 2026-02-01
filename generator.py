#!/usr/bin/env python3
"""
generator.py — Resume & Cover Letter Generator

Usage:
    python generator.py applications/2026-02-01_company_role.json

This script:
1. Calls generate_resume.js to produce the DOCX
2. Converts DOCX to PDF using LibreOffice
3. Appends a row to tracker.csv
"""

import subprocess
import sys
import json
import csv
import os
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent


def run_js_generator(json_path: str) -> dict:
    """Run the Node.js generator and parse its JSON output."""
    js_script = SCRIPT_DIR / "generate_resume.js"
    result = subprocess.run(
        ["node", str(js_script), json_path],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        print("JS Generator stderr:", result.stderr)
        sys.exit(1)

    # The JS script prints status lines and then a JSON object on the last line
    lines = result.stdout.strip().split("\n")
    for line in lines:
        if not line.startswith("{"):
            print(line)  # Print status messages (e.g. "✓ DOCX written: ...")

    # Parse the JSON output (last line)
    try:
        output_info = json.loads(lines[-1])
    except json.JSONDecodeError:
        print("Error: Could not parse JS generator output.")
        print("Full stdout:", result.stdout)
        sys.exit(1)

    return output_info


def convert_to_pdf(docx_path: str) -> str:
    """Convert DOCX to PDF using LibreOffice headless mode."""
    output_dir = os.path.dirname(docx_path)
    result = subprocess.run(
        ["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", output_dir, docx_path],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        print("LibreOffice conversion error:", result.stderr)
        print("stdout:", result.stdout)
        sys.exit(1)

    # PDF path is the same as DOCX but with .pdf extension
    pdf_path = docx_path.replace(".docx", ".pdf")
    if not os.path.exists(pdf_path):
        print(f"Error: PDF was not created at {pdf_path}")
        sys.exit(1)

    print(f"✓ PDF written: {pdf_path}")
    return pdf_path


def update_tracker(data: dict, docx_path: str, pdf_path: str):
    """Append a row to tracker.csv."""
    tracker_path = SCRIPT_DIR / "tracker.csv"

    # Read existing content to check if header exists
    file_exists = tracker_path.exists() and tracker_path.stat().st_size > 0

    row = {
        "date": data["metadata"].get("date_applied", datetime.now().strftime("%Y-%m-%d")),
        "company": data["metadata"].get("target_company", ""),
        "role": data["metadata"].get("target_role", ""),
        "status": data["metadata"].get("status", "draft"),
        "resume_file": os.path.basename(docx_path),
        "cover_letter_file": "yes" if (data.get("cover_letter") and data["cover_letter"].get("opening")) else "no",
        "notes": data["metadata"].get("notes", "")
    }

    with open(tracker_path, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=row.keys())
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)

    print(f"✓ Tracker updated: {tracker_path}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python generator.py <path-to-application.json>")
        print("Example: python generator.py applications/2026-02-01_company_role.json")
        sys.exit(1)

    json_path = sys.argv[1]

    # Resolve to absolute path
    if not os.path.isabs(json_path):
        json_path = str(SCRIPT_DIR / json_path)

    if not os.path.exists(json_path):
        print(f"Error: File not found: {json_path}")
        sys.exit(1)

    print(f"\n📄 Generating resume from: {json_path}\n")

    # Load the JSON for tracker update
    with open(json_path) as f:
        data = json.load(f)

    # Step 1: Generate DOCX
    output_info = run_js_generator(json_path)
    docx_path = output_info["docx"]

    # Step 2: Convert to PDF
    pdf_path = convert_to_pdf(docx_path)

    # Step 3: Update tracker
    update_tracker(data, docx_path, pdf_path)

    print(f"\n✅ Done! Files are in: {output_info['outputDir']}\n")


if __name__ == "__main__":
    main()
