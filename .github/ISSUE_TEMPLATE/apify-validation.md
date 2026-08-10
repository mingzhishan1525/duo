---
name: Apify validation
about: Track an Apify Console private validation run before Store submission
title: "Apify validation: v0.1.1"
labels: validation, apify
assignees: ""
---

## Build Source

- Repository: https://github.com/mingzhishan1525/duo
- Build ref: `v0.1.1`
- Actor config: `.actor/actor.json`

## Build

- [ ] Actor build succeeds in Apify Console.
- [ ] Build source is fixed to tag `v0.1.1`.
- [ ] Actor metadata and README render correctly.

## Smoke Run

- [ ] Input: `outputs/apify-smoke-input-v0.1.1.json`
- [ ] Run completes without process crash.
- [ ] Dataset has one item per input domain.
- [ ] `sourcePages` is populated for at least one domain.
- [ ] Errors are page-level and explainable.

## 100-Site Validation

- [ ] Input: `outputs/apify-input-100.json`
- [ ] Dataset exported as JSONL or JSON.
- [ ] Results saved under `outputs/batch-test-100/`.
- [ ] Analysis generated with `npm run analyze:results`.

## Launch Gates

- [ ] Success rate is at least 90%.
- [ ] At least 20 records manually spot-checked.
- [ ] Emails are public business contacts.
- [ ] Phone numbers are not mostly dates, IDs, or tracking strings.
- [ ] LinkedIn links are company pages.
- [ ] Errors are explainable.
- [ ] Store positioning remains public business contact intelligence.

## Decision

- [ ] PASS: proceed to Store submission.
- [ ] REVISE: fix data-quality or runtime issues.
- [ ] BLOCK: do not publish due to compliance, stability, or output-quality risk.

## Links

- Handoff: `outputs/APIFY_BUILD_HANDOFF_V0.1.1.md`
- Next actions: `outputs/NEXT_ACTIONS_APIFY_V0.1.1.md`
- Results guide: `outputs/APIFY_RESULTS_ANALYSIS_GUIDE.md`
- Store copy: `outputs/APIFY_STORE_SUBMISSION_COPY.md`
