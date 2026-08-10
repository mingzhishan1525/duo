# AI CTO Review: Website Contact Intelligence Actor

Review mode: standard.

## Verdict

REVISE before Apify Store submission, but the MVP implementation is directionally sound.

The project matches the intended positioning: a lightweight B2B data organization Actor that extracts public company contact information from public websites using Node.js, Apify SDK, Axios, and Cheerio. It avoids the disallowed surfaces: no Playwright, no browser automation, no login flow, no email sending, no CRM, no lead scoring, and no AI analysis.

## Evidence Inspected

- Product and scope: `README.md`
- Apify metadata: `.actor/actor.json`
- Input schema: `.actor/input_schema.json`
- Dataset schema: `.actor/dataset_schema.json`
- Actor entry point: `src/main.js`
- Extraction logic: `src/extractor.js`
- Tests: `test/extractor.test.js`
- Batch validation tool: `scripts/batch-test.js`
- Apify input generator: `scripts/make-apify-input.js`
- Result analyzer: `scripts/analyze-results.js`
- Store listing draft: `outputs/APIFY_STORE_LISTING_DRAFT.md`
- Publish checklist: `outputs/PUBLISH_CHECKLIST.md`
- 100-site report template: `outputs/100_SITE_TEST_REPORT_TEMPLATE.md`
- Apify Console runbook: `outputs/APIFY_CONSOLE_RUNBOOK.md`
- Commands run:
  - `npm install`
  - `npm test`
  - `npm run batch:test -- --input work/test-sites.txt --outputDir outputs/batch-test --maxPagesPerDomain 2 --maxConcurrency 2 --respectRobotsTxt true`
  - `npm run make:apify-input -- --input work/test-sites-100.txt --output outputs/apify-input-100.json`
  - `npm run analyze:results -- --input outputs/batch-test/results.jsonl --output outputs/batch-test/decision-summary.md`
  - `npm start`
  - `npm audit --audit-level=high`

## Verification Results

- `npm install`: passed, 0 vulnerabilities reported by npm audit.
- `npm test`: passed, 5 tests passing.
- `npm run batch:test`: passed as a script execution and wrote `outputs/batch-test/results.jsonl` plus `outputs/batch-test/summary.json`.
- `npm run make:apify-input`: passed and wrote `outputs/apify-input-100.json` with 100 URLs.
- `npm run analyze:results`: passed and wrote `outputs/batch-test/decision-summary.md`.
- `npm audit --audit-level=high`: passed, 0 vulnerabilities.
- Local Actor startup: passed, exited with code 0 and wrote a Dataset item.
- External website fetch: not fully verified in this sandbox because DNS/network access is inconsistent and restricted.
- Localhost HTTP fetch: not verified because this sandbox blocks the Actor process from connecting to `127.0.0.1`.
- Apify Console run: not executed from this environment.
- 100-site batch test: not executed from this environment.

The Apify/Crawlee runtime printed `Memory snapshot failed: spawn EPERM` in this sandbox. That is an environment permission warning, not an observed Actor logic failure.

## Apify Store Readiness

Status: not ready for Store listing yet.

The MVP has the right shape, but Store submission should wait until three checks are completed in an Apify environment:

1. Run against at least 100 mixed public company websites.
2. Measure extraction precision for emails, phones, social links, and company names.
3. Confirm `.actor/dataset_schema.json` renders correctly in the Apify Dataset UI.

Recommended listing claim:

Extract public business contact details and basic company information from public company websites.

Avoid claims around lead generation, personal email discovery, automated outreach, enrichment accuracy, or guaranteed contact coverage.

A Store listing draft now exists at `outputs/APIFY_STORE_LISTING_DRAFT.md`.

## Data Quality

Strengths:

- Deduplicates emails, phones, contact pages, and source pages.
- Keeps source pages for auditability.
- Separates metadata, contacts, social links, and about text.
- Restricts LinkedIn extraction to company pages.
- Includes a batch validation script for coverage and error metrics.
- Respects `robots.txt` by default.
- Provides explicit Dataset field descriptions and a 100-site report template.

Risks:

- Phone extraction is regex-based. Date-like false positives are now filtered, but manual spot checks are still needed before Store launch.
- Company name inference is heuristic and may fail on generic SEO titles.
- Contact page discovery covers common English paths only.
- JavaScript-rendered websites are intentionally unsupported in Phase 1.

Smallest next improvement:

Run the batch script with a real 100-site list in Apify or another network-enabled environment, then add precision notes and common failure examples before publishing.

## Cost

Cost profile is favorable.

The Actor uses Axios HTTP requests and Cheerio parsing only. It does not launch browsers and should normally need no proxy for public company websites. With `maxPagesPerDomain = 5`, 1,000 websites should produce roughly 1,000 to 5,000 HTTP requests depending on discovered pages and failures.

Pricing recommendation:

- Start with pay-per-event pricing.
- Suggested anchor: 1,000 websites for $5.
- Add monthly bundles only after observing repeat usage.

## Compliance Risk

Risk level: moderate but manageable.

The README and implementation correctly avoid email sending, login scraping, cookie sessions, browser automation, and private social account discovery. The Actor now respects `robots.txt` by default. The product should continue to frame itself as public website contact intelligence for B2B data organization.

Before Store launch, add:

- Final acceptable-use wording in the live Apify Store description.
- 100-site validation evidence from Apify Console or another network-enabled environment.
- Manual spot-check notes for email and phone false positives.

## Commercial Potential

Commercial potential is good for a first paid Actor because value is easy to test:

- Inputs are simple.
- Output maps directly to CRM cleanup, market research, n8n, and AI Agent workflows.
- Costs are low.
- It pairs naturally with Shopify merchant discovery and future Revenue Agent workflows.

The strongest wedge is not "email extraction"; it is "public website contact intelligence as a data layer for B2B automation."

## Final CTO Recommendation

Proceed with MVP completion and private testing.

Do not publish to Apify Store until the 100-site batch test and Apify Console run are complete. After that, publish as a narrow public-business-contact Actor with pay-per-event pricing.
