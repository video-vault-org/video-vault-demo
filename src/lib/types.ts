type Language = 'de' | 'en';

interface MetaField {
  key: string;
  name: Record<Language, string>;
  type: 'text' | 'number' | 'boolean' | 'date' | 'datetime';
  multiple: boolean;
  required: boolean;
  showInDetails: boolean;
  useAsFilter: boolean;
  options?: string[];
}

interface Bootstrap {
  app: { title: string };
  meta: {
    recorded: { withTime: boolean; useAsFilter: boolean };
    fields: MetaField[];
    sorting: ({ source: 'title'; direction: 'asc' | 'desc' } | { source: 'recorded'; direction: 'asc' | 'desc' } | { source: 'meta'; key: string; direction: 'asc' | 'desc' })[];
  };
}

interface Video {
  videoId: string;
  title: string;
  description: string;
  meta: Record<string, unknown>;
  videoMimeType: string;
  thumbnailMimeType: string;
  recorded: string;
  lastModified: string;
  deleted: boolean;
}

interface PlainVideo extends Video {
  plainTitle: string;
  plainDescription: string;
}

export { Language, MetaField, Bootstrap, Video, PlainVideo };
