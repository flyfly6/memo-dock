import '@mantine/core/styles.css';
import '@blocknote/mantine/style.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Memo Dock root element is missing.');
}

createRoot(root).render(<App />);
