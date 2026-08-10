# Apify Results Analysis Guide

## Where To Put Exported Results

After the Apify 100-site run finishes, export the Dataset as either JSONL or JSON.

Recommended paths:

- JSONL export: `outputs/batch-test-100/results.jsonl`
- JSON export: `outputs/batch-test-100/results.json`

Create the directory if needed:

```bash
mkdir -p outputs/batch-test-100
```

## Analyze JSONL Export

```bash
npm run analyze:results -- --input outputs/batch-test-100/results.jsonl --output outputs/batch-test-100/decision-summary.md
```

## Analyze JSON Export

```bash
npm run analyze:results -- --input outputs/batch-test-100/results.json --output outputs/batch-test-100/decision-summary.md
```

## Review Output

Open:

- `outputs/batch-test-100/decision-summary.md`
- `outputs/100_SITE_TEST_REPORT_TEMPLATE.md`

## Launch Gate

Do not submit to Apify Store until:

- Success rate is at least 90%.
- At least 20 rows are manually spot-checked.
- Emails are public business contacts.
- Phone numbers are not mostly dates, IDs, or tracking strings.
- LinkedIn links are company pages.
- Error samples are explainable.
