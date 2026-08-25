interface BlockLike {
  id: string;
  type: string;
  props: object;
}

interface BlockChangeLike {
  type: string;
  block: BlockLike;
  prevBlock?: BlockLike;
}

interface ChecklistInsertionEditor {
  getTextCursorPosition(): { block: { id: string } };
  insertBlocks(
    blocks: Array<{ type: 'checkListItem'; props: { checked: false } }>,
    referenceBlock: { id: string },
    placement: 'before',
  ): Array<{ id: string }>;
  setTextCursorPosition(block: { id: string }, placement: 'start'): void;
}

export function getCompletedChecklistMove<T extends { id: string }>(
  blocks: readonly T[],
  changes: readonly BlockChangeLike[],
): [T[], T[]] | undefined {
  const completed = changes.find(
    ({ type, block, prevBlock }) =>
      type === 'update' && isChecklistChecked(prevBlock, false) && isChecklistChecked(block, true),
  );
  const index = completed ? blocks.findIndex(({ id }) => id === completed.block.id) : -1;

  if (index < 0 || index === blocks.length - 1) {
    return undefined;
  }

  const [block, ...following] = blocks.slice(index);
  return block
    ? [
        [block, ...following],
        [...following, block],
      ]
    : undefined;
}

function isChecklistChecked(block: BlockLike | undefined, checked: boolean): boolean {
  return (
    block?.type === 'checkListItem' && 'checked' in block.props && block.props.checked === checked
  );
}

export function insertUncheckedChecklistAbove(editor: ChecklistInsertionEditor): boolean {
  const currentBlock = editor.getTextCursorPosition().block;
  const [insertedBlock] = editor.insertBlocks(
    [{ type: 'checkListItem', props: { checked: false } }],
    currentBlock,
    'before',
  );

  if (!insertedBlock) {
    return false;
  }

  editor.setTextCursorPosition(insertedBlock, 'start');
  return true;
}
