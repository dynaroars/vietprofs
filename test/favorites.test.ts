import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { isFavorite, loadFavorites, saveFavorites, toggleFavorite } from '../src/favorites-store.ts';

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
