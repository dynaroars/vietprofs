import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { identityKey, namesMatch, nameTokens } from '../src/identity.ts';

test('names match across order, diacritics, initials, and disambiguation suffixes', () => {
  assert.ok(namesMatch(nameTokens('Tin Nguyen - Auburn University'), nameTokens('Tin Nguyen - Wayne State University')));
  assert.ok(namesMatch(nameTokens('Phuc Thanh Nguyen'), nameTokens('Thanh Phúc Nguyễn')));
  assert.ok(namesMatch(nameTokens('Huy T. Tran'), nameTokens('Huy Trong Tran')));
  assert.ok(!namesMatch(nameTokens('Khanh Nguyen'), nameTokens('Nguyen P. Nguyen')));
});

test('identity URLs compare by Scholar user, LinkedIn slug, and normalized address', () => {
  assert.equal(identityKey('https://www.linkedin.com/in/Viet-Hoang-Nguyen-26b765b4/'), identityKey('https://linkedin.com/in/viet-hoang-nguyen-26b765b4'));
  assert.equal(identityKey('https://scholar.google.com/citations?hl=en&user=abcDEF123'), 'scholar:abcDEF123');
  assert.equal(identityKey('https://www.di.ens.fr/~pnguyen/'), identityKey('http://di.ens.fr/~pnguyen'));
  assert.notEqual(identityKey('https://faculty.uci.edu/profile/?facultyId=1'), identityKey('https://faculty.uci.edu/profile/?facultyId=2'));
});

test('retired ids are recorded with a reason and never reused', () => {
  const retired = JSON.parse(readFileSync('maintenance/retired-ids.json', 'utf8')) as Record<string, { replacedBy: string | null; reason: string }>;
  const roster = JSON.parse(readFileSync('public/data.json', 'utf8')) as Array<{ id: string }>;
  const ids = new Set(roster.map((person) => person.id));
  assert.equal(retired['vp-1692']?.replacedBy, 'vp-0037');
  for (const [id, record] of Object.entries(retired)) {
    assert.ok(!ids.has(id), `${id} is retired but back in the roster`);
    assert.ok(record.reason.trim(), `${id} has a reason`);
  }
});
