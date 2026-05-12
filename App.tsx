import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import { ClientView } from './components/ClientView';
import { AdminView } from './components/AdminView';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CLIENT);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div
      key={`${mode}-${isDarkMode ? 'dark' : 'light'}`}
      className="max-w-md mx-auto min-h-screen shadow-2xl relative overflow-hidden animate-fade-in"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      {/* Top-right controls — grouped, aligned */}
      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Alternar tema"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </button>

        {/* Admin toggle */}
        <button
          onClick={() => setMode(mode === AppMode.CLIENT ? AppMode.ADMIN : AppMode.CLIENT)}
          className="h-8 px-3 rounded-full flex items-center transition-all hover:opacity-80 text-[10px] font-medium uppercase tracking-widest"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          {mode === AppMode.CLIENT ? 'Admin' : 'Sair'}
        </button>
      </div>

      {mode === AppMode.CLIENT ? (
        <ClientView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      ) : (
        <AdminView />
      )}
    </div>
  );
};

export default App;
