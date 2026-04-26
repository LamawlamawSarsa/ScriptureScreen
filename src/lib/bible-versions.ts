import type { LanguageCode, Version } from './bible';

export type Language = {
  code: LanguageCode;
  name: string;
};

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
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
    id: 'niv',
    abbreviation: 'NIV',
    name: 'New International Version',
    language: LANGUAGES[0],
    copyright: '© 1973, 1978, 1984, 2011 by Biblica, Inc.™',
  },
];
