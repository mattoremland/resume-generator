# Content Schema

Every application JSON file must follow this structure. The generator reads these fields to produce the resume and cover letter. Fields marked `optional` can be omitted entirely — the generator will skip that section.

---

## Top-Level Structure

```json
{
  "metadata": { ... },
  "header": { ... },
  "summary": "...",
  "experience": [ ... ],
  "education": [ ... ],
  "skills": [ ... ],
  "presentations": [ ... ],
  "cover_letter": { ... }
}
```

---

## metadata
Used for tracking and file naming. Not rendered on the resume.

```json
{
  "target_company": "Company Name",
  "target_role": "Job Title",
  "date_applied": "2026-02-01",
  "status": "applied",
  "notes": "Optional free-text notes about this application"
}
```

- `status` — one of: `draft`, `applied`, `interview`, `offer`, `rejected`, `closed`
- `notes` — optional, anything you want to remember about this application

---

## header
Contact info and the target title displayed at the top of the resume.

```json
{
  "name": "Matt Oremland, PhD",
  "target_title": "Senior Data Scientist",
  "email": "mattoremland@gmail.com",
  "phone": "(518) 560-1473",
  "location": "Saratoga Springs, NY 12866",
  "linkedin": "https://www.linkedin.com/in/matthew-oremland-31a312101"
}
```

- `target_title` — changes per application. This is what appears below your name. It should NOT match the job description exactly, but it should be similar to it.

---

## summary
A 3-4 sentence professional summary, rewritten per job to match the role and keywords from the job description.

```json
"summary": "Detail-oriented data scientist with 10+ years of experience..."
```

- Single string. Write it as a paragraph, not bullet points.
- This is where we do the heaviest ATS keyword targeting.

---

## experience
Ordered list of roles. The generator renders them in the order they appear here, so we control sequencing per application.

```json
[
  {
    "company": "Redica Systems",
    "title": "Senior Director, Data Strategy & Analytics",
    "start": "April 2025",
    "end": "February 2026",
    "location": "Remote",
    "bullets": [
      "Designed and operationalized scalable data models...",
      "Built risk scoring models from scratch..."
    ]
  },
  ...
]
```

- `end` — use `"Present"` for current roles. For the consulting LLC, use the actual end date or `"Present"` if still active.
- `bullets` — list of strings. Each one is a single bullet point on the resume. Write them in past tense (or present for current role). Lead with strong action verbs.
- The consulting LLC entry goes here too — just use the company name as `"Tidal Wave Analytics"` or similar, with title `"Consulting Data Scientist"`.
- Postdoc can be included or omitted depending on the role. If included, use company `"Mathematical Biosciences Institute"` and title `"Postdoctoral Research Fellow"`.

---

## education
List of degrees. Usually just one entry, but structured as a list for flexibility.

```json
[
  {
    "institution": "Virginia Polytechnic Institute & State University",
    "degree": "Doctor of Philosophy (PhD)",
    "field": "Mathematics",
    "year": "2014",
    "details": "Optional — e.g. dissertation topic, relevant coursework"
  }
]
```

- `details` — optional. Only include if relevant to the target role (e.g. for a research-heavy role, mention the dissertation or optimization work).

---

## skills
Grouped list of capability categories. Each category has a label and a list of items. We can add, remove, or reorder categories per application.

```json
[
  {
    "category": "Programming & Platforms",
    "items": ["Python", "SQL", "Snowflake", "Databricks", "Sigma"]
  },
  {
    "category": "Machine Learning & Modeling",
    "items": ["Random Forest", "Ensemble Models", "PLS", "PCA", "Agent-Based Modeling"]
  },
  {
    "category": "Analytics & Visualization",
    "items": ["Spotfire", "Scikit-Learn", "Pandas", "Data Visualization"]
  }
]
```

- Categories and items are fully configurable per application. Swap in whatever matches the job description.
- The generator will render these as grouped rows or a clean list depending on the layout style we build.

---

## presentations
`optional` — include only for roles where thought leadership or external visibility matters.

```json
[
  {
    "event": "CHPA Annual Conference",
    "year": "2024",
    "type": "solo",
    "description": "Panel discussion on predictive quality analytics in pharma"
  },
  {
    "event": "ISPE Conference",
    "year": "2024",
    "type": "co-presented",
    "description": "Advanced analytics for regulatory intelligence"
  }
]
```

- `type` — one of: `solo`, `co-presented`, `authored` (for content you wrote but someone else presented)

---

## publications
`optional` — include for roles where research output or academic credibility matters.

```json
[
  {
    "title": "Optimization and control of agent-based models in biology: a perspective",
    "journal": "Bulletin of Mathematical Biology",
    "year": "2017",
    "note": "Optional — e.g. 'Textbook chapter' or 'Lead author'"
  }
]
```

- `note` — optional. Use for anything worth flagging, like textbook chapters or first/lead authorship.
- Listed in reverse chronological order by default.

---

## cover_letter
`optional` — include when the application calls for one.

```json
{
  "opening": "A sentence or two expressing interest in the role and company.",
  "body": [
    "First paragraph — why you're a strong fit technically.",
    "Second paragraph — why you're excited about this company/role specifically.",
    "Third paragraph — optional, any additional angle worth making."
  ],
  "closing": "A sentence or two wrapping up and expressing interest in discussing further."
}
```

- The generator handles the formatting (date, your address, their address, sign-off). You just write the content.
- `body` is a list of paragraphs — each string becomes its own paragraph. Usually 2-3.

---

## Example: Minimal Valid File

```json
{
  "metadata": {
    "target_company": "Acme Corp",
    "target_role": "Data Scientist",
    "date_applied": "2026-02-01",
    "status": "draft"
  },
  "header": {
    "name": "Matt Oremland, PhD",
    "target_title": "Data Scientist",
    "email": "mattoremland@gmail.com",
    "phone": "(518) 560-1473",
    "location": "Saratoga Springs, NY 12866",
    "linkedin": "https://www.linkedin.com/in/matthew-oremland-31a312101"
  },
  "summary": "...",
  "experience": [],
  "education": [],
  "skills": []
}
```

Only `metadata`, `header`, `summary`, `experience`, `education`, and `skills` are required. Everything else is optional.
