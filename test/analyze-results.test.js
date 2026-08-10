import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDatasetExport, summarize } from '../scripts/analyze-results.js';

const sampleRecords = [
  {
    domain: 'acme.test',
    emails: ['contact@acme.test'],
    phoneNumbers: ['+1 415 555 0132'],
    socialLinks: { linkedin: 'https://linkedin.com/company/acme' },
    sourcePages: ['https://acme.test/'],
    errors: [],
  },
  {
    domain: 'empty.test',
    emails: [],
    phoneNumbers: [],
    socialLinks: {},
    sourcePages: [],
    errors: [{ url: 'https://empty.test/', message: 'timeout' }],
  },
];

test('parseDatasetExport supports JSONL exports', () => {
  const jsonl = sampleRecords.map((item) => JSON.stringify(item)).join('\n');
  assert.deepEqual(parseDatasetExport(jsonl), sampleRecords);
});

test('parseDatasetExport supports JSON array exports', () => {
  assert.deepEqual(parseDatasetExport(JSON.stringify(sampleRecords)), sampleRecords);
});

test('summarize calculates validation metrics', () => {
  const summary = summarize(sampleRecords);

  assert.equal(summary.totalSites, 2);
  assert.equal(summary.successfulSites, 1);
  assert.equal(summary.successRate, 0.5);
  assert.equal(summary.emailCoverage, 0.5);
  assert.equal(summary.phoneCoverage, 0.5);
  assert.equal(summary.socialCoverage, 0.5);
  assert.equal(summary.sitesWithErrors, 1);
});
