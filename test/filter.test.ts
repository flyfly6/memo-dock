import assert from 'node:assert/strict';
import test from 'node:test';
import { filterItems } from '../src/shared/filter';
import type { ItemSnapshot } from '../src/shared/contracts';

const items: ItemSnapshot[] = [
  {
    id: '123e4567-e89b-42d3-a456-426614174000',
    kind: 'markdown',
    title: 'Release notes',
    content: '- [ ] publish',
    createdAt: '2026-08-24T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: '123e4567-e89b-42d3-a456-426614174001',
    kind: 'snippet',
    title: 'Fetch JSON',
    language: 'typescript',
    content: 'await response.json()',
    createdAt: '2026-08-24T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
];

test('searches titles and bodies case-insensitively', () => {
  assert.deepEqual(filterItems(items, 'RELEASE'), [items[0]]);
  assert.deepEqual(filterItems(items, 'response'), [items[1]]);
  assert.deepEqual(filterItems(items, '  '), items);
});
