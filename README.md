# Resume Generator

A Python-based system for generating ATS-optimized resumes and cover letters as DOCX and PDF files.

## How It Works

1. Each job application gets its own JSON content file in `applications/`
2. Run `generator.py` with that JSON file as input
3. It outputs a DOCX and PDF to `output/` and logs the application in `tracker.csv`

## Folder Structure

- `generator.py` — The formatting engine (builds the documents)
- `schema.md` — Documents the JSON structure all content files must follow
- `templates/` — Blank JSON templates to copy when starting a new application
- `applications/` — One JSON file per job, named `YYYY-MM-DD_company_role.json`
- `output/` — Generated DOCX and PDF files
- `tracker.csv` — Auto-updated log of all applications

## Usage

```bash
python generator.py applications/2026-01-31_company-name_role.json
```

This will generate the resume and cover letter, save them to `output/`, and append a row to `tracker.csv`.
