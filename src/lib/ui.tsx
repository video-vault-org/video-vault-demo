import { createContext, useContext, useState, useId, Children, isValidElement, cloneElement, type ReactNode } from 'react';
import type { Language } from './types';

type T = (de: string, en: string) => string;

const LanguageContext = createContext<{ language: Language; t: T; setLanguage: (language: Language) => void }>({
  language: 'de',

  t: (de) => de,

  setLanguage: () => {}
});

const LanguageProvider = function ({ children }: { children: ReactNode }) {
  const [language, set] = useState<Language>(localStorage.getItem('videovault.demo.language') === 'en' ? 'en' : 'de');

  const setLanguage = (value: Language) => {
    localStorage.setItem('videovault.demo.language', value);
    document.documentElement.lang = value;
    set(value);
  };

  return <LanguageContext.Provider value={{ language, t: (de, en) => (language === 'de' ? de : en), setLanguage }}>{children}</LanguageContext.Provider>;
};

const useLanguage = () => useContext(LanguageContext);

const errorText = (_error: unknown, t: T) => t('Vorgang fehlgeschlagen.', 'Operation failed.');

const useTask = function () {
  const { t } = useLanguage();
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');

  const run = async function (action: () => Promise<void>) {
    setPending(true);
    setError('');
    try {
      await action();
      return true;
    } catch (e) {
      setError(errorText(e, t));
      return false;
    } finally {
      setPending(false);
    }
  };

  return { pending, error, run, setError };
};

const ErrorMessage = function ({ text }: { text: string }) {
  return text ? (
    <p className="notice error" role="alert">
      {text}
    </p>
  ) : null;
};

const Dialog = function ({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div
      className="scrim"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === 'Escape') close();
          if (e.key === 'Tab') {
            const items = e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea, a[href]');
            const first = items[0],
              last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <header>
          <h2>{title}</h2>
          <button autoFocus className="icon-button" onClick={close} aria-label={t('Schließen', 'Close')}>
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
};

const Field = function ({ label, children }: { label: string; children: ReactNode }) {
  const id = useId(),
    items = Children.toArray(children);
  const first = items.findIndex((child) => isValidElement(child) && child.type !== 'small');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {items.map((child, index) => (index === first && isValidElement<{ id?: string }>(child) ? cloneElement(child, { id }) : child))}
    </div>
  );
};

export { T, LanguageProvider, useLanguage, errorText, useTask, ErrorMessage, Dialog, Field };
