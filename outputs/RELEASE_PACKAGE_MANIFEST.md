# Release Package Manifest

Repository: https://github.com/mingzhishan1525/duo

Apify build ref: `v0.1.1`

Keep `v0.1.1` immutable for reproducible private testing.

## Include

- `.actor/actor.json`
- `.actor/input_schema.json`
- `.actor/dataset_schema.json`
- `.apifyignore`
- `.dockerignore`
- `.gitignore`
- `.npmignore`
- `.github/workflows/ci.yml`
- `.github/ISSUE_TEMPLATE/apify-validation.md`
- `.github/ISSUE_TEMPLATE/data-quality-bug.md`
- `.github/ISSUE_TEMPLATE/feature-request.md`
- `Dockerfile`
- `README.md`
- `package.json`
- `package-lock.json`
- `src/`
- `scripts/`
- `test/`
- `work/test-sites.txt`
- `work/test-sites-100.txt`
- `outputs/100_SITE_TEST_REPORT_TEMPLATE.md`
- `outputs/AI_CTO_REVIEW.md`
- `outputs/APIFY_CONSOLE_RUNBOOK.md`
- `outputs/APIFY_BUILD_HANDOFF_V0.1.1.md`
- `outputs/APIFY_STORE_LISTING_DRAFT.md`
- `outputs/APIFY_STORE_SUBMISSION_COPY.md`
- `outputs/PUBLISH_CHECKLIST.md`
- `outputs/FINAL_PUBLISH_READINESS.md`
- `outputs/NEXT_ACTIONS_APIFY_V0.1.1.md`
- `outputs/APIFY_RESULTS_ANALYSIS_GUIDE.md`
- `outputs/APIFY_CLI_FALLBACK.md`
- `outputs/RELEASE_NOTES_V0.1.md`
- `outputs/RELEASE_NOTES_V0.1.1.md`

## Exclude

- `node_modules/`
- `storage/`
- `work/mock-site/`
- `outputs/batch-test/`
- `outputs/batch-test-100/`

## Reason

The release package should contain source code, schemas, validation tooling, and publishing materials. It should not include installed dependencies, local Apify storage, local mock servers, or environment-specific batch outputs.
