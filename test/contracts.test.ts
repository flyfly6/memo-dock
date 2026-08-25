import assert from 'node:assert/strict';
import test from 'node:test';
import { parseWebviewMessage } from '../src/shared/contracts';

const id = '123e4567-e89b-42d3-a456-426614174000';

test('parses valid boundary messages', () => {
  assert.deepEqual(parseWebviewMessage({ type: 'ready' }), { type: 'ready' });
  assert.deepEqual(
    parseWebviewMessage({
      type: 'createSnippet',
      title: ' Fetch ',
      language: 'typescript',
    }),
    {
      type: 'createSnippet',
      title: 'Fetch',
      language: 'typescript',
    },
  );
  assert.deepEqual(parseWebviewMessage({ type: 'saveMarkdown', id, content: '- [ ] ship' }), {
    type: 'saveMarkdown',
    id,
    content: '- [ ] ship',
  });
});

test('rejects path-like ids and invalid payloads', () => {
  assert.equal(parseWebviewMessage({ type: 'deleteSnippet', id: '../index' }), undefined);
  assert.equal(parseWebviewMessage({ type: 'createSnippet', title: '   ' }), undefined);
  assert.equal(
    parseWebviewMessage({ type: 'create', kind: 'markdown', title: 'Notes' }),
    undefined,
  );
  assert.equal(parseWebviewMessage({ type: 'saveMarkdown', id, content: 1 }), undefined);
});
