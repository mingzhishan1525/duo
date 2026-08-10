import { Actor, log } from 'apify';
import { extractWebsiteContactIntelligence } from './extractor.js';

if (import.meta.url === `file://${process.argv[1]}`) {
  await Actor.init();

  try {
    const input = await Actor.getInput();
    await runActor(input);
  } finally {
    await Actor.exit();
  }
}

export async function runActor(input) {
  const startUrls = input?.startUrls ?? [];
  const maxPagesPerDomain = input?.maxPagesPerDomain ?? 5;
  const maxConcurrency = input?.maxConcurrency ?? 5;
  const respectRobotsTxt = input?.respectRobotsTxt ?? true;

  if (!Array.isArray(startUrls) || startUrls.length === 0) {
    throw new Error('Input must include at least one startUrls item.');
  }

  const urls = startUrls
    .map((item) => (typeof item === 'string' ? item : item?.url))
    .filter(Boolean);

  if (urls.length === 0) {
    throw new Error('No valid URLs found in startUrls.');
  }

  await processWithConcurrency(urls, maxConcurrency, async (url) => {
    log.info('Extracting public website contact intelligence.', {
      url,
      maxPagesPerDomain,
      maxConcurrency,
      respectRobotsTxt,
    });

    const result = await extractWebsiteContactIntelligence(url, {
      maxPagesPerDomain,
      respectRobotsTxt,
    });

    await Actor.pushData(result);
  });
}

export async function processWithConcurrency(items, maxConcurrency, handler) {
  const concurrency = Math.max(1, Math.min(Number(maxConcurrency) || 1, 20));
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (currentIndex < items.length) {
      const item = items[currentIndex];
      currentIndex += 1;
      await handler(item);
    }
  });

  await Promise.all(workers);
}
