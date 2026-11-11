import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/battambang/400.css';
import '@fontsource/battambang/700.css';
import './styles/index.css';
import App from './App.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { ScanProvider } from './context/ScanContext.jsx';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <ScanProvider>
          <ScrollToTop />
          <App />
        </ScanProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);
