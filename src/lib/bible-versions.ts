
export type Language = {
  code: string; // e.g., 'en'
  name: string; // e.g., 'English'
};

export const LANGUAGES: Language[] = [{ code: 'en', name: 'English' }];

export type BibleVersion = {
  id: string; // The unique ID for the version from the API
  abbreviation: string;
  name: string;
  language: Language;
  copyright: string;
};

// These IDs are now specific to the rest.api.bible service.
export const BIBLE_VERSIONS: BibleVersion[] = [
  {
    id: 'de4e12af7f28f599-01', // King James Version
    abbreviation: 'KJV',
    name: 'King James Version',
    language: LANGUAGES[0],
    copyright: 'Public Domain',
  },
  {
    id: '06125adad2d5898a-01', // New International Version
    abbreviation: 'NIV',
    name: 'New International Version',
    language: LANGUAGES[0],
    copyright: 'Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.®',
  },
  {
    id: '592420522e16049f-01', // New Living Translation
    abbreviation: 'NLT',
    name: 'New Living Translation',
    language: LANGUAGES[0],
    copyright:
      'Copyright © 1996, 2004, 2007, 2015 by Tyndale House Foundation.',
  },
];
