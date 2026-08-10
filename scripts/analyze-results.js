import fs from 'node:fs/promises';

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.input ?? 'outputs/batch-test-100/results.jsonl';
  const outputPath = args.output ?? 'outputs/batch-test-100/decision-summary.md';

  const records = await readDatasetExport(inputPath);
  const summary = summarize(records);
  const markdown = renderMarkdown(summary);

  await fs.writeFile(outputPath, markdown);
  console.log(`Wrote ${outputPath}`);
}

export function summarize(records) {
  const totalSites = records.length;
  const successfulSites = records.filter((item) => item.sourcePages?.length).length;
  const sitesWithEmails = records.filter((item) => item.emails?.length).length;
  const sitesWithPhones = records.filter((item) => item.phoneNumbers?.length).length;
  const sitesWithSocialLinks = records.filter((item) => Object.values(item.socialLinks ?? {}).some(Boolean)).length;
  const sitesWithErrors = records.filter((item) => item.errors?.length).length;
  const totalErrors = records.reduce((sum, item) => sum + (item.errors?.length ?? 0), 0);
  const totalSourcePages = records.reduce((sum, item) => sum + (item.sourcePages?.length ?? 0), 0);
  const errorSamples = records.flatMap((item) =>
    (item.errors ?? []).map((error) => ({
      domain: item.domain,
      url: error.url,
      message: error.message,
    })),
  ).slice(0, 20);

  return {
    totalSites,
    successfulSites,
    successRate: ratio(successfulSites, totalSites),
    emailCoverage: ratio(sitesWithEmails, totalSites),
    phoneCoverage: ratio(sitesWithPhones, totalSites),
    socialCoverage: ratio(sitesWithSocialLinks, totalSites),
    sitesWithErrors,
    totalErrors,
    averageSourcePages: ratio(totalSourcePages, totalSites),
    errorSamples,
    verdict: decide({
      totalSites,
      successRate: ratio(successfulSites, totalSites),
    }),
  };
}

export function decide(summary) {
  if (summary.totalSites < 100) return 'REVISE: run the full 100-site validation before Store submission.';
  if (summary.successRate < 0.9) return 'REVISE: success rate is below the 90% launch gate.';
  return 'PASS CANDIDATE: proceed to manual spot check before Store submission.';
}

export function renderMarkdown(summary) {
  const errors = summary.errorSamples
    .map((error) => `| ${error.domain} | ${error.url} | ${error.message.replaceAll('|', '\\|')} |`)
    .join('\n');

  return `# Batch Test Decision Summary

## Verdict

${summary.verdict}

## Metrics

| Metric | Value |
| --- | ---: |
| Total sites | ${summary.totalSites} |
| Successful sites | ${summary.successfulSites} |
| Success rate | ${formatPercent(summary.successRate)} |
| Email coverage | ${formatPercent(summary.emailCoverage)} |
| Phone coverage | ${formatPercent(summary.phoneCoverage)} |
| Social coverage | ${formatPercent(summary.socialCoverage)} |
| Sites with errors | ${summary.sitesWithErrors} |
| Total page errors | ${summary.totalErrors} |
| Average source pages | ${summary.averageSourcePages} |

## Error Samples

| Domain | URL | Message |
| --- | --- | --- |
${errors || '|  |  |  |'}

## Manual Review Required

- Spot-check at least 20 records.
- Confirm emails are public business contacts.
- Confirm phone numbers are not mostly dates, IDs, or tracking strings.
- Confirm LinkedIn links are company pages.
- Confirm errors are explainable and do not dominate the run.
`;
}

export async function readDatasetExport(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return parseDatasetExport(content);
}

export function parseDatasetExport(content) {
  const trimmed = content.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) throw new Error('JSON export must be an array of Dataset items.');
    return parsed;
  }

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function parseArgs(values) {
  const parsed = {};
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (!value.startsWith('--')) continue;
    parsed[value.slice(2)] = values[i + 1];
    i += 1;
  }
  return parsed;
}

function ratio(numerator, denominator) {
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(4));
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}
