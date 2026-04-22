export type BibleVersion = {
  id: string;
  abbreviation: string;
  name: string;
  language: Language;
  type: 'online-json';
  source: string; // URL to the JSON file
  format: 'nested-array' | 'flat-object-array';
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
    type: 'online-json',
    source:
      'https://raw.githubusercontent.com/Bible-api/Bible-api/master/bibles/en/kjv.json',
    format: 'nested-array',
    copyright: 'Public Domain',
  },
  {
    id: 'ASV',
    abbreviation: 'ASV',
    name: 'American Standard Version',
    language: LANGUAGES[0],
    type: 'online-json',
    source:
      'https://raw.githubusercontent.com/Bible-api/Bible-api/master/bibles/en/asv.json',
    format: 'nested-array',
    copyright: 'Public Domain',
  },
  {
    id: 'WEB',
    abbreviation: 'WEB',
    name: 'World English Bible',
    language: LANGUAGES[0],
    type: 'online-json',
    source:
      'https://raw.githubusercontent.com/Bible-api/Bible-api/master/bibles/en/web.json',
    format: 'nested-array',
    copyright: 'Public Domain',
  },
  {
    id: 'Ang Biblia',
    abbreviation: 'TAG',
    name: 'Ang Biblia (1905)',
    language: LANGUAGES[1],
    type: 'online-json',
    source:
      'https://raw.githubusercontent.com/rivermont/filipino-bibles/master/json/AngBiblia.json',
    format: 'flat-object-array',
    copyright: 'Public Domain',
  },
  {
    id: 'Bisaya',
    abbreviation: 'CEB',
    name: 'Bugna, Bisaya',
    language: LANGUAGES[2],
    type: 'online-json',
    source:
      'https://raw.githubusercontent.com/rivermont/cebuano-bibles/master/json/Bugna.json',
    format: 'flat-object-array',
    copyright: 'Public Domain',
  },
];
