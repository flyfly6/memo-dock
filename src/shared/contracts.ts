export type ItemKind = 'markdown' | 'snippet';

interface ItemBase {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkdownMetadata extends ItemBase {
  kind: 'markdown';
}

export interface SnippetMetadata extends ItemBase {
  kind: 'snippet';
  language: string;
}

export type ItemMetadata = MarkdownMetadata | SnippetMetadata;
export type ItemSnapshot = ItemMetadata & { content: string };

export type WebviewMessage =
  | { type: 'ready' }
  | { type: 'create'; kind: ItemKind; title: string; language?: string }
  | { type: 'saveMarkdown'; id: string; title: string; content: string }
  | { type: 'updateSnippet'; id: string; title: string; language: string }
  | { type: 'deleteItem'; id: string }
  | { type: 'openSnippet'; id: string }
  | { type: 'copySnippet'; id: string };

export type HostMessage =
  | { type: 'snapshot'; items: ItemSnapshot[]; focusId?: string }
  | { type: 'error'; message: string }
  | { type: 'notice'; message: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_TITLE_LENGTH = 200;
const MAX_LANGUAGE_LENGTH = 100;
const MAX_MARKDOWN_LENGTH = 2_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown, maxLength: number, allowEmpty = false): string | undefined {
  if (typeof value !== 'string' || value.length > maxLength) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || allowEmpty ? (allowEmpty ? value : normalized) : undefined;
}

function readId(value: unknown): string | undefined {
  return typeof value === 'string' && UUID_PATTERN.test(value) ? value : undefined;
}

export function isItemId(value: unknown): value is string {
  return readId(value) !== undefined;
}

export function parseWebviewMessage(value: unknown): WebviewMessage | undefined {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return undefined;
  }

  if (value.type === 'ready') {
    return { type: 'ready' };
  }

  if (value.type === 'create') {
    const title = readString(value.title, MAX_TITLE_LENGTH);
    const kind = value.kind === 'markdown' || value.kind === 'snippet' ? value.kind : undefined;
    if (!title || !kind) {
      return undefined;
    }
    if (kind === 'markdown') {
      return { type: 'create', kind, title };
    }
    const language = readString(value.language, MAX_LANGUAGE_LENGTH) ?? 'plaintext';
    return { type: 'create', kind, title, language };
  }

  const id = readId(value.id);
  if (!id) {
    return undefined;
  }

  switch (value.type) {
    case 'saveMarkdown': {
      const title = readString(value.title, MAX_TITLE_LENGTH);
      const content = readString(value.content, MAX_MARKDOWN_LENGTH, true);
      return title && content !== undefined
        ? { type: 'saveMarkdown', id, title, content }
        : undefined;
    }
    case 'updateSnippet': {
      const title = readString(value.title, MAX_TITLE_LENGTH);
      const language = readString(value.language, MAX_LANGUAGE_LENGTH);
      return title && language ? { type: 'updateSnippet', id, title, language } : undefined;
    }
    case 'deleteItem':
    case 'openSnippet':
    case 'copySnippet':
      return { type: value.type, id };
    default:
      return undefined;
  }
}

export function isHostMessage(value: unknown): value is HostMessage {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false;
  }
  if (value.type === 'snapshot') {
    return Array.isArray(value.items) && (value.focusId === undefined || isItemId(value.focusId));
  }
  return (value.type === 'error' || value.type === 'notice') && typeof value.message === 'string';
}
