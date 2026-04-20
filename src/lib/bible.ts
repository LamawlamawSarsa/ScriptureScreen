import KJV from '@/data/bible/kjv.json';
import ASV from '@/data/bible/asv.json';
import TAGALOG from '@/data/bible/tagalog.json';
import BISAYA from '@/data/bible/bisaya.json';
import {
  BIBLE_VERSIONS,
  LANGUAGES,
  type BibleVersion,
  type Language,
} from '@/lib/bible-versions';

type BibleVerse = { [verse: string]: string };
type BibleChapter = { [chapter: string]: BibleVerse };
type BibleBook = { [book: string]: BibleChapter };
export type BibleData = BibleBook;

// Statically import all local Bible versions
const localBibleData: { [key: string]: BibleData } = {
  KJV: KJV as BibleData,
  ASV: ASV as BibleData,
  'Ang Biblia': TAGALOG as BibleData,
  Bisaya: BISAYA as BibleData,
};

export type LanguageCode = 'en' | 'tl' | 'ceb';
export type VersionId = string;

export const BIBLE_LANGUAGES = LANGUAGES;

function getVersionData(versionId: VersionId): BibleData | null {
  const versionInfo = BIBLE_VERSIONS.find(v => v.id === versionId);
  if (!versionInfo || versionInfo.type !== 'local') {
    return null; // For now, we only support local JSON files
  }
  return localBibleData[versionId] || null;
}

export function getAvailableLanguages(): Language[] {
  const supportedLanguageCodes = new Set(
    BIBLE_VERSIONS.map(v => v.language.code)
  );
  return LANGUAGES.filter(lang => supportedLanguageCodes.has(lang.code));
}

export function getVersionsForLanguage(langCode: LanguageCode): BibleVersion[] {
  return BIBLE_VERSIONS.filter(v => v.language.code === langCode);
}

export function getBooks(versionId: VersionId): string[] {
  const data = getVersionData(versionId);
  return data ? Object.keys(data) : [];
}

export function getChapters(versionId: VersionId, book: string): string[] {
  const data = getVersionData(versionId);
  return data && data[book] ? Object.keys(data[book]) : [];
}

export function getChapterText(
  versionId: VersionId,
  book: string,
  chapter: string
): BibleVerse | null {
  const data = getVersionData(versionId);
  return data?.[book]?.[chapter] || null;
}

export function getVerse(
  versionId: VersionId,
  book: string,
  chapter: string,
  verse: string
): string | null {
  const data = getVersionData(versionId);
  return data?.[book]?.[chapter]?.[verse] || null;
}

export type SearchResult = {
  book: string;
  chapter: string;
  verse: string;
  text: string;
};

export async function search(
  versionId: VersionId,
  query: string
): Promise<SearchResult[]> {
  if (!query) return [];

  const data = getVersionData(versionId);
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
