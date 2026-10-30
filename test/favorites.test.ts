import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearRecentProfiles,
  isFavorite,
  loadFavorites,
  loadRecentProfiles,
  recordRecentProfile,
  saveFavorites,
  toggleFavorite,
} from '../src/favorites-store.ts';

function installMemoryStorage() {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => (data.has(key) ? data.get(key) : null),
      setItem: (key: string, value: string) => {
        data.set(key, String(value));
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
      clear: () => {
        data.clear();
      },
    },
  });
}

beforeEach(() => {
  installMemoryStorage();
});

test('favorites start empty and persist a toggled profile id', () => {
  assert.deepEqual(loadFavorites(), []);
  assert.equal(isFavorite('vp-0001'), false);
  assert.equal(toggleFavorite('vp-0001'), true);
  assert.deepEqual(loadFavorites(), ['vp-0001']);
  assert.equal(isFavorite('vp-0001'), true);
  assert.equal(toggleFavorite('vp-0001'), false);
  assert.deepEqual(loadFavorites(), []);
});

test('favorites ignore invalid ids and keep unique values', () => {
  saveFavorites(['vp-0001', 'vp-0001', 'not-an-id', 'vp-12', 12 as unknown as string]);
  assert.deepEqual(loadFavorites(), ['vp-0001']);
  localStorage.setItem('vietprofs:favorites', '{bad');
  assert.deepEqual(loadFavorites(), []);
});

test('recent profiles retain unique valid ids in visit order', () => {
  recordRecentProfile('vp-0002');
  recordRecentProfile('vp-0001');
  recordRecentProfile('vp-0002');
  recordRecentProfile('invalid');
  assert.deepEqual(loadRecentProfiles(), ['vp-0002', 'vp-0001']);
});

test('clearing recent profiles removes them all', () => {
  recordRecentProfile('vp-0001');
  clearRecentProfiles();
  assert.deepEqual(loadRecentProfiles(), []);
});

test('favorites expose failed writes while optional recent history tolerates them', () => {
  localStorage.setItem('vietprofs:favorites', '["vp-0001"]');
  localStorage.setItem('vietprofs:recent-profiles', '["vp-0001"]');
  localStorage.setItem = () => {
    throw new Error('Storage quota exceeded');
  };
  assert.throws(() => toggleFavorite('vp-0002'), /quota/);
  assert.deepEqual(loadFavorites(), ['vp-0001']);
  assert.deepEqual(recordRecentProfile('vp-0002'), ['vp-0001']);
});

test('unavailable browser storage never reports a favorite as saved', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage blocked');
    },
  });
  assert.deepEqual(loadFavorites(), []);
  assert.throws(() => toggleFavorite('vp-0001'), /unavailable/);
  assert.doesNotThrow(() => recordRecentProfile('vp-0001'));
});
