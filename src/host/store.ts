import { randomUUID } from 'node:crypto';
import * as vscode from 'vscode';
import {
  isItemId,
  type ItemKind,
  type ItemMetadata,
  type ItemSnapshot,
  type MarkdownMetadata,
  type SnippetMetadata,
} from '../shared/contracts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function isMetadata(value: unknown): value is ItemMetadata {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  const common =
    isItemId(item.id) &&
    typeof item.title === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string';
  if (!common) {
    return false;
  }
  return item.kind === 'markdown' || (item.kind === 'snippet' && typeof item.language === 'string');
}

function isFileNotFound(error: unknown): boolean {
  return error instanceof vscode.FileSystemError && error.code === 'FileNotFound';
}

export class MemoStore {
  private readonly indexUri: vscode.Uri;
  private readonly markdownRoot: vscode.Uri;
  private readonly snippetRoot: vscode.Uri;

  constructor(private readonly root: vscode.Uri) {
    this.indexUri = vscode.Uri.joinPath(root, 'index.json');
    this.markdownRoot = vscode.Uri.joinPath(root, 'markdown');
    this.snippetRoot = vscode.Uri.joinPath(root, 'snippets');
  }

  async initialize(): Promise<void> {
    await Promise.all([
      vscode.workspace.fs.createDirectory(this.root),
      vscode.workspace.fs.createDirectory(this.markdownRoot),
      vscode.workspace.fs.createDirectory(this.snippetRoot),
    ]);
  }

  async list(): Promise<ItemSnapshot[]> {
    const metadata = await this.readIndex();
    const items = await Promise.all(
      metadata.map(async (item): Promise<ItemSnapshot | undefined> => {
        try {
          return { ...item, content: await this.readBody(item) };
        } catch (error) {
          if (isFileNotFound(error)) {
            return undefined;
          }
          throw error;
        }
      }),
    );

    return items
      .filter((item): item is ItemSnapshot => item !== undefined)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async create(kind: ItemKind, title: string, language = 'plaintext'): Promise<ItemSnapshot> {
    const now = new Date().toISOString();
    const id = randomUUID();
    const metadata: ItemMetadata =
      kind === 'markdown'
        ? { id, kind, title, createdAt: now, updatedAt: now }
        : { id, kind, title, language, createdAt: now, updatedAt: now };

    await vscode.workspace.fs.writeFile(this.bodyUri(metadata), encoder.encode(''));
    const index = await this.readIndex();
    await this.writeIndex([...index, metadata]);
    return { ...metadata, content: '' };
  }

  async saveMarkdown(id: string, title: string, content: string): Promise<void> {
    const index = await this.readIndex();
    const position = index.findIndex((item) => item.id === id && item.kind === 'markdown');
    if (position < 0) {
      throw new Error('Markdown document not found.');
    }

    const current = index[position] as MarkdownMetadata;
    const updated: MarkdownMetadata = { ...current, title, updatedAt: new Date().toISOString() };
    await vscode.workspace.fs.writeFile(this.bodyUri(updated), encoder.encode(content));
    index[position] = updated;
    await this.writeIndex(index);
  }

  async updateSnippet(id: string, title: string, language: string): Promise<void> {
    const index = await this.readIndex();
    const position = index.findIndex((item) => item.id === id && item.kind === 'snippet');
    if (position < 0) {
      throw new Error('Snippet not found.');
    }

    const current = index[position] as SnippetMetadata;
    index[position] = { ...current, title, language, updatedAt: new Date().toISOString() };
    await this.writeIndex(index);
  }

  async delete(id: string): Promise<void> {
    const index = await this.readIndex();
    const item = index.find((entry) => entry.id === id);
    if (!item) {
      return;
    }

    try {
      await vscode.workspace.fs.delete(this.bodyUri(item));
    } catch (error) {
      if (!isFileNotFound(error)) {
        throw error;
      }
    }
    await this.writeIndex(index.filter((entry) => entry.id !== id));
  }

  async getSnippet(
    id: string,
  ): Promise<{ metadata: SnippetMetadata; uri: vscode.Uri; content: string }> {
    const metadata = (await this.readIndex()).find(
      (item): item is SnippetMetadata => item.id === id && item.kind === 'snippet',
    );
    if (!metadata) {
      throw new Error('Snippet not found.');
    }
    return { metadata, uri: this.bodyUri(metadata), content: await this.readBody(metadata) };
  }

  async isManagedSnippetUri(uri: vscode.Uri): Promise<boolean> {
    if (uri.scheme !== this.snippetRoot.scheme || uri.authority !== this.snippetRoot.authority) {
      return false;
    }
    const prefix = `${this.snippetRoot.path.replace(/\/$/, '')}/`;
    if (!uri.path.startsWith(prefix) || !uri.path.endsWith('.txt')) {
      return false;
    }
    const id = uri.path.slice(prefix.length, -4);
    return (
      isItemId(id) &&
      (await this.readIndex()).some((item) => item.kind === 'snippet' && item.id === id)
    );
  }

  private bodyUri(item: ItemMetadata): vscode.Uri {
    return vscode.Uri.joinPath(
      item.kind === 'markdown' ? this.markdownRoot : this.snippetRoot,
      `${item.id}.${item.kind === 'markdown' ? 'md' : 'txt'}`,
    );
  }

  private async readBody(item: ItemMetadata): Promise<string> {
    return decoder.decode(await vscode.workspace.fs.readFile(this.bodyUri(item)));
  }

  private async readIndex(): Promise<ItemMetadata[]> {
    try {
      const parsed: unknown = JSON.parse(
        decoder.decode(await vscode.workspace.fs.readFile(this.indexUri)),
      );
      if (!Array.isArray(parsed) || !parsed.every(isMetadata)) {
        throw new Error('Memo Dock index is invalid.');
      }
      return parsed;
    } catch (error) {
      if (isFileNotFound(error)) {
        return [];
      }
      throw error;
    }
  }

  private async writeIndex(index: ItemMetadata[]): Promise<void> {
    await vscode.workspace.fs.writeFile(
      this.indexUri,
      encoder.encode(`${JSON.stringify(index, null, 2)}\n`),
    );
  }
}
