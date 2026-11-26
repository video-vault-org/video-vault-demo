import { useState } from 'react';
import { commentPage } from '../lib/demo';
import { Dialog, useLanguage } from '../lib/ui';

const Comments = function ({ videoId, close }: { videoId: string; close: () => void }) {
  const { t, language } = useLanguage();
  const [pages, setPages] = useState(1);
  const page = commentPage(videoId, 0, pages * 2);
  const readOnly = t('In der schreibgeschützten Demo nicht verfügbar.', 'Unavailable in this read-only demo.');

  return (
    <Dialog title={t('Kommentare', 'Comments')} close={close}>
      <p className="muted">{t('Beispielkommentare – nur zum Lesen.', 'Example comments – read only.')}</p>
      <div className="comments">
        {page.comments.map((comment) => (
          <article className={`comment ${comment.deleted ? 'tombstone' : ''}`} key={comment.commentId}>
            <small>
              {comment.displayName ?? t('[Gelöschter Nutzer]', '[Deleted user]')} · {new Date(comment.created).toLocaleString(language)}
              {comment.edited && (
                <>
                  {' '}
                  {t('· bearbeitet', '· edited')} <time dateTime={comment.lastModified}>{new Date(comment.lastModified).toLocaleString(language)}</time>
                </>
              )}
            </small>
            <p className="prewrap">{comment.deleted ? t('Gelöscht', 'Deleted') : comment.content[language]}</p>
            {!comment.deleted && (
              <div className="actions">
                <button disabled title={readOnly}>
                  {t('Bearbeiten', 'Edit')}
                </button>
                <button disabled title={readOnly}>
                  {t('Löschen', 'Delete')}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {page.next !== null && <button onClick={() => setPages(pages + 1)}>{t('Weitere Kommentare laden', 'Load more comments')}</button>}
      <label className="field">
        <span>{t('Dein Kommentar', 'Your comment')}</span>
        <textarea disabled rows={3} placeholder={readOnly} />
      </label>
      <button className="primary" disabled title={readOnly}>
        {t('Speichern', 'Save')}
      </button>
    </Dialog>
  );
};

export { Comments };
