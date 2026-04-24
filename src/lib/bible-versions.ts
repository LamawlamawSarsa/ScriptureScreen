import type { LanguageCode, Version } from './bible';

export type Language = {
  code: LanguageCode;
  name: string;
};

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ceb', name: 'Bisaya' },
];

export type BibleVersion = {
  id: Version;
  abbreviation: string;
  name: string;
  language: Language;
  copyright: string;
};

export const BIBLE_VERSIONS: BibleVersion[] = [
  {
    id: 'kjv',
    abbreviation: 'KJV',
    name: 'King James Version',
    language: LANGUAGES[0],
    copyright: 'Public Domain',
  },
  {
    id: 'web',
    abbreviation: 'WEB',
    name: 'World English Bible',
    language: LANGUAGES[0],
    copyright: 'Public Domain',
  },
  {
    id: 'asv',
    abbreviation: 'ASV',
    name: 'American Standard Version',
    language: LANGUAGES[0],
    copyright: 'Public Domain',
  },
  {
    id: 'tagalog',
    abbreviation: 'TAG',
    name: 'Ang Dating Biblia',
    language: LANGUAGES[1],
    copyright: 'Public Domain',
  },
  {
    id: 'bisaya',
    abbreviation: 'CEB',
    name: 'Bugna, Cebuano',
    language: LANGUAGES[2],
    copyright: 'Public Domain',
  },
];
