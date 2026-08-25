import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import { parseWebviewMessage, type HostMessage } from '../shared/contracts';
import { MemoStore } from './store';

export class MemoDockProvider implements vscode.WebviewViewProvider {
  static readonly viewType = 'memoDock.sidebar';

  private view: vscode.WebviewView | undefined;
  // ponytail: one queue is enough for profile-local MVP writes; split by document only if throughput matters.
  private operation: Promise<void> = Promise.resolve();

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly store: MemoStore,
  ) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    const distRoot = vscode.Uri.joinPath(this.extensionUri, 'dist');
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [distRoot],
    };
    view.webview.html = this.getHtml(view.webview, distRoot);
    view.webview.onDidReceiveMessage((value: unknown) => {
      this.operation = this.operation
        .then(() => this.handleMessage(value))
        .catch((error: unknown) => this.reportError(error));
    });
  }

  async refresh(focusId?: string): Promise<void> {
    await this.post({ type: 'snapshot', items: await this.store.list(), focusId });
  }

  handleSavedDocument(uri: vscode.Uri): void {
    this.operation = this.operation
      .then(async () => {
        if (await this.store.isManagedSnippetUri(uri)) {
          await this.refresh();
        }
      })
      .catch((error: unknown) => this.reportError(error));
  }

  private async handleMessage(value: unknown): Promise<void> {
    const message = parseWebviewMessage(value);
    if (!message) {
      throw new Error('Memo Dock received an invalid request.');
    }

    switch (message.type) {
      case 'ready':
        await this.refresh();
        return;
      case 'create': {
        const created = await this.store.create(message.kind, message.title, message.language);
        await this.refresh(created.id);
        if (created.kind === 'snippet') {
          await this.openSnippet(created.id);
        }
        return;
      }
      case 'saveMarkdown':
        await this.store.saveMarkdown(message.id, message.title, message.content);
        await this.refresh();
        return;
      case 'updateSnippet':
        await this.store.updateSnippet(message.id, message.title, message.language);
        await this.refresh();
        return;
      case 'deleteItem':
        await this.store.delete(message.id);
        await this.refresh();
        return;
      case 'openSnippet':
        await this.openSnippet(message.id);
        return;
      case 'copySnippet': {
        const snippet = await this.store.getSnippet(message.id);
        await vscode.env.clipboard.writeText(snippet.content);
        await this.post({ type: 'notice', message: 'Snippet copied.' });
        return;
      }
      default:
        this.assertNever(message);
    }
  }

  private async openSnippet(id: string): Promise<void> {
    const snippet = await this.store.getSnippet(id);
    let document = await vscode.workspace.openTextDocument(snippet.uri);
    const languages = await vscode.languages.getLanguages();
    if (
      languages.includes(snippet.metadata.language) &&
      document.languageId !== snippet.metadata.language
    ) {
      try {
        document = await vscode.languages.setTextDocumentLanguage(
          document,
          snippet.metadata.language,
        );
      } catch {
        // The file remains editable as plaintext if an installed language provider rejects the id.
      }
    }
    await vscode.window.showTextDocument(document, { preview: false });
  }

  private async post(message: HostMessage): Promise<void> {
    await this.view?.webview.postMessage(message);
  }

  private async reportError(error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : 'Memo Dock operation failed.';
    await this.post({ type: 'error', message });
  }

  private getHtml(webview: vscode.Webview, distRoot: vscode.Uri): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(distRoot, 'webview.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(distRoot, 'webview.css'));
    const nonce = randomBytes(16).toString('base64');

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <link rel="stylesheet" href="${styleUri}" />
    <title>Memo Dock</title>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
  }

  private assertNever(message: never): never {
    throw new Error(`Unhandled message: ${JSON.stringify(message)}`);
  }
}
