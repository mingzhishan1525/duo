# Release Notes v0.1

## Product

Website Contact Intelligence is an Apify Actor for extracting public business contact information and basic company metadata from public company websites.

## Included

- Node.js Apify Actor using Apify SDK, Axios, Cheerio, and robots-parser.
- Public homepage fetch.
- Contact/about/team page discovery.
- Public email extraction.
- Likely business phone extraction with date-like false-positive filtering.
- LinkedIn company page, Twitter/X, Facebook, and Instagram link extraction.
- Company name, title, meta description, about text, source pages, timestamp, and per-page errors.
- Dataset schema and input schema.
- `robots.txt` respected by default.
- Conservative website-level concurrency control.
- Batch validation CLI.
- Apify Console input generator.
- JSONL result analyzer.
- 100-site validation list and report template.
- Apify Store listing draft and publish checklist.

## Excluded By Design

- Email sending
- Bulk outreach
- Private email discovery
- Private social account scraping
- Login or cookie-based scraping
- Playwright or browser automation
- CRM sync
- Lead scoring
- AI enrichment
- Dashboard

## Validation

Verified locally:

- `npm install`
- `npm test`
- `npm run batch:test`
- `npm run make:apify-input`
- `npm run analyze:results`
- `npm start`
- `npm audit --audit-level=high`

Known limitation:

- This local sandbox has restricted DNS/network behavior, so Apify Console and 100-site validation must be performed in Apify or another network-enabled environment.

## Store Status

Private testing candidate.

Do not publish publicly until:

- Apify Console smoke run passes.
- 100-site validation passes.
- Manual spot check confirms acceptable email and phone precision.
