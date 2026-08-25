import assert from 'node:assert/strict';
import test from 'node:test';
import { parseWebviewMessage } from '../src/shared/contracts';

const id = '123e4567-e89b-42d3-a456-426614174000';

test('parses valid boundary messages', () => {
  assert.deepEqual(parseWebviewMessage({ type: 'ready' }), { type: 'ready' });
  assert.deepEqual(
    parseWebviewMessage({
      type: 'create',
      kind: 'snippet',
      title: ' Fetch ',
      language: 'typescript',
    }),
    {
      type: 'create',
      kind: 'snippet',
      title: 'Fetch',
      language: 'typescript',
    },
  );
  assert.deepEqual(
    parseWebviewMessage({ type: 'saveMarkdown', id, title: 'Todo', content: '- [ ] ship' }),
    {
      type: 'saveMarkdown',
      id,
      title: 'Todo',
      content: '- [ ] ship',
    },
  );
});

test('rejects path-like ids and invalid payloads', () => {
  assert.equal(parseWebviewMessage({ type: 'deleteItem', id: '../index' }), undefined);
  assert.equal(parseWebviewMessage({ type: 'create', kind: 'markdown', title: '   ' }), undefined);
  assert.equal(
    parseWebviewMessage({ type: 'saveMarkdown', id, title: 'x', content: 1 }),
    undefined,
  );
});
