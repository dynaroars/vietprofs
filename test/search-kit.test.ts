import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  parseKeywordQuery,
  sample,
  shuffle,
  createCommandHandler,
} from '../src/search-kit.ts';

test('normalizeText strips diacritics and converts to lowercase', () => {
  assert.equal(normalizeText('Nguyễn'), 'nguyen');
  assert.equal(normalizeText('Đàm Thanh Sơn'), 'đam thanh son');
  assert.equal(normalizeText('Tạ Hà'), 'ta ha');
  assert.equal(normalizeText('Stanford University'), 'stanford university');
});

test('parseKeywordQuery parses recognized keyword prefixes with raw and quoted queries', () => {
  const resolveKey = (k: string) => (['university', 'field', 'research', 'connection'].includes(k) ? k : null);

  assert.equal(parseKeywordQuery('random search string', resolveKey), null);
  assert.equal(parseKeywordQuery('unknown: query', resolveKey), null);

  const parsedUniv = parseKeywordQuery('University: Stanford', resolveKey);
  assert.deepEqual(parsedUniv, { key: 'university', query: 'Stanford' });

  const parsedQuoted = parseKeywordQuery('research: "Machine Learning"', resolveKey);
  assert.deepEqual(parsedQuoted, { key: 'research', query: 'Machine Learning' });

  const parsedField = parseKeywordQuery('field: Computer & Information Sciences', resolveKey);
  assert.deepEqual(parsedField, { key: 'field', query: 'Computer & Information Sciences' });

  const parsedConnection = parseKeywordQuery('connection:co-author', resolveKey);
  assert.deepEqual(parsedConnection, { key: 'connection', query: 'co-author' });
});

test('sample and shuffle array helpers preserve elements and length', () => {
  const items = [1, 2, 3, 4, 5];
  const sampled = sample(items, 3);
  assert.equal(sampled.length, 3);
  assert.ok(sampled.every((item) => items.includes(item)));

  const shuffled = shuffle(items);
  assert.equal(shuffled.length, 5);
  assert.deepEqual([...shuffled].sort(), [...items].sort());
});

test('createCommandHandler runs only help, query plan, and clear; every other word is a search', () => {
  let lastOutput = '';
  const fakeOutputEl = {
    set textContent(val: string) {
      lastOutput = val;
    },
    get textContent() {
      return lastOutput;
    },
    hidden: true,
  } as unknown as HTMLElement;
  const calls: string[] = [];
  let resets = 0;
  let updated = false;

  const handler = createCommandHandler({
    commandOutputEl: fakeOutputEl,
    getSearch: () => ({ resetScope: () => { resets += 1; } }),
    help: { show: () => calls.push('help shown') },
    onUpdate: () => {
      updated = true;
    },
    getQueryPlan: () => 'mode=roster matches=10',
    resetDirectory: () => calls.push('reset'),
  });

  assert.equal(handler('query plan'), true);
  assert.equal(lastOutput, 'query plan: mode=roster matches=10');
  assert.equal(updated, true);
  assert.equal(handler('HELP'), true);
  assert.equal(calls.at(-1), 'help shown');
  assert.ok(resets >= 2, 'completed commands reset the search scope');
  assert.equal(handler('clear'), true);
  assert.equal(calls.at(-1), 'reset');
  for (const word of ['health', 'random', 'reset', 'stats', 'fortune', 'whoami', 'theme crt', 'recent', 'toString', '']) {
    assert.equal(handler(word), false, `"${word}" stays an ordinary search`);
  }
});
