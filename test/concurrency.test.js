import test from 'node:test';
import assert from 'node:assert/strict';
import { processWithConcurrency } from '../src/main.js';

test('processWithConcurrency preserves all items and respects concurrency cap', async () => {
  let active = 0;
  let peak = 0;
  const processed = [];

  await processWithConcurrency([1, 2, 3, 4, 5], 2, async (item) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    processed.push(item);
    active -= 1;
  });

  assert.equal(peak, 2);
  assert.deepEqual(processed.sort((a, b) => a - b), [1, 2, 3, 4, 5]);
});
