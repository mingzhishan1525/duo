import fs from 'node:fs/promises';
import path from 'node:path';
import { extractWebsiteContactIntelligence } from '../src/extractor.js';

const args = parseArgs(process.argv.slice(2));
const inputPath = args.input ?? 'work/test-sites.txt';
const outputDir = args.outputDir ?? 'outputs/batch-test';
const maxPagesPerDomain = Number.parseInt(args.maxPagesPerDomain ?? '5', 10);
const maxConcurrency = Number.parseInt(args.maxConcurrency ?? '5', 10);
const respectRobotsTxt = args.respectRobotsTxt !== 'false';

const startedAt = new Date();
const urls = await readUrls(inputPath);

if (urls.length === 0) {
  throw new Error(`No URLs found in ${inputPath}`);
}

await fs.mkdir(outputDir, { recursive: true });

const resultPath = path.join(outputDir, 'results.jsonl');
const summaryPath = path.join(outputDir, 'summary.json');
await fs.writeFile(resultPath, '');

const summary = {
  inputPath,
  resultPath,
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  totalSites: urls.length,
  maxPagesPerDomain,
  maxConcurrency,
  respectRobotsTxt,
  successfulSites: 0,
  sitesWithEmails: 0,
  sitesWithPhones: 0,
  sitesWithSocialLinks: 0,
  sitesWithCompanyName: 0,
  sitesWithAboutText: 0,
  sitesWithErrors: 0,
  totalSourcePages: 0,
  totalEmails: 0,
  totalPhoneNumbers: 0,
  totalErrors: 0,
  errorSamples: [],
};

const results = await processWithConcurrency(urls, maxConcurrency, async (url, index) => {
  console.log(`[${index + 1}/${urls.length}] ${url}`);
  return extractWebsiteContactIntelligence(url, {
    maxPagesPerDomain,
    respectRobotsTxt,
  });
});

for (const result of results) {
  updateSummary(summary, result);
  await fs.appendFile(resultPath, `${JSON.stringify(result)}\n`);
}

summary.finishedAt = new Date().toISOString();
summary.durationSeconds = Math.round((new Date(summary.finishedAt).getTime() - startedAt.getTime()) / 1000);
summary.emailCoverage = ratio(summary.sitesWithEmails, summary.totalSites);
summary.phoneCoverage = ratio(summary.sitesWithPhones, summary.totalSites);
summary.socialCoverage = ratio(summary.sitesWithSocialLinks, summary.totalSites);
summary.companyNameCoverage = ratio(summary.sitesWithCompanyName, summary.totalSites);
summary.aboutTextCoverage = ratio(summary.sitesWithAboutText, summary.totalSites);
summary.successRate = ratio(summary.successfulSites, summary.totalSites);
summary.averageSourcePages = ratio(summary.totalSourcePages, summary.totalSites);

await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(`Wrote ${resultPath}`);
console.log(`Wrote ${summaryPath}`);

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

async function readUrls(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

function updateSummary(summary, result) {
  const socialCount = Object.values(result.socialLinks ?? {}).filter(Boolean).length;
  const errorCount = result.errors?.length ?? 0;

  if (result.sourcePages?.length) summary.successfulSites += 1;
  if (result.emails?.length) summary.sitesWithEmails += 1;
  if (result.phoneNumbers?.length) summary.sitesWithPhones += 1;
  if (socialCount > 0) summary.sitesWithSocialLinks += 1;
  if (result.companyName) summary.sitesWithCompanyName += 1;
  if (result.aboutText) summary.sitesWithAboutText += 1;
  if (errorCount > 0) summary.sitesWithErrors += 1;

  summary.totalSourcePages += result.sourcePages?.length ?? 0;
  summary.totalEmails += result.emails?.length ?? 0;
  summary.totalPhoneNumbers += result.phoneNumbers?.length ?? 0;
  summary.totalErrors += errorCount;

  for (const error of result.errors ?? []) {
    if (summary.errorSamples.length >= 20) break;
    summary.errorSamples.push({
      domain: result.domain,
      url: error.url,
      message: error.message,
    });
  }
}

function ratio(numerator, denominator) {
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(4));
}

async function processWithConcurrency(items, maxConcurrencyValue, handler) {
  const concurrency = Math.max(1, Math.min(Number(maxConcurrencyValue) || 1, 20));
  const results = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex;
      currentIndex += 1;
      results[index] = await handler(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}
