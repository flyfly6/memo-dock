import assert from 'node:assert/strict';
import test from 'node:test';
import { getCompletedChecklistMove, insertUncheckedChecklistAbove } from '../src/webview/checklist';

const blocks = [{ id: 'first' }, { id: 'completed' }, { id: 'last' }];

test('moves a newly checked top-level checklist to the document end', () => {
  assert.deepEqual(
    getCompletedChecklistMove(blocks, [
      {
        type: 'update',
        block: { id: 'completed', type: 'checkListItem', props: { checked: true } },
        prevBlock: { id: 'completed', type: 'checkListItem', props: { checked: false } },
      },
    ]),
    [
      [{ id: 'completed' }, { id: 'last' }],
      [{ id: 'last' }, { id: 'completed' }],
    ],
  );
});

test('does not move an ineligible checklist change', () => {
  const cases = [
    {
      name: 'already last',
      blocks: [{ id: 'completed' }],
      block: { id: 'completed', type: 'checkListItem', props: { checked: true } },
      prevBlock: { id: 'completed', type: 'checkListItem', props: { checked: false } },
    },
    {
      name: 'nested',
      blocks,
      block: { id: 'nested', type: 'checkListItem', props: { checked: true } },
      prevBlock: { id: 'nested', type: 'checkListItem', props: { checked: false } },
    },
    {
      name: 'unchecked',
      blocks,
      block: { id: 'completed', type: 'checkListItem', props: { checked: false } },
      prevBlock: { id: 'completed', type: 'checkListItem', props: { checked: true } },
    },
    {
      name: 'ordinary block',
      blocks,
      block: { id: 'completed', type: 'paragraph', props: {} },
      prevBlock: { id: 'completed', type: 'paragraph', props: {} },
    },
  ];

  for (const item of cases) {
    assert.equal(
      getCompletedChecklistMove(item.blocks, [
        { type: 'update', block: item.block, prevBlock: item.prevBlock },
      ]),
      undefined,
      item.name,
    );
  }
});

test('inserts an unchecked checklist above and focuses it', () => {
  const calls: unknown[] = [];
  const handled = insertUncheckedChecklistAbove({
    getTextCursorPosition: () => ({ block: { id: 'current' } }),
    insertBlocks: (blocks, referenceBlock, placement) => {
      calls.push({ blocks, referenceBlock, placement });
      return [{ id: 'inserted' }];
    },
    setTextCursorPosition: (block, placement) => calls.push({ block, placement }),
  });

  assert.equal(handled, true);
  assert.deepEqual(calls, [
    {
      blocks: [{ type: 'checkListItem', props: { checked: false } }],
      referenceBlock: { id: 'current' },
      placement: 'before',
    },
    { block: { id: 'inserted' }, placement: 'start' },
  ]);
});
