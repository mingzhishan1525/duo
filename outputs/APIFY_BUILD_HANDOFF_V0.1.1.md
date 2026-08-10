# Apify Build Handoff v0.1.1

## Build Source

- GitHub repository: https://github.com/mingzhishan1525/duo
- Build ref: `v0.1.1`
- Actor config: `.actor/actor.json`
- Actor name: `website-contact-extractor`
- Product name: Website Contact Intelligence

Use `v0.1.1` for the first private validation run. Do not use `main` for this run.

## Smoke Run Input

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

## Smoke Run Pass Criteria

- Actor build succeeds.
- Run completes without process crash.
- Dataset has one item per input domain.
- `sourcePages` is populated for at least one domain.
- Errors are page-level and explainable.
- Output does not suggest private contact discovery or outreach behavior.

## 100-Site Validation

Use `outputs/apify-input-100.json` or regenerate it with:

```bash
npm run make:apify-input -- --input work/test-sites-100.txt --output outputs/apify-input-100.json
```

After the Apify run, export Dataset as JSONL and analyze it locally:

```bash
npm run analyze:results -- --input outputs/batch-test-100/results.jsonl --output outputs/batch-test-100/decision-summary.md
```

## Store Decision Gates

- Success rate is at least 90%.
- At least 20 rows are manually spot-checked.
- Emails are public business contacts.
- Phone numbers are not mostly dates, IDs, or tracking strings.
- LinkedIn links are company pages.
- Store positioning remains public business contact intelligence.

## Tracking

- GitHub issue: https://github.com/mingzhishan1525/duo/issues/1
- Release notes: `outputs/RELEASE_NOTES_V0.1.1.md`
- Store listing draft: `outputs/APIFY_STORE_LISTING_DRAFT.md`
