import kjv from '@/data/bible/kjv.json';
import web from '@/data/bible/web.json';
import niv from '@/data/bible/niv.json';

import {
  BIBLE_VERSIONS,
  LANGUAGES,
  type BibleVersion,
  type Language,
} from '@/lib/bible-versions';

type BibleVerseSet = { [verse: string]: string };
export type BibleData = { [book: string]: { [chapter:string]: BibleVerseSet } };

export type LanguageCode = 'en';
export type Version = 'kjv' | 'web' | 'niv';

export const BIBLE_LANGUAGES = LANGUAGES;

const BIBLE_DATA: Record<Version, BibleData> = {
  kjv: kjv as BibleData,
  web: web as BibleData,
  niv: niv as BibleData,
};

// --- Data Access Functions ---

export function getAvailableLanguages(): Language[] {
  return LANGUAGES;
}

export function getVersionsForLanguage(langCode: LanguageCode): BibleVersion[] {
  return BIBLE_VERSIONS.filter(v => v.language.code === langCode);
}

function getBibleData(version: Version): BibleData | undefined {
  return BIBLE_DATA[version];
}

export function getBooks(
  version: Version
): { id: string; name: string }[] {
  const data = getBibleData(version);
  if (!data) return [];
  return Object.keys(data).map(bookName => ({ id: bookName, name: bookName }));
}

export function getChapters(
  version: Version,
  bookName: string
): { id: string; name: string }[] {
  const data = getBibleData(version);
  if (!data || !data[bookName]) return [];
  return Object.keys(data[bookName]).map(chapterNum => ({ id: chapterNum, name: chapterNum }));
}

export function getChapterText(
  version: Version,
  bookName: string,
  chapter: string
): BibleVerseSet | null {
  const data = getBibleData(version);
  if (!data || !data[bookName] || !data[bookName][chapter]) {
    return null;
  }
  return data[bookName][chapter];
}

export function getVerse(
  version: Version,
  bookName: string,
  chapter: string,
  verse: string
): string | null {
   const data = getBibleData(version);
  if (!data || !data[bookName] || !data[bookName][chapter] || !data[bookName][chapter][verse]) {
    return null;
  }
  return data[bookName][chapter][verse];
}

export type SearchResult = {
  id: string; // A unique ID for the search result
  book: string; // Book name
  chapter: string; // Chapter number
  verse: string; // Verse number
  text: string;
};

export function search(
  version: Version,
  query: string
): SearchResult[] {
  const data = getBibleData(version);
  if (!data || !query) return [];

  const results: SearchResult[] = [];
  const lowerCaseQuery = query.toLowerCase();

  for (const book in data) {
    for (const chapter in data[book]) {
      for (const verse in data[book][chapter]) {
        const text = data[book][chapter][verse];
        if (text.toLowerCase().includes(lowerCaseQuery)) {
          results.push({
            id: `${version}-${book}-${chapter}-${verse}`,
            book: book,
            chapter: chapter,
            verse: verse,
            text: text,
          });
        }
      }
    }
  }
  return results;
}
