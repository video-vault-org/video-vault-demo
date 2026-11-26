import type { Bootstrap, Language, PlainVideo } from './types';

interface DemoComment {
  commentId: string;
  displayName: string | null;
  content: Record<Language, string>;
  created: string;
  lastModified: string;
  edited: boolean;
  deleted: boolean;
}

const config: Bootstrap = {
  app: { title: 'VideoVault · Demo' },
  meta: {
    recorded: { withTime: false, useAsFilter: true },
    fields: [
      { key: 'people', name: { de: 'Personen', en: 'People' }, type: 'text', multiple: true, required: false, showInDetails: true, useAsFilter: true },
      { key: 'category', name: { de: 'Kategorie', en: 'Category' }, type: 'text', multiple: false, required: true, showInDetails: true, useAsFilter: true, options: ['Natur / Nature', 'Freizeit / Leisure'] },
      { key: 'location', name: { de: 'Ort', en: 'Location' }, type: 'text', multiple: false, required: false, showInDetails: true, useAsFilter: false }
    ],
    sorting: [
      { source: 'recorded', direction: 'desc' },
      { source: 'title', direction: 'asc' }
    ]
  }
};

const examples = [
  {
    id: 'lake',
    title: { de: 'Ein Sommer am See', en: 'A summer by the lake' },
    description: {
      de: 'Wasser, Berge und ein ruhiger Morgen. Diese animierte Landschaftsillustration zeigt, wie ein Video mit Beschreibung und eigenen Metadaten im gemeinsamen Archiv erscheint. Öffne die Details und sieh dir auch die Beispielkommentare an.',
      en: 'Water, mountains and a quiet morning. This animated landscape illustration shows how a video with a description and custom metadata appears in the shared archive. Open the details and explore the example comments.'
    },
    date: '2026-08-12',
    people: ['Alex', 'Sam'],
    category: 'Natur / Nature',
    location: { de: 'Am See', en: 'Lakeside' }
  },
  {
    id: 'mountains',
    title: { de: 'Unterwegs in den Bergen', en: 'A trip to the mountains' },
    description: {
      de: 'Zwischen Gipfeln und Wolken: eine kleine animierte Illustration als öffentliches Beispielvideo. Mit der Suche und dem Kategorienfilter lässt sich das Archiv eingrenzen.',
      en: 'Between peaks and clouds: a short animated illustration as a public example video. Use search and the category filter to narrow down the archive.'
    },
    date: '2026-07-24',
    people: ['Sam', 'Robin'],
    category: 'Natur / Nature',
    location: { de: 'In den Bergen', en: 'Mountains' }
  },
  {
    id: 'garden',
    title: { de: 'Ein Abend im Garten', en: 'An evening in the garden' },
    description: {
      de: 'Ein Platz im Grünen für gemeinsame Erinnerungen. Auch dieser kurze Clip ist eine eigens erstellte Demo-Illustration und enthält keine privaten Aufnahmen.',
      en: 'A green space for shared memories. This short clip is also an illustration created for the demo and contains no private recordings.'
    },
    date: '2026-06-09',
    people: ['Alex', 'Robin'],
    category: 'Freizeit / Leisure',
    location: { de: 'Im Garten', en: 'Garden' }
  }
];

/** Public, unencrypted illustrations: these records are not production credentials or archive data. */
const videos = function (language: Language): PlainVideo[] {
  return examples.map((item) => ({
    videoId: item.id,
    title: item.title[language],
    description: item.description[language],
    plainTitle: item.title[language],
    plainDescription: item.description[language],
    recorded: `${item.date}T00:00:00.000Z`,
    lastModified: `${item.date}T12:00:00.000Z`,
    meta: { people: [...item.people], category: item.category, location: item.location[language] },
    videoMimeType: 'video/mp4',
    thumbnailMimeType: 'image/jpeg',
    deleted: false
  }));
};

const comments: readonly DemoComment[] = [
  {
    commentId: 'c1',
    displayName: 'Alex',
    content: { de: 'So könnte eine gemeinsame Erinnerung aussehen.', en: 'This is what a shared memory could look like.' },
    created: '2026-08-12T12:00:00Z',
    lastModified: '2026-08-12T12:00:00Z',
    edited: false,
    deleted: false
  },
  {
    commentId: 'c2',
    displayName: 'Sam',
    content: { de: 'In der echten Anwendung sind auch Kommentare verschlüsselt.', en: 'In the real application, comments are encrypted too.' },
    created: '2026-08-12T12:05:00Z',
    lastModified: '2026-08-12T12:10:00Z',
    edited: true,
    deleted: false
  },
  { commentId: 'c3', displayName: null, content: { de: '', en: '' }, created: '2026-08-12T12:03:00Z', lastModified: '2026-08-12T12:09:00Z', edited: false, deleted: true },
  {
    commentId: 'c4',
    displayName: 'Robin',
    content: { de: 'Weitere Kommentare können seitenweise geladen werden.', en: 'More comments can be loaded one page at a time.' },
    created: '2026-08-12T12:01:00Z',
    lastModified: '2026-08-12T12:01:00Z',
    edited: false,
    deleted: false
  }
];

/** Return fresh paginated records in creation order; no mutable state is persisted. */
const commentPage = function (videoId: string, offset = 0, pageSize = 2): { comments: DemoComment[]; next: number | null } {
  if (!examples.some((item) => item.id === videoId)) return { comments: [], next: null };
  const ordered = [...comments].sort((a, b) => b.created.localeCompare(a.created));
  const end = offset + pageSize;
  return { comments: structuredClone(ordered.slice(offset, end)), next: end < ordered.length ? end : null };
};

const mediaPath = (videoId: string, kind: 'video' | 'thumbnail') => `/demo/${videoId}.${kind === 'video' ? 'mp4' : 'jpg'}`;

export { config, videos, commentPage, mediaPath };
export type { DemoComment };
