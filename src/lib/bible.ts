'use server';

import KJV from '@/data/bible/kjv.json';
import TAGALOG from '@/data/bible/tagalog.json';
import BISAYA from '@/data/bible/bisaya.json';

type BibleVerse = { [verse: string]: string };
type BibleChapter = { [chapter: string]: BibleVerse };
type BibleBook = { [book: string]: BibleChapter };
export type BibleData = BibleBook;

export const bibleData = {
  en: {
    KJV: KJV as BibleData,
  },
  tl: {
    'Ang Biblia': TAGALOG as BibleData,
  },
  ceb: {
    Bisaya: BISAYA as BibleData,
  },
};

export type LanguageCode = keyof typeof bibleData;
export type VersionName = keyof typeof bibleData[LanguageCode];

export const BIBLE_LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ceb', name: 'Bisaya' },
];

export function getVersionsForLanguage(lang: LanguageCode) {
  return Object.keys(bibleData[lang] || {});
}

export function getBooks(lang: LanguageCode, version: VersionName) {
  const data = bibleData[lang]?.[version as any];
  return data ? Object.keys(data) : [];
}

export function getChapters(
  lang: LanguageCode,
  version: VersionName,
  book: string
) {
  const data = bibleData[lang]?.[version as any]?.[book];
  return data ? Object.keys(data) : [];
}

export function getChapterText(
  lang: LanguageCode,
  version: VersionName,
  book: string,
  chapter: string
): BibleVerse | null {
  return bibleData[lang]?.[version as any]?.[book]?.[chapter] || null;
}

export function getVerse(
  lang: LanguageCode,
  version: VersionName,
  book: string,
  chapter: string,
  verse: string
): string | null {
  return (
    bibleData[lang]?.[version as any]?.[book]?.[chapter]?.[verse] || null
  );
}

export type SearchResult = {
  book: string;
  chapter: string;
  verse: string;
  text: string;
};

export function search(
  lang: LanguageCode,
  version: VersionName,
  query: string
): SearchResult[] {
  if (!query) return [];

  const data = bibleData[lang]?.[version as any];
  if (!data) return [];

  const results: SearchResult[] = [];
  const lowerCaseQuery = query.toLowerCase();

  for (const book of Object.keys(data)) {
    for (const chapter of Object.keys(data[book])) {
      for (const verse of Object.keys(data[book][chapter])) {
        const text = data[book][chapter][verse];
        if (text.toLowerCase().includes(lowerCaseQuery)) {
          results.push({ book, chapter, verse, text });
        }
      }
    }
  }

  return results;
}
