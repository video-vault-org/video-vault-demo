import { useMemo, useState } from 'react';
import { config, videos as demoVideos, mediaPath } from './lib/demo';
import { excerpt, filterVideos, formatValue, sortVideos } from './lib/catalog';
import type { PlainVideo } from './lib/types';
import { Dialog, Field, LanguageProvider, useLanguage } from './lib/ui';
import { VideoOverlay } from './components/VideoOverlay';
import { ThemeSelect } from './components/ThemeSelect';
import { Users } from './components/Users';

const WEBSITE = 'https://video-vault.de/';
const SECURITY = 'https://video-vault.de/SECURITY-ARCHITECTURE.html';

const Archive = function () {
  const { t, language } = useLanguage();
  const videos = useMemo(() => demoVideos(language), [language]);
  const [selected, setSelected] = useState<PlainVideo>(),
    [account, setAccount] = useState(false),
    [management, setManagement] = useState(false),
    [query, setQuery] = useState(''),
    [filters, setFilters] = useState<Record<string, string>>({}),
    [notice, setNotice] = useState('');
  const readOnly = t('In der schreibgeschützten Demo nicht verfügbar.', 'Unavailable in this read-only demo.');
  const filtered = useMemo(() => sortVideos(filterVideos(videos, query, filters, config.meta), config.meta), [videos, query, filters, config.meta]);
  return (
    <>
      <main className="archive">
        <div className="page-heading">
          <div>
            <span className="eyebrow">{t('DEIN DEMO-ARCHIV', 'YOUR DEMO ARCHIVE')}</span>
            <h1>{t('Geschichten, die bleiben.', 'Stories worth keeping.')}</h1>
            <p className="muted">
              {videos.length} {videos.length === 1 ? t('Video · öffentliche Beispieldaten', 'video · public sample data') : t('Videos · öffentliche Beispieldaten', 'videos · public sample data')}{' '}
            </p>
          </div>
          <div className="actions">
            <button onClick={() => setNotice(t('Die Beispieldaten sind bereits aktuell.', 'The bundled example data is already up to date.'))}>↻ {t('Aktualisieren', 'Refresh')}</button>
            <button className="primary" disabled title={readOnly}>
              ＋ {t('Video hinzufügen', 'Add video')}
            </button>
          </div>
        </div>
        <nav className="archive-nav">
          <button onClick={() => setAccount(true)}>{t('Mein Konto', 'My account')}</button>
          <button onClick={() => setManagement(true)}>{t('Benutzerverwaltung', 'User management')}</button>
          <span className="nav-spacer" />
          <button
            onClick={() => setNotice(t('Die Demo verwendet die mitgelieferte Anzeige-Konfiguration.', 'The demo uses its bundled display settings.'))}
            title={t('Aktuelle Einstellungen für Titel, Logos, Meta-Felder, Filter und Sortierung vom Server laden', 'Load the latest settings for the title, logos, metadata fields, filters and sorting from the server')}
          >
            {t('Anzeige-Einstellungen aktualisieren', 'Refresh display settings')}
          </button>
        </nav>
        <section className="filter-bar" aria-label={t('Suche und Filter', 'Search and filters')}>
          <label className="search">
            <span>⌕</span>
            <input type="search" aria-label={t('Videos durchsuchen', 'Search videos')} placeholder={t('In deinem Archiv suchen …', 'Search your archive …')} value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          {config.meta.recorded.useAsFilter && (
            <>
              <Field label={t('Aufgezeichnet ab', 'Recorded from')}>
                <input type="date" value={filters.recordedFrom ?? ''} onChange={(e) => setFilters({ ...filters, recordedFrom: e.target.value })} />
              </Field>
              <Field label={t('bis', 'to')}>
                <input type="date" value={filters.recordedTo ?? ''} onChange={(e) => setFilters({ ...filters, recordedTo: e.target.value })} />
              </Field>
            </>
          )}
          {config.meta.fields
            .filter((f) => f.useAsFilter)
            .map((f) => (
              <Field key={f.key} label={f.name[language]}>
                {f.options ? (
                  <select value={filters[`meta:${f.key}`] ?? ''} onChange={(event) => setFilters({ ...filters, [`meta:${f.key}`]: event.target.value })}>
                    <option value="">{t('Alle', 'All')}</option>
                    {f.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'boolean' ? (
                  <select value={filters[`meta:${f.key}`] ?? ''} onChange={(e) => setFilters({ ...filters, [`meta:${f.key}`]: e.target.value })}>
                    <option value="">{t('Alle', 'All')}</option>
                    <option value="true">{t('Ja', 'Yes')}</option>
                    <option value="false">{t('Nein', 'No')}</option>
                  </select>
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'datetime' ? 'datetime-local' : 'search'}
                    step="any"
                    value={filters[`meta:${f.key}`] ?? ''}
                    onChange={(e) => setFilters({ ...filters, [`meta:${f.key}`]: e.target.value })}
                  />
                )}
              </Field>
            ))}
          <button
            className="link-button"
            onClick={() => {
              setQuery('');
              setFilters({});
            }}
          >
            {t('Zurücksetzen', 'Reset')}
          </button>
        </section>
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        <div className="result-heading">
          <span>{t('ALLE AUFNAHMEN', 'ALL RECORDINGS')}</span>
          <span>
            {filtered.length} / {videos.length}
          </span>
        </div>
        <section className="video-grid">
          {filtered.map((v, index) => (
            <article className="video-card" key={v.videoId} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
              <button className="tile-preview" onClick={() => setSelected(v)} aria-label={`${t('Abspielen', 'Play')}: ${v.plainTitle}`}>
                <div className="thumbnail-frame">
                  <img src={mediaPath(v.videoId, 'thumbnail')} alt="" loading="lazy" />
                </div>
                <span className="play-glyph">▶</span>
              </button>
              <div className="card-body">
                <small className="recorded">{formatValue(v.recorded, { type: config.meta.recorded.withTime ? 'datetime' : 'date' }, language)}</small>
                <h2>{v.plainTitle}</h2>
                <p>{excerpt(v.plainDescription)}</p>
                <button className="link-button" onClick={() => setSelected(v)}>
                  {t('Mehr Details', 'More details')} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          ))}
        </section>
        {!filtered.length && (
          <div className="empty">
            <span>◇</span>
            <h2>{videos.length ? t('Keine passenden Videos', 'No matching videos') : t('Platz für deine Erinnerungen.', 'Room for your memories.')}</h2>
            <p>{t('Ändere die Suche oder setze die Filter zurück.', 'Change your search or reset the filters.')}</p>
          </div>
        )}
      </main>
      {selected && <VideoOverlay video={videos.find((video) => video.videoId === selected.videoId)!} close={() => setSelected(undefined)} />}
      {management && <Users close={() => setManagement(false)} />}
      {account && (
        <Dialog title={t('Mein Konto', 'My account')} close={() => setAccount(false)}>
          <p>{t('Du erkundest die Anwendung als Demo-Gast. Es gibt kein echtes Benutzerkonto und keine Anmeldung.', 'You are exploring as a demo guest. There is no real user account or sign-in.')}</p>
          <dl className="details">
            <div>
              <dt>{t('Anzeigename', 'Display name')}</dt>
              <dd>Demo</dd>
            </div>
            <div>
              <dt>{t('Benutzername', 'Username')}</dt>
              <dd>demo</dd>
            </div>
          </dl>
          <div className="actions">
            <button disabled title={readOnly}>
              {t('Anzeigenamen ändern', 'Change display name')}
            </button>
            <button disabled title={readOnly}>
              {t('Passwort ändern', 'Change password')}
            </button>
            <button disabled title={readOnly}>
              {t('Konto löschen', 'Delete account')}
            </button>
          </div>
          <p className="muted">{readOnly}</p>
        </Dialog>
      )}
    </>
  );
};

const Application = function () {
  const { t, language, setLanguage } = useLanguage();
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/">
          <img src="/logo.png" alt="" />
          <span>{config.app.title}</span>
        </a>
        <nav>
          <ThemeSelect />
          <a href={SECURITY} target="_blank" rel="noreferrer">
            {t('Sicherheitsarchitektur', 'Security architecture')} ↗
          </a>
          <button className="language" aria-label={t('Sprache wechseln', 'Change language')} onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}>
            {language === 'de' ? 'EN' : 'DE'}
          </button>
        </nav>
      </header>
      <aside className="notice demo-notice" aria-label={t('Demo-Hinweis', 'Demo notice')}>
        <strong>{t('Öffentliche Read-only-Demo', 'Public read-only demo')}</strong>
        <span>
          {t(
            'Ohne Anmeldung. Alle Inhalte sind frei zugängliche Beispiele. Hochladen und Änderungen sind deaktiviert. Anders als im echten Archiv sind diese Beispieldaten nicht verschlüsselt.',
            'No sign-in. All content is public sample data. Uploads and changes are disabled. Unlike a real archive, these examples are not encrypted.'
          )}
        </span>
      </aside>
      <Archive />
      <footer className="site-footer">
        <a href={WEBSITE} target="_blank" rel="noreferrer">
          <img src="/videovault-logo.png" alt="" />
          Powered by <strong>VideoVault</strong> ↗
        </a>
        <span>{t('Beispieldaten · Nur zum Ausprobieren', 'Sample data · For exploration only')}</span>
      </footer>
    </div>
  );
};

const App = function () {
  return (
    <LanguageProvider>
      <Application />
    </LanguageProvider>
  );
};

export { WEBSITE };
export default App;
