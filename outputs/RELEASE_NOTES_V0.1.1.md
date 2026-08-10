# Release Notes v0.1.1

## Product

Website Contact Intelligence is an Apify Actor for extracting public business contact information and basic company metadata from public company websites.

Repository: https://github.com/mingzhishan1525/duo

## Changes Since v0.1.0

- Added GitHub Actions CI for install, tests, and high-severity npm audit checks.
- Added package dry-run validation to CI.
- Added Apify Store-specific README at `.actor/README.md`.
- Linked `.actor/actor.json` to the Apify README.
- Updated repository metadata and publishing documentation.

## Validation

Verified locally:

- `npm test`
- `npm audit --audit-level=high`

## Recommended Apify Build Ref

Use tag `v0.1.1` for the first Apify Console build candidate.

## Store Status

Private testing candidate.

Do not publish publicly until:

- Apify Console smoke run passes.
- 100-site validation passes.
- Manual spot check confirms acceptable email and phone precision.
