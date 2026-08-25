interface VsCodeApi<State> {
  postMessage(message: unknown): void;
  getState(): State | undefined;
  setState(state: State): State;
}

declare function acquireVsCodeApi<State = unknown>(): VsCodeApi<State>;

export interface ViewState {
  tab: 'markdown' | 'snippet';
  query: string;
}

export const vscodeApi = acquireVsCodeApi<ViewState>();
