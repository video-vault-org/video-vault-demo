import { useState } from 'react';
import type { PlainVideo } from '../lib/types';
import { config, mediaPath } from '../lib/demo';
import { formatValue } from '../lib/catalog';
import { Dialog, useLanguage } from '../lib/ui';
import { Comments } from './Comments';

const VideoOverlay = function ({ video, close }: { video: PlainVideo; close: () => void }) {
  const { t, language } = useLanguage();
  const [comments, setComments] = useState(false);
  const src = mediaPath(video.videoId, 'video');
  const readOnly = t('In der schreibgeschützten Demo nicht verfügbar.', 'Unavailable in this read-only demo.');

  return (
    <>
      <Dialog title={video.plainTitle} close={close}>
        <div className="video-stage">
          <video controls playsInline preload="metadata" src={src} poster={mediaPath(video.videoId, 'thumbnail')} />
        </div>
        <div className="actions">
          <a className="button" href={src} download={`${video.plainTitle}.mp4`}>
            {t('Herunterladen', 'Download')}
          </a>
          <button onClick={() => setComments(true)}>{t('Kommentare', 'Comments')}</button>
          <button disabled title={readOnly}>
            {t('Bearbeiten', 'Edit')}
          </button>
          <button disabled className="danger" title={readOnly}>
            {t('Löschen', 'Delete')}
          </button>
        </div>
        <p className="recorded">{formatValue(video.recorded, { type: 'date' }, language)}</p>
        <p className="prewrap">{video.plainDescription}</p>
        <dl className="details">
          {config.meta.fields
            .filter((field) => field.showInDetails)
            .map((field) => (
              <div key={field.key}>
                <dt>{field.name[language]}</dt>
                <dd>{formatValue(video.meta[field.key], field, language)}</dd>
              </div>
            ))}
        </dl>
        <p className="muted">
          {t('Öffentlicher Beispielclip: animierte Illustration, keine private Aufnahme. Änderungen sind in dieser Demo deaktiviert.', 'Public example clip: an animated illustration, not a private recording. Changes are disabled in this demo.')}
        </p>
      </Dialog>
      {comments && <Comments videoId={video.videoId} close={() => setComments(false)} />}
    </>
  );
};

export { VideoOverlay };
