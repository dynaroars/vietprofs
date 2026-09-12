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
  const resolveKey = (k: string) => (['university', 'field', 'research'].includes(k) ? k : null);

  assert.equal(parseKeywordQuery('random search string', resolveKey), null);
  assert.equal(parseKeywordQuery('unknown: query', resolveKey), null);

  const parsedUniv = parseKeywordQuery('University: Stanford', resolveKey);
  assert.deepEqual(parsedUniv, { key: 'university', query: 'Stanford' });

  const parsedQuoted = parseKeywordQuery('research: "Machine Learning"', resolveKey);
  assert.deepEqual(parsedQuoted, { key: 'research', query: 'Machine Learning' });

  const parsedField = parseKeywordQuery('field: Computer & Information Sciences', resolveKey);
  assert.deepEqual(parsedField, { key: 'field', query: 'Computer & Information Sciences' });
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

test('createCommandHandler handles built-in Easter egg commands', () => {
  let lastOutput = '';
  let updated = false;

  const fakeOutputEl = {
    set textContent(val: string) {
      lastOutput = val;
    },
    get textContent() {
      return lastOutput;
    },
    hidden: true,
  } as unknown as HTMLElement;

  const handler = createCommandHandler({
    siteName: 'VietProfs',
    aboutText: 'VietProfs is a directory of Vietnamese faculty outside Vietnam.',
    commandOutputEl: fakeOutputEl,
    onUpdate: () => {
      updated = true;
    },
    getStats: () => '1484 profiles',
    getQueryPlan: () => 'mode=roster matches=10',
    facts: ['Fact 1', 'Fact 2'],
  });

  assert.equal(handler('whoami'), true);
  assert.equal(lastOutput, 'VietProfs is a directory of Vietnamese faculty outside Vietnam.');
  assert.equal(updated, true);

  assert.equal(handler('stats'), true);
  assert.equal(lastOutput, 'stats: 1484 profiles');

  assert.equal(handler('query plan'), true);
  assert.equal(lastOutput, 'query plan: mode=roster matches=10');

  assert.equal(handler('unrecognized_command_123'), false);
});
