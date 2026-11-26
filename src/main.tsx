import { createRoot } from 'react-dom/client';
import App from './App';
import { applyTheme, getTheme } from './lib/theme';
import './styles.css';

applyTheme(getTheme());
createRoot(document.getElementById('root')!).render(<App />);
if ('serviceWorker' in navigator && import.meta.env.PROD)
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {
    // Static playback works without a service worker; only offline caching is unavailable.
  });
