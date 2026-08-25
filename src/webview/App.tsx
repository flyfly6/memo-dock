import {
  ActionIcon,
  Autocomplete,
  Button,
  createTheme,
  MantineProvider,
  Modal,
  Notification,
  Tabs,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
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

type SnippetForm = { title: string; language: string; id?: string };
type SnippetSnapshot = Extract<ItemSnapshot, { kind: 'snippet' }>;

const LANGUAGE_OPTIONS = [
  'typescript',
  'javascript',
  'python',
  'json',
  'shellscript',
  'java',
  'csharp',
  'go',
  'rust',
  'plaintext',
];

const MANTINE_THEME = createTheme({
  fontFamily: 'var(--vscode-font-family)',
  fontFamilyMonospace: 'var(--vscode-editor-font-family)',
  components: {
    ActionIcon: ActionIcon.extend({ defaultProps: { size: 'xs' } }),
    Autocomplete: Autocomplete.extend({ defaultProps: { size: 'xs' } }),
    Button: Button.extend({ defaultProps: { size: 'xs' } }),
    TextInput: TextInput.extend({ defaultProps: { size: 'xs' } }),
  },
});

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
  const [tab, setTab] = useState<ItemKind>(restored?.tab ?? 'markdown');
  const [query, setQuery] = useState(restored?.query ?? '');
  const [items, setItems] = useState<ItemSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<SnippetForm>();
  const [deleteTarget, setDeleteTarget] = useState<SnippetSnapshot>();
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
        setLoaded(true);
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
    setForm(undefined);
  }, [tab, query]);

  const markdown = items.find(
    (item): item is Extract<ItemSnapshot, { kind: 'markdown' }> => item.kind === 'markdown',
  );
  const snippets = useMemo(
    () =>
      filterItems(items, query).filter(
        (item): item is Extract<ItemSnapshot, { kind: 'snippet' }> => item.kind === 'snippet',
      ),
    [items, query],
  );

  const removeSnippet = () => {
    if (deleteTarget) {
      post({ type: 'deleteSnippet', id: deleteTarget.id });
      setDeleteTarget(undefined);
    }
  };

  const submitForm = () => {
    if (!form?.title.trim()) {
      return;
    }
    if (form.id) {
      post({
        type: 'updateSnippet',
        id: form.id,
        title: form.title,
        language: form.language || 'plaintext',
      });
    } else {
      post({
        type: 'createSnippet',
        title: form.title,
        language: form.language || 'plaintext',
      });
    }
    setForm(undefined);
  };

  return (
    <MantineProvider theme={MANTINE_THEME} forceColorScheme={theme} cssVariablesSelector=":root">
      <main className="app-shell">
        <header className="app-header">
          <Tabs
            className="tab-navigation"
            value={tab}
            onChange={(value) => {
              if (value === 'markdown' || value === 'snippet') {
                setTab(value);
              }
            }}
          >
            <Tabs.List aria-label="Memo Dock sections">
              <Tabs.Tab value="markdown">Markdown</Tabs.Tab>
              <Tabs.Tab value="snippet">Snippets</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </header>

        {tab === 'markdown' ? (
          markdown ? (
            <MarkdownEditor
              item={markdown}
              theme={theme}
              onSave={(id, content) => post({ type: 'saveMarkdown', id, content })}
            />
          ) : (
            <div className="loading-state" role="status">
              {loaded ? 'Markdown document unavailable' : 'Loading editor…'}
            </div>
          )
        ) : (
          <section className="snippet-view" aria-label="Snippets">
            <div className="snippet-tools">
              <TextInput
                className="search-field"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search snippets"
                aria-label="Search snippets"
                leftSection={<IconSearch size={14} stroke={1.75} aria-hidden="true" />}
                leftSectionPointerEvents="none"
              />
              <Button
                className="new-button"
                leftSection={<IconPlus size={14} stroke={2} aria-hidden="true" />}
                onClick={() => setForm({ title: '', language: 'typescript' })}
              >
                New
              </Button>
            </div>

            {form && (
              <section className="item-form" aria-label="Snippet details">
                <TextInput
                  label="Title"
                  autoFocus
                  value={form.title}
                  maxLength={200}
                  placeholder="Snippet title"
                  onChange={(event) => setForm({ ...form, title: event.currentTarget.value })}
                  onKeyDown={(event) => event.key === 'Enter' && submitForm()}
                />
                <Autocomplete
                  label="Language"
                  value={form.language}
                  maxLength={100}
                  data={LANGUAGE_OPTIONS}
                  placeholder="VS Code language id"
                  onChange={(language) => setForm({ ...form, language })}
                  comboboxProps={{ withinPortal: false }}
                />
                <div className="form-actions">
                  <Button variant="subtle" onClick={() => setForm(undefined)}>
                    Cancel
                  </Button>
                  <Button onClick={submitForm} disabled={!form.title.trim()}>
                    {form.id ? 'Update' : 'Create'}
                  </Button>
                </div>
              </section>
            )}

            <section className="item-list" aria-label="Snippet items">
              {snippets.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-mark" aria-hidden="true">
                    {'{ }'}
                  </span>
                  <strong>{query ? 'No matches' : 'No snippets yet'}</strong>
                  <small>
                    {query ? 'Try another keyword.' : 'Save reusable code without leaving VS Code.'}
                  </small>
                  {!query && (
                    <Button
                      variant="subtle"
                      onClick={() => setForm({ title: '', language: 'typescript' })}
                    >
                      Create first snippet
                    </Button>
                  )}
                </div>
              ) : (
                snippets.map((item) => (
                  <article className="item-row" key={item.id}>
                    <UnstyledButton
                      className="item-main"
                      onClick={() => post({ type: 'openSnippet', id: item.id })}
                    >
                      <span className="snippet-language">{item.language}</span>
                      <strong>{item.title}</strong>
                      <span className="snippet-preview">{summarize(item.content)}</span>
                    </UnstyledButton>
                    <div className="row-actions">
                      <Button
                        variant="subtle"
                        onClick={() => post({ type: 'copySnippet', id: item.id })}
                        aria-label={`Copy ${item.title}`}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="subtle"
                        onClick={() =>
                          setForm({
                            id: item.id,
                            title: item.title,
                            language: item.language,
                          })
                        }
                        aria-label={`Edit ${item.title} details`}
                      >
                        Edit
                      </Button>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.title}`}
                      >
                        ×
                      </ActionIcon>
                    </div>
                  </article>
                ))
              )}
            </section>
          </section>
        )}

        <Modal
          opened={deleteTarget !== undefined}
          onClose={() => setDeleteTarget(undefined)}
          title="Delete snippet?"
          centered
          size="xs"
        >
          <p className="confirm-copy">Delete “{deleteTarget?.title}”? This cannot be undone.</p>
          <div className="form-actions">
            <Button variant="subtle" onClick={() => setDeleteTarget(undefined)}>
              Cancel
            </Button>
            <Button color="red" onClick={removeSnippet}>
              Delete
            </Button>
          </div>
        </Modal>

        {message && (
          <Notification className="toast" role="status" withCloseButton={false}>
            {message}
          </Notification>
        )}
      </main>
    </MantineProvider>
  );
}

function summarize(content: string): string {
  return content.replace(/\s+/g, ' ').trim().slice(0, 72) || 'Empty snippet';
}
