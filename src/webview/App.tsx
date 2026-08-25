import { useEffect, useMemo, useState } from 'react';
import { filterItems } from '../shared/filter';
import {
  isHostMessage,
  type ItemKind,
  type ItemSnapshot,
  type WebviewMessage,
} from '../shared/contracts';
import { MarkdownEditor } from './MarkdownEditor';
import { vscodeApi, type ViewState } from './vscode';

type Tab = ItemKind;

type ItemForm =
  | { kind: 'markdown'; title: string }
  | { kind: 'snippet'; title: string; language: string; id?: string };

function post(message: WebviewMessage): void {
  vscodeApi.postMessage(message);
}

function useVsCodeTheme(): 'light' | 'dark' {
  const detect = () => (document.body.classList.contains('vscode-light') ? 'light' : 'dark');
  const [theme, setTheme] = useState<'light' | 'dark'>(detect);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(detect()));
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export function App() {
  const restored = vscodeApi.getState();
  const [tab, setTab] = useState<Tab>(restored?.tab ?? 'markdown');
  const [query, setQuery] = useState(restored?.query ?? '');
  const [items, setItems] = useState<ItemSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [form, setForm] = useState<ItemForm>();
  const [message, setMessage] = useState<string>();
  const theme = useVsCodeTheme();

  useEffect(() => {
    let messageTimer: number | undefined;
    const listener = (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (!isHostMessage(message)) {
        return;
      }
      if (message.type === 'snapshot') {
        setItems(message.items);
        if (message.focusId) {
          const focusId = message.focusId;
          const focused = message.items.find((item) => item.id === focusId);
          if (focused?.kind === 'markdown') {
            setSelectedId(focused.id);
          }
        }
        return;
      }
      setMessage(message.message);
      if (messageTimer !== undefined) {
        window.clearTimeout(messageTimer);
      }
      messageTimer = window.setTimeout(() => setMessage(undefined), 2500);
    };

    window.addEventListener('message', listener);
    post({ type: 'ready' });
    return () => {
      window.removeEventListener('message', listener);
      if (messageTimer !== undefined) {
        window.clearTimeout(messageTimer);
      }
    };
  }, []);

  useEffect(() => {
    const state: ViewState = { tab, query };
    vscodeApi.setState(state);
    setSelectedId(undefined);
    setForm(undefined);
  }, [tab, query]);

  const visibleItems = useMemo(
    () => filterItems(items, query).filter((item) => item.kind === tab),
    [items, query, tab],
  );
  const selected = items.find(
    (item): item is Extract<ItemSnapshot, { kind: 'markdown' }> =>
      item.id === selectedId && item.kind === 'markdown',
  );

  const remove = (item: ItemSnapshot): boolean => {
    if (!window.confirm(`Delete “${item.title}”?`)) {
      return false;
    }
    post({ type: 'deleteItem', id: item.id });
    if (item.id === selectedId) {
      setSelectedId(undefined);
    }
    return true;
  };

  const submitForm = () => {
    if (!form?.title.trim()) {
      return;
    }
    if (form.kind === 'snippet' && form.id) {
      post({
        type: 'updateSnippet',
        id: form.id,
        title: form.title,
        language: form.language || 'plaintext',
      });
    } else {
      post({
        type: 'create',
        kind: form.kind,
        title: form.title,
        ...(form.kind === 'snippet' ? { language: form.language || 'plaintext' } : {}),
      });
    }
    setForm(undefined);
  };

  if (selected) {
    return (
      <MarkdownEditor
        item={selected}
        theme={theme}
        onBack={() => setSelectedId(undefined)}
        onDelete={() => remove(selected)}
        onSave={(id, title, content) => post({ type: 'saveMarkdown', id, title, content })}
      />
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-row">
          <div>
            <span className="eyebrow">PROFILE NOTEBOOK</span>
            <h1>Memo Dock</h1>
          </div>
          <button
            className="primary-button new-button"
            type="button"
            onClick={() =>
              setForm(
                tab === 'markdown'
                  ? { kind: 'markdown', title: '' }
                  : { kind: 'snippet', title: '', language: 'typescript' },
              )
            }
          >
            + New
          </button>
        </div>

        <div className="tabs" role="tablist" aria-label="Memo Dock sections">
          {(['markdown', 'snippet'] as const).map((itemTab) => (
            <button
              key={itemTab}
              role="tab"
              aria-selected={tab === itemTab}
              className={tab === itemTab ? 'tab active' : 'tab'}
              type="button"
              onClick={() => setTab(itemTab)}
            >
              {itemTab === 'markdown' ? 'Markdown' : 'Snippet'}
            </button>
          ))}
        </div>

        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or content"
            aria-label="Search title or content"
          />
        </label>
      </header>

      {form && (
        <section
          className="item-form"
          aria-label={form.kind === 'markdown' ? 'New Markdown document' : 'Snippet details'}
        >
          <input
            autoFocus
            value={form.title}
            maxLength={200}
            placeholder={form.kind === 'markdown' ? 'Document title' : 'Snippet title'}
            aria-label="Title"
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            onKeyDown={(event) => event.key === 'Enter' && submitForm()}
          />
          {form.kind === 'snippet' && (
            <input
              value={form.language}
              maxLength={100}
              list="language-suggestions"
              placeholder="VS Code language id"
              aria-label="VS Code language id"
              onChange={(event) => setForm({ ...form, language: event.target.value })}
              onKeyDown={(event) => event.key === 'Enter' && submitForm()}
            />
          )}
          <div className="form-actions">
            <button type="button" onClick={() => setForm(undefined)}>
              Cancel
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={submitForm}
              disabled={!form.title.trim()}
            >
              Save
            </button>
          </div>
        </section>
      )}

      <datalist id="language-suggestions">
        <option value="typescript" />
        <option value="javascript" />
        <option value="python" />
        <option value="json" />
        <option value="shellscript" />
        <option value="java" />
        <option value="csharp" />
        <option value="go" />
        <option value="rust" />
        <option value="plaintext" />
      </datalist>

      <section className="item-list" aria-label={`${tab} items`}>
        {visibleItems.length === 0 ? (
          <div className="empty-state">
            <span>
              {query ? 'No matches' : tab === 'markdown' ? 'No pages yet' : 'No snippets yet'}
            </span>
            <small>{query ? 'Try another keyword.' : 'Create the first item from + New.'}</small>
          </div>
        ) : (
          visibleItems.map((item) => (
            <article className="item-row" key={item.id}>
              <button
                className="item-main"
                type="button"
                onClick={() =>
                  item.kind === 'markdown'
                    ? setSelectedId(item.id)
                    : post({ type: 'openSnippet', id: item.id })
                }
              >
                <strong>{item.title}</strong>
                <span>{item.kind === 'snippet' ? item.language : summarize(item.content)}</span>
              </button>
              <div className="row-actions">
                {item.kind === 'snippet' && (
                  <>
                    <button
                      type="button"
                      onClick={() => post({ type: 'copySnippet', id: item.id })}
                      aria-label={`Copy ${item.title}`}
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          kind: 'snippet',
                          id: item.id,
                          title: item.title,
                          language: item.language,
                        })
                      }
                      aria-label={`Edit ${item.title} details`}
                    >
                      Edit
                    </button>
                  </>
                )}
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => remove(item)}
                  aria-label={`Delete ${item.title}`}
                >
                  ×
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </main>
  );
}

function summarize(content: string): string {
  return (
    content
      .replace(/[#>*_`\x5B\x5D-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 72) || 'Empty page'
  );
}
