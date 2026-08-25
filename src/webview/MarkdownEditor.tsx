import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  type BlockNoteEditor,
} from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect, useRef, useState } from 'react';
import type { ItemSnapshot } from '../shared/contracts';

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

type MemoEditor = BlockNoteEditor<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;

interface MarkdownEditorProps {
  item: Extract<ItemSnapshot, { kind: 'markdown' }>;
  theme: 'light' | 'dark';
  onBack(): void;
  onDelete(id: string): boolean;
  onSave(id: string, title: string, content: string): void;
}

export function MarkdownEditor({ item, theme, onBack, onDelete, onSave }: MarkdownEditorProps) {
  const editor = useCreateBlockNote({ schema });
  const [title, setTitle] = useState(item.title);
  const titleRef = useRef(title);
  const saveRef = useRef(onSave);
  const timerRef = useRef<number | undefined>(undefined);
  const loadedIdRef = useRef<string | undefined>(undefined);
  const discardPendingSaveRef = useRef(false);

  titleRef.current = title;
  saveRef.current = onSave;

  useEffect(() => {
    setTitle(item.title);
    const blocks = editor.tryParseMarkdownToBlocks(item.content);
    editor.replaceBlocks(editor.document, blocks.length ? blocks : [{ type: 'paragraph' }]);
    loadedIdRef.current = item.id;
  }, [editor, item.id]);

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
        if (!discardPendingSaveRef.current) {
          saveRef.current(item.id, normalizedTitle(), editor.blocksToMarkdownLossy());
        }
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
      saveRef.current(item.id, normalizedTitle(), currentEditor.blocksToMarkdownLossy());
    }, 400);
  };

  const saveTitle = () => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    const title = normalizedTitle();
    setTitle(title);
    titleRef.current = title;
    saveRef.current(item.id, title, editor.blocksToMarkdownLossy());
  };

  const deleteDocument = () => {
    if (!onDelete(item.id)) {
      return;
    }
    discardPendingSaveRef.current = true;
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const normalizedTitle = () => titleRef.current.trim() || 'Untitled';

  return (
    <section className="editor-view" aria-label={`Editing ${item.title}`}>
      <div className="editor-toolbar">
        <button
          className="icon-button"
          type="button"
          onClick={onBack}
          aria-label="Back to documents"
        >
          ←
        </button>
        <input
          className="title-input"
          aria-label="Document title"
          value={title}
          maxLength={200}
          onChange={(event) => {
            setTitle(event.target.value);
            titleRef.current = event.target.value;
          }}
          onBlur={saveTitle}
        />
        <button
          className="icon-button danger-button"
          type="button"
          onClick={deleteDocument}
          aria-label="Delete document"
        >
          ×
        </button>
      </div>
      <div className="editor-canvas">
        <BlockNoteView
          editor={editor}
          theme={theme}
          onChange={() => saveSoon(editor)}
          slashMenu
          sideMenu
        />
      </div>
    </section>
  );
}
