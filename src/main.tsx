if (typeof window !== 'undefined') {
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }
  try {
    let currentFetch = window.fetch.bind(window);
    Object.defineProperty(window, 'fetch', {
      get() {
        return currentFetch;
      },
      set(v) {
        if (typeof v === 'function') {
          currentFetch = v;
        }
      },
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // ignore
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
