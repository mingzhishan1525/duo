# 100-Site Validation Report

## Test Setup

- Date:
- Environment: Apify Console / local server / other
- Actor version: `v0.1.1`
- Input list: `work/test-sites-100.txt`
- `maxPagesPerDomain`:
- `maxConcurrency`:
- `respectRobotsTxt`:

## Summary Metrics

Paste the contents of `outputs/batch-test/summary.json` here.

```json
{}
```

## Manual Spot Check

Review at least 20 rows from `results.jsonl`.

| Check | Pass/Fail | Notes |
| --- | --- | --- |
| Public company sites only |  |  |
| Company names look reasonable |  |  |
| Emails are public business contacts |  |  |
| No obvious asset/placeholder emails |  |  |
| Phone numbers are not mostly dates or IDs |  |  |
| LinkedIn links are company pages |  |  |
| Errors are explainable |  |  |

## Common Failure Modes

- DNS failure:
- Candidate contact/about page 404:
- robots.txt disallowed:
- Non-HTML content:
- Timeout:
- JavaScript-rendered content:
- Unusual website language/path:

## Store Decision

- PASS / REVISE / BLOCK

Decision notes:

## Pricing Notes

- Estimated pages fetched:
- Estimated cost per 1,000 websites:
- Proposed price:
- Expected gross margin:
