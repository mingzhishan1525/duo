# Next Actions: Apify v0.1.1

## 1. Build

- Open Apify Console.
- Create a new Actor.
- Connect GitHub repository: https://github.com/mingzhishan1525/duo
- Select build ref: `v0.1.1`
- Confirm Actor config: `.actor/actor.json`
- Build the Actor.

## 2. Smoke Run

- Use input file: `outputs/apify-smoke-input-v0.1.1.json`
- Confirm the run completes.
- Confirm Dataset has one item per input domain.
- Confirm `sourcePages` is populated for at least one domain.

## 3. 100-Site Run

- Use input file: `outputs/apify-input-100.json`
- Run with `maxPagesPerDomain = 5`, `maxConcurrency = 5`, `respectRobotsTxt = true`.
- Export Dataset as JSONL or JSON.

## 4. Analyze

```bash
npm run analyze:results -- --input outputs/batch-test-100/results.jsonl --output outputs/batch-test-100/decision-summary.md
```

## 5. Decide

- PASS: submit to Store.
- REVISE: fix data-quality/runtime issues.
- BLOCK: do not publish due to compliance, stability, or output-quality risk.

Tracking issue: https://github.com/mingzhishan1525/duo/issues/1
