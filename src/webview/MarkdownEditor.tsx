import {
  BlockNoteSchema,
  createExtension,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  type BlockNoteEditor,
} from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import {
  DragHandleButton,
  SideMenu,
  SideMenuController,
  type SideMenuProps,
  useCreateBlockNote,
} from '@blocknote/react';
import { useEffect, useRef } from 'react';
import type { ItemSnapshot } from '../shared/contracts';
import { getCompletedChecklistMove, insertUncheckedChecklistAbove } from './checklist';

const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    quote: defaultBlockSpecs.quote,
    codeBlock: defaultBlockSpecs.codeBlock,
  },
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: {
    bold: defaultStyleSpecs.bold,
    italic: defaultStyleSpecs.italic,
    strike: defaultStyleSpecs.strike,
    code: defaultStyleSpecs.code,
  },
});

const insertChecklistAbove = createExtension({
  key: 'insertChecklistAbove',
  keyboardShortcuts: {
    'Mod-Alt-Enter': ({ editor }) => insertUncheckedChecklistAbove(editor),
  },
});

type MemoEditor = BlockNoteEditor<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;

function DragOnlySideMenu(props: SideMenuProps) {
  return (
    <SideMenu {...props}>
      <DragHandleButton {...props} />
    </SideMenu>
  );
}

interface MarkdownEditorProps {
  item: Extract<ItemSnapshot, { kind: 'markdown' }>;
  theme: 'light' | 'dark';
  onSave(id: string, content: string): void;
}

export function MarkdownEditor({ item, theme, onSave }: MarkdownEditorProps) {
  const editor = useCreateBlockNote({ schema, extensions: [insertChecklistAbove] });
  const saveRef = useRef(onSave);
  const timerRef = useRef<number | undefined>(undefined);
  const loadedIdRef = useRef<string | undefined>(undefined);

  saveRef.current = onSave;

  useEffect(() => {
    const blocks = editor.tryParseMarkdownToBlocks(item.content);
    editor.replaceBlocks(editor.document, blocks.length ? blocks : [{ type: 'paragraph' }]);
    loadedIdRef.current = item.id;
  }, [editor, item.id]);

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
        saveRef.current(item.id, editor.blocksToMarkdownLossy());
      }
    },
    [editor, item.id],
  );

  const saveSoon = (currentEditor: MemoEditor) => {
    if (loadedIdRef.current !== item.id) {
      return;
    }
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      saveRef.current(item.id, currentEditor.blocksToMarkdownLossy());
    }, 400);
  };

  return (
    <section className="editor-view" aria-label={`Editing ${item.title}`}>
      <div className="editor-canvas">
        <BlockNoteView
          editor={editor}
          theme={theme}
          onChange={(currentEditor, { getChanges }) => {
            const move = getCompletedChecklistMove(currentEditor.document, getChanges());
            if (move) {
              currentEditor.replaceBlocks(...move);
            }
            saveSoon(currentEditor);
          }}
          slashMenu
          sideMenu={false}
        >
          <SideMenuController sideMenu={DragOnlySideMenu} />
        </BlockNoteView>
      </div>
    </section>
  );
}
