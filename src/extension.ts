import * as vscode from 'vscode';
import { MemoDockProvider } from './host/provider';
import { MemoStore } from './host/store';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const store = new MemoStore(context.globalStorageUri);
  await store.initialize();

  const provider = new MemoDockProvider(context.extensionUri, store);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(MemoDockProvider.viewType, provider),
    vscode.workspace.onDidSaveTextDocument((document) =>
      provider.handleSavedDocument(document.uri),
    ),
  );
}

export function deactivate(): void {}
