export type BibleVersion = {
  id: string; // e.g., 'KJV'
  abbreviation: string; // e.g., 'KJV'
  name: string; // e.g., 'King James Version'
  language: Language;
  type: 'local' | 'api';
  source: string; // path for 'local', URL for 'api'
  copyright?: string;
};

export type Language = {
  code: string; // e.g., 'en'
  name: string; // e.g., 'English'
};

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ceb', name: 'Bisaya' },
];

export const BIBLE_VERSIONS: BibleVersion[] = [
  {
    id: 'KJV',
    abbreviation: 'KJV',
    name: 'King James Version',
    language: LANGUAGES[0],
    type: 'local',
    source: '@/data/bible/kjv.json',
    copyright: 'Public Domain',
  },
  {
    id: 'ASV',
    abbreviation: 'ASV',
    name: 'American Standard Version',
    language: LANGUAGES[0],
    type: 'local',
    source: '@/data/bible/asv.json',
    copyright: 'Public Domain',
  },
  {
    id: 'WEB',
    abbreviation: 'WEB',
    name: 'World English Bible',
    language: LANGUAGES[0],
    type: 'local',
    source: '@/data/bible/web.json',
    copyright: 'Public Domain',
  },
  {
    id: 'Ang Biblia',
    abbreviation: 'TAG',
    name: 'Ang Biblia (1905)',
    language: LANGUAGES[1],
    type: 'local',
    source: '@/data/bible/tagalog.json',
    copyright: 'Public Domain',
  },
  {
    id: 'Bisaya',
    abbreviation: 'CEB',
    name: 'Bugna, Bisaya',
    language: LANGUAGES[2],
    type: 'local',
    source: '@/data/bible/bisaya.json',
    copyright: 'Public Domain',
  },
  {
    id: 'NIV',
    abbreviation: 'NIV',
    name: 'New International Version',
    language: LANGUAGES[0],
    type: 'api',
    source: 'https://api.biblesupersearch.com/', // Example API
    copyright: 'Copyright © 1973, 1978, 1984, 2011 by Biblica',
  },
];
