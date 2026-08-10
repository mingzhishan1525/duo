# Apify Console Runbook

## Goal

Run Website Contact Intelligence in Apify Console and collect enough evidence for a Store publishing decision.

## Build

1. Create a new Apify Actor.
2. Connect or upload `https://github.com/mingzhishan1525/duo`.
3. Confirm the Actor config points to `.actor/actor.json`.
4. Build the Actor.

## Smoke Run

Use this input first:

```json
{
  "startUrls": [
    {
      "url": "https://www.apify.com"
    },
    {
      "url": "https://www.shopify.com"
    },
    {
      "url": "https://www.stripe.com"
    }
  ],
  "maxPagesPerDomain": 5,
  "maxConcurrency": 3,
  "respectRobotsTxt": true
}
```

Expected result:

- Run completes without Actor crash.
- Dataset has one item per input domain.
- `sourcePages` is populated for at least some domains.
- Errors, if present, are page-level and explainable.

## 100-Site Run

Generate the full input file:

```bash
npm run make:apify-input -- --input work/test-sites-100.txt --output outputs/apify-input-100.json
```

Use the generated JSON from `outputs/apify-input-100.json`.

Recommended input:

```json
{
  "startUrls": [
    {
      "url": "https://www.apify.com"
    }
  ],
  "maxPagesPerDomain": 5,
  "maxConcurrency": 5,
  "respectRobotsTxt": true
}
```

Replace `startUrls` with the full list from `outputs/apify-input-100.json`.

## Dataset Review

Check:

- `domain`: normalized and non-empty
- `companyName`: reasonable for known brands
- `emails`: public business contacts, no obvious placeholder or asset strings
- `phoneNumbers`: no obvious date/id false positives
- `socialLinks.linkedin`: company pages only
- `sourcePages`: shows which pages were inspected
- `errors`: explainable and not the dominant output

## Export

Export Dataset as JSON or JSONL, then fill:

- `outputs/100_SITE_TEST_REPORT_TEMPLATE.md`
- `outputs/AI_CTO_REVIEW.md` final verdict section

If exported as JSONL, run:

```bash
npm run analyze:results -- --input outputs/batch-test-100/results.jsonl --output outputs/batch-test-100/decision-summary.md
```

## Publish Decision

PASS when:

- 100-site run completes.
- Success rate is at least 90%.
- Manual spot check does not show serious false-positive patterns.
- Store listing keeps the product positioned as public business contact intelligence.

REVISE when:

- Phone false positives are common.
- Too many websites fail due to robots or HTTP blocking.
- Contact page discovery misses obvious contact pages.

BLOCK when:

- Actor crashes on normal public websites.
- Dataset schema does not render correctly.
- Output suggests private or non-public contact collection.
