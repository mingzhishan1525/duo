import axios from 'axios';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';

const DEFAULT_CANDIDATE_PATHS = [
  '/contact',
  '/contact-us',
  '/about',
  '/about-us',
  '/team',
];

const USER_AGENT = 'WebsiteContactIntelligenceActor/0.1 (+https://apify.com)';

export function normalizeStartUrl(inputUrl) {
  const withProtocol = /^https?:\/\//i.test(inputUrl) ? inputUrl : `https://${inputUrl}`;
  const url = new URL(withProtocol);
  url.hash = '';
  return url;
}

export function getDomain(inputUrl) {
  return normalizeStartUrl(inputUrl).hostname.replace(/^www\./i, '').toLowerCase();
}

export function absolutizeUrl(href, baseUrl) {
  try {
    const url = new URL(href, baseUrl);
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

export async function fetchHtml(url, timeoutMillis = 15000) {
  const response = await axios.get(url, {
    timeout: timeoutMillis,
    maxRedirects: 5,
    responseType: 'text',
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html,application/xhtml+xml',
    },
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const contentType = response.headers['content-type'] ?? '';
  if (contentType && !contentType.toLowerCase().includes('text/html')) {
    throw new Error(`Skipping non-HTML content type: ${contentType}`);
  }

  return {
    finalUrl: response.request?.res?.responseUrl ?? url,
    html: response.data,
  };
}

export async function fetchRobotsTxt(origin, timeoutMillis = 5000) {
  try {
    const robotsUrl = new URL('/robots.txt', origin).toString();
    const response = await axios.get(robotsUrl, {
      timeout: timeoutMillis,
      maxRedirects: 3,
      responseType: 'text',
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/plain,*/*',
      },
      validateStatus: (status) => status >= 200 && status < 500,
    });

    if (response.status >= 400) return null;
    return robotsParser(robotsUrl, response.data);
  } catch {
    return null;
  }
}

export function isAllowedByRobots(robots, url) {
  if (!robots) return true;
  return robots.isAllowed(url, USER_AGENT) !== false;
}

export function extractPageData(html, pageUrl) {
  const $ = cheerio.load(html);
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  const title = $('title').first().text().replace(/\s+/g, ' ').trim();
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? '';
  const emails = extractEmails(html);
  const phoneNumbers = extractPhoneNumbers(text);
  const socialLinks = extractSocialLinks($, pageUrl);
  const discoveredLinks = discoverRelevantLinks($, pageUrl);

  return {
    url: pageUrl,
    title,
    metaDescription,
    companyName: inferCompanyName($, title, pageUrl),
    emails,
    phoneNumbers,
    socialLinks,
    discoveredLinks,
    aboutText: extractAboutText($, text),
  };
}

export function extractEmails(html) {
  const decoded = html
    .replace(/mailto:/gi, '')
    .replace(/&#64;|&commat;/gi, '@')
    .replace(/\s*\[at\]\s*|\s*\(at\)\s*/gi, '@')
    .replace(/\s*\[dot\]\s*|\s*\(dot\)\s*/gi, '.');

  const matches = decoded.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return unique(matches.map((email) => email.toLowerCase()))
    .map((email) => email.replace(/[?&].*$/, ''))
    .filter((email) => !/\.(png|jpe?g|gif|webp|svg|css|js)$/i.test(email))
    .filter((email) => !email.includes('example.com'));
}

export function extractPhoneNumbers(text) {
  const matches = text.match(/(?:\+?\(?\d[\d\s().-]{7,}\d)/g) ?? [];
  return unique(matches.map((phone) => phone.replace(/\s+/g, ' ').trim()))
    .filter(isLikelyBusinessPhone)
    .slice(0, 20);
}

export function isLikelyBusinessPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(phone)) return false;
  if (/^\d{4}[./]\d{2}[./]\d{2}$/.test(phone)) return false;
  if (/^\d{10,15}$/.test(phone)) return false;

  const hasPhoneShape = phone.includes('+') || /[().\s-]/.test(phone);
  const hasGroupedDigits = /\d{2,}[\s().-]+\d{2,}/.test(phone);
  return hasPhoneShape && hasGroupedDigits;
}

export function extractSocialLinks($, pageUrl) {
  const socialLinks = {
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
  };

  $('a[href]').each((_, element) => {
    const href = absolutizeUrl($(element).attr('href'), pageUrl);
    if (!href) return;
    const lowerHref = href.toLowerCase();

    if (!socialLinks.linkedin && lowerHref.includes('linkedin.com/company/')) socialLinks.linkedin = href;
    if (!socialLinks.twitter && (lowerHref.includes('twitter.com/') || lowerHref.includes('x.com/'))) socialLinks.twitter = href;
    if (!socialLinks.facebook && lowerHref.includes('facebook.com/')) socialLinks.facebook = href;
    if (!socialLinks.instagram && lowerHref.includes('instagram.com/')) socialLinks.instagram = href;
  });

  return socialLinks;
}

export function discoverRelevantLinks($, pageUrl) {
  const candidates = new Set();
  const base = new URL(pageUrl);

  for (const path of DEFAULT_CANDIDATE_PATHS) {
    candidates.add(new URL(path, base.origin).toString());
  }

  $('a[href]').each((_, element) => {
    const href = absolutizeUrl($(element).attr('href'), pageUrl);
    if (!href) return;
    const url = new URL(href);
    if (url.hostname.replace(/^www\./i, '') !== base.hostname.replace(/^www\./i, '')) return;

    const label = `${url.pathname} ${$(element).text()}`.toLowerCase();
    if (/\b(contact|contact-us|about|about-us|team)\b/.test(label)) {
      candidates.add(url.toString());
    }
  });

  return [...candidates];
}

export function inferCompanyName($, title, pageUrl) {
  const ogSiteName = $('meta[property="og:site_name"]').attr('content')?.trim();
  if (ogSiteName) return cleanCompanyName(ogSiteName);

  const applicationName = $('meta[name="application-name"]').attr('content')?.trim();
  if (applicationName) return cleanCompanyName(applicationName);

  const firstTitlePart = title.split(/\s[|–-]\s/)[0]?.trim();
  if (firstTitlePart) return cleanCompanyName(firstTitlePart);

  return getDomain(pageUrl).split('.')[0];
}

export function extractAboutText($, fallbackText) {
  const selectors = [
    'main',
    'article',
    '[class*="about" i]',
    '[id*="about" i]',
    'body',
  ];

  for (const selector of selectors) {
    const value = $(selector).first().text().replace(/\s+/g, ' ').trim();
    if (value.length >= 80) return value.slice(0, 1200);
  }

  return fallbackText.slice(0, 1200);
}

export async function extractWebsiteContactIntelligence(startUrl, options = {}) {
  const maxPagesPerDomain = Math.max(1, options.maxPagesPerDomain ?? 5);
  const respectRobotsTxt = options.respectRobotsTxt ?? true;
  const normalized = normalizeStartUrl(startUrl);
  const domain = getDomain(normalized.toString());
  const robots = respectRobotsTxt ? await fetchRobotsTxt(normalized.origin, options.robotsTimeoutMillis) : null;
  const queue = [normalized.toString()];
  const visited = new Set();
  const pageResults = [];
  const errors = [];

  while (queue.length > 0 && visited.size < maxPagesPerDomain) {
    const nextUrl = queue.shift();
    if (!nextUrl || visited.has(nextUrl)) continue;
    visited.add(nextUrl);

    try {
      if (!isAllowedByRobots(robots, nextUrl)) {
        errors.push({
          url: nextUrl,
          message: 'Skipped because robots.txt disallows this page.',
        });
        continue;
      }

      const { finalUrl, html } = await fetchHtml(nextUrl, options.timeoutMillis);
      const pageData = extractPageData(html, finalUrl);
      pageResults.push(pageData);

      for (const link of pageData.discoveredLinks) {
        if (!visited.has(link) && queue.length + visited.size < maxPagesPerDomain) {
          queue.push(link);
        }
      }
    } catch (error) {
      errors.push({
        url: nextUrl,
        message: error.message,
      });
    }
  }

  return buildDatasetItem(domain, pageResults, errors);
}

export function buildDatasetItem(domain, pageResults, errors = []) {
  const homepage = pageResults[0] ?? {};
  const socialLinks = {
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
  };

  for (const result of pageResults) {
    for (const [key, value] of Object.entries(result.socialLinks ?? {})) {
      if (!socialLinks[key] && value) socialLinks[key] = value;
    }
  }

  const contactPages = pageResults
    .filter((result) => /contact/i.test(new URL(result.url).pathname))
    .map((result) => new URL(result.url).pathname || '/');

  const aboutTexts = pageResults
    .filter((result) => /about|team/i.test(result.url))
    .map((result) => result.aboutText)
    .filter(Boolean);

  return {
    domain,
    companyName: homepage.companyName ?? '',
    title: homepage.title ?? '',
    metaDescription: homepage.metaDescription ?? '',
    emails: unique(pageResults.flatMap((result) => result.emails ?? [])),
    phoneNumbers: unique(pageResults.flatMap((result) => result.phoneNumbers ?? [])),
    contactPages: unique(contactPages),
    socialLinks,
    aboutText: (aboutTexts[0] ?? homepage.aboutText ?? '').slice(0, 1200),
    sourcePages: pageResults.map((result) => result.url),
    timestamp: new Date().toISOString(),
    errors,
  };
}

function cleanCompanyName(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+(official site|homepage|home)$/i, '')
    .trim()
    .slice(0, 120);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
