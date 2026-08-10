import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDatasetItem,
  extractPageData,
  extractPhoneNumbers,
  isAllowedByRobots,
} from '../src/extractor.js';
import robotsParser from 'robots-parser';

test('extracts public emails, phones, social links, and metadata', () => {
  const html = `
    <html>
      <head>
        <title>Acme Export | Industrial Parts</title>
        <meta name="description" content="Industrial supplier for B2B buyers">
        <meta property="og:site_name" content="Acme Export">
      </head>
      <body>
        <main>
          <p>Contact sales at Sales@AcmeExport.com or call +1 (415) 555-0132.</p>
          <a href="/contact-us">Contact us</a>
          <a href="/about">About</a>
          <a href="https://www.linkedin.com/company/acme-export">LinkedIn</a>
          <a href="https://x.com/acmeexport">X</a>
          <a href="https://facebook.com/acmeexport">Facebook</a>
          <a href="https://instagram.com/acmeexport">Instagram</a>
        </main>
      </body>
    </html>
  `;

  const page = extractPageData(html, 'https://acmeexport.com/');

  assert.equal(page.companyName, 'Acme Export');
  assert.deepEqual(page.emails, ['sales@acmeexport.com']);
  assert.deepEqual(page.phoneNumbers, ['+1 (415) 555-0132']);
  assert.equal(page.socialLinks.linkedin, 'https://www.linkedin.com/company/acme-export');
  assert.equal(page.socialLinks.twitter, 'https://x.com/acmeexport');
  assert.equal(page.socialLinks.facebook, 'https://facebook.com/acmeexport');
  assert.equal(page.socialLinks.instagram, 'https://instagram.com/acmeexport');
  assert.ok(page.discoveredLinks.includes('https://acmeexport.com/contact-us'));
});

test('builds a deduplicated dataset item', () => {
  const item = buildDatasetItem('acmeexport.com', [
    {
      url: 'https://acmeexport.com/',
      companyName: 'Acme Export',
      title: 'Acme Export',
      metaDescription: 'B2B supplier',
      emails: ['contact@acmeexport.com'],
      phoneNumbers: ['+1 415 555 0132'],
      socialLinks: { linkedin: '', twitter: '', facebook: '', instagram: '' },
      aboutText: 'Homepage text',
    },
    {
      url: 'https://acmeexport.com/contact',
      emails: ['contact@acmeexport.com', 'sales@acmeexport.com'],
      phoneNumbers: ['+1 415 555 0132'],
      socialLinks: { linkedin: 'https://linkedin.com/company/acme-export' },
      aboutText: 'Contact text',
    },
  ]);

  assert.equal(item.domain, 'acmeexport.com');
  assert.deepEqual(item.emails, ['contact@acmeexport.com', 'sales@acmeexport.com']);
  assert.deepEqual(item.phoneNumbers, ['+1 415 555 0132']);
  assert.deepEqual(item.contactPages, ['/contact']);
  assert.equal(item.socialLinks.linkedin, 'https://linkedin.com/company/acme-export');
  assert.ok(item.timestamp);
});

test('filters date-like and asset-like false positives', () => {
  const text = 'Dates 2024-09-10 and 2025-01-31 are not phones. Call +44 20 7946 0958 or (415) 555-0132.';
  const phones = extractPhoneNumbers(text);

  assert.deepEqual(phones, ['+44 20 7946 0958', '(415) 555-0132']);
});

test('detects robots.txt disallowed pages', () => {
  const robots = robotsParser('https://acme.test/robots.txt', `
    User-agent: WebsiteContactIntelligenceActor
    Disallow: /private

    User-agent: *
    Allow: /
  `);

  assert.equal(isAllowedByRobots(robots, 'https://acme.test/contact'), true);
  assert.equal(isAllowedByRobots(robots, 'https://acme.test/private/contact'), false);
});
