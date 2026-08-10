import fs from 'node:fs/promises';

const args = parseArgs(process.argv.slice(2));
const inputPath = args.input ?? 'work/test-sites-100.txt';
const outputPath = args.output ?? 'outputs/apify-input-100.json';

const urls = await readUrls(inputPath);

const input = {
  startUrls: urls.map((url) => ({ url })),
  maxPagesPerDomain: Number.parseInt(args.maxPagesPerDomain ?? '5', 10),
  maxConcurrency: Number.parseInt(args.maxConcurrency ?? '5', 10),
  respectRobotsTxt: args.respectRobotsTxt !== 'false',
};

await fs.mkdir(new URL('../outputs/', import.meta.url), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(input, null, 2)}\n`);

console.log(`Wrote ${outputPath} with ${urls.length} URLs`);

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
