import { createRoot } from 'react-dom/client';
import './styles/reset.css';
import './styles/ui.css';
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(<App />);
