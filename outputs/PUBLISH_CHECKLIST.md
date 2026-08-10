# Publish Checklist

## Required Before Apify Store Submission

- Build succeeds in Apify Console.
- Build source is fixed to GitHub tag `v0.1.1`.
- Smoke run follows `outputs/APIFY_CONSOLE_RUNBOOK.md`.
- 100-site input is generated with `npm run make:apify-input`.
- Actor runs in Apify Console with `maxPagesPerDomain = 5`, `maxConcurrency = 5`, and `respectRobotsTxt = true`.
- 100 public company websites are tested with `npm run batch:test -- --input work/test-sites-100.txt --outputDir outputs/batch-test-100 --maxPagesPerDomain 5 --maxConcurrency 5 --respectRobotsTxt true`.
- Exported JSONL is analyzed with `npm run analyze:results`.
- Batch test report is reviewed for success rate, email coverage, phone false positives, social link coverage, and common errors.
- Store description uses the public business contact intelligence positioning.
- Store description excludes email sending, bulk outreach, private email discovery, login scraping, and private social account scraping.
- Store description states that `robots.txt` is respected by default.
- Pricing is configured as pay per event or a small monthly bundle.

## Recommended Launch Gates

- Success rate: at least 90% of websites produce at least one source page.
- Email false positives: no obvious asset, placeholder, or malformed email patterns in a manual spot check.
- Phone false positives: date-like and ID-like values are rare after manual spot check.
- Average source pages: between 1 and 5 per website for the default config.
- Error samples are explainable: DNS failures, 404 candidate pages, non-HTML content, or timeouts.

## First Store Version Scope

Keep the first Store version narrow:

- Public company websites only.
- Direct HTTP fetch only.
- No browser automation.
- No proxies by default.
- No AI enrichment.
- No CRM sync.
- No outreach.

## Post-Launch Metrics

- Runs per week
- Websites processed per run
- Cost per 1,000 websites
- Dataset download rate
- User-reported false positives
- Requests for extra fields or integrations
