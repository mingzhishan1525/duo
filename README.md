# Website Contact Intelligence

`website-contact-extractor` is an Apify Actor for extracting public business contact information and basic company metadata from public company websites.

It is positioned as a B2B data organization tool for market research, CRM data cleanup, AI Agent workflows, and n8n automation. It is not an email sending tool, not a private email scraper, and does not use browser automation, login, cookies, or Playwright.

## What It Does

- Visits each provided company website homepage.
- Extracts title, meta description, and inferred company name.
- Discovers common public pages such as `/contact`, `/contact-us`, `/about`, `/about-us`, and `/team`.
- Extracts public business emails, phone numbers, LinkedIn company pages, Twitter/X, Facebook, and Instagram links.
- Deduplicates collected values.
- Saves one JSON item per domain to the Apify Dataset.

## Input

```json
{
  "startUrls": [
    {
      "url": "https://example.com"
    }
  ],
  "maxPagesPerDomain": 5,
  "maxConcurrency": 5,
  "respectRobotsTxt": true
}
```

## Output

```json
{
  "domain": "example.com",
  "companyName": "",
  "title": "",
  "metaDescription": "",
  "emails": ["contact@example.com"],
  "phoneNumbers": [],
  "contactPages": ["/contact"],
  "socialLinks": {
    "linkedin": "",
    "twitter": "",
    "facebook": "",
    "instagram": ""
  },
  "aboutText": "",
  "sourcePages": [],
  "timestamp": "2026-08-10T00:00:00.000Z",
  "errors": []
}
```

## Local Run

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run a batch quality test:

```bash
npm run batch:test -- --input work/test-sites.txt --outputDir outputs/batch-test --maxPagesPerDomain 5 --maxConcurrency 5 --respectRobotsTxt true
```

Create a 100-site Apify Console input file:

```bash
npm run make:apify-input -- --input work/test-sites-100.txt --output outputs/apify-input-100.json
```

Run locally with Apify storage:

```bash
mkdir -p storage/key_value_stores/default
cat > storage/key_value_stores/default/INPUT.json <<'JSON'
{
  "startUrls": [
    {
      "url": "https://example.com"
    }
  ],
  "maxPagesPerDomain": 5,
  "maxConcurrency": 5,
  "respectRobotsTxt": true
}
JSON
npm start
```

Dataset output will be stored under `storage/datasets/default/`.

## 100-Site Validation

Before publishing to Apify Store, run the included 100-site validation list or replace it with your own target-market sample:

```bash
npm run batch:test -- --input work/test-sites-100.txt --outputDir outputs/batch-test-100 --maxPagesPerDomain 5 --maxConcurrency 5 --respectRobotsTxt true
```

Review:

- `outputs/batch-test-100/results.jsonl`: one output item per website
- `outputs/batch-test-100/summary.json`: success rate, coverage, error, and source-page metrics
- `outputs/100_SITE_TEST_REPORT_TEMPLATE.md`: manual review template

Generate a decision summary after a JSONL batch run:

```bash
npm run analyze:results -- --input outputs/batch-test-100/results.jsonl --output outputs/batch-test-100/decision-summary.md
```

Recommended launch gates:

- Actor completes the batch without process crashes.
- At least 90% of websites produce a Dataset item, even if some fields are empty.
- Extraction examples are manually spot-checked for false-positive emails and phones.
- Common failure modes are listed in the Store description.

## Apify Console Run

1. Create a new Actor on Apify.
2. Upload or connect this repository.
3. Confirm the Actor uses `.actor/actor.json`.
4. Build the Actor.
5. Run it with:

```json
{
  "startUrls": [
    {
      "url": "https://example.com"
    }
  ],
  "maxPagesPerDomain": 5,
  "maxConcurrency": 5,
  "respectRobotsTxt": true
}
```

## Store Readiness Notes

Recommended Apify Store positioning:

- Name: Website Contact Intelligence
- Category: B2B data, market research, sales intelligence, automation
- Main promise: Extract public business contact details from company websites
- Explicit exclusions: no email sending, no login scraping, no private social profile scraping, no CRM workflow

Suggested pricing:

- Pay per event: 100 websites for $1, or 1,000 websites for $5
- Package option: Free 50 websites/month, Starter $19 for 5,000 websites/month, Pro $49 for 20,000 websites/month

## Cost Analysis

The Actor uses direct HTTP requests only. It does not start a browser and does not require residential proxies for the normal MVP use case.

Expected cost profile for 1,000 websites:

- Pages fetched: roughly 2,000 to 5,000 if `maxPagesPerDomain` is 5
- Proxy cost: usually 0 for public websites that allow direct HTTP access
- Compute units: low, because parsing is lightweight Cheerio HTML processing
- Main failure modes: blocked HTTP requests, non-HTML pages, timeouts, unusual site structures

This gives the Actor a favorable gross margin if priced by website processed.

## Compliance Boundaries

This Actor is designed for public company websites only. Users should only process websites where collection of public business contact information is lawful for their use case and jurisdiction.

By default, the Actor checks `robots.txt` and skips pages that disallow this Actor user agent. This can reduce coverage on some websites, but it is the recommended setting for the Store version.

The Actor intentionally does not implement:

- Email sending
- Lead scoring
- AI analysis
- CRM sync
- Dashboard
- Login or session handling
- Cookie-based scraping
- Private social account discovery

## Store Listing Draft

A draft Apify Store listing is available at `outputs/APIFY_STORE_LISTING_DRAFT.md`.

## Files

- `.actor/actor.json`: Apify Actor metadata
- `.actor/input_schema.json`: Apify input schema
- `.actor/dataset_schema.json`: Dataset table view schema
- `src/main.js`: Actor entry point
- `src/extractor.js`: HTTP fetching and extraction logic
- `test/extractor.test.js`: Unit tests for extraction and output shaping
- `work/test-sites-100.txt`: 100-site validation list
