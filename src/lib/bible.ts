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

export type LanguageCode = 'en' | 'tl' | 'ceb';
export type VersionId = string;

export const BIBLE_LANGUAGES = LANGUAGES;

// Cache for loaded bible data
const bibleCache = new Map<VersionId, BibleData>();

// --- Transformation Functions ---

function transformNestedArray(sourceData: any[]): BibleData {
  const data: BibleData = {};
  for (const book of sourceData) {
    const bookName = book.name;
    if (!bookName || !book.chapters) continue;
    data[bookName] = {};
    book.chapters.forEach((chapterVerses: string[], chapterIndex: number) => {
      const chapterNum = chapterIndex + 1;
      data[bookName][chapterNum] = {};
      chapterVerses.forEach((verseText: string, verseIndex: number) => {
        const verseNum = verseIndex + 1;
        data[bookName][chapterNum][verseNum] = verseText;
      });
    });
  }
  return data;
}

function transformFlatObjectArray(sourceData: any[]): BibleData {
  const data: BibleData = {};
  for (const item of sourceData) {
    const bookName = item.book_name || item.book;
    const chapterNum = item.chapter;
    const verseNum = item.verse;
    const text = item.text;

    if (!bookName || !chapterNum || !verseNum || text === undefined) continue;

    if (!data[bookName]) {
      data[bookName] = {};
    }
    if (!data[bookName][chapterNum]) {
      data[bookName][chapterNum] = {};
    }
    data[bookName][chapterNum][verseNum] = text;
  }
  return data;
}

// --- Data Fetching ---

async function getVersionData(versionId: VersionId): Promise<BibleData | null> {
  if (bibleCache.has(versionId)) {
    return bibleCache.get(versionId)!;
  }

  const versionInfo = BIBLE_VERSIONS.find(v => v.id === versionId);
  if (!versionInfo || versionInfo.type !== 'online-json') {
    console.error(
      `Version ${versionId} not found or is not of type 'online-json'.`
    );
    return null;
  }

  try {
    console.log(
      `Fetching Bible data for ${versionId} from ${versionInfo.source}`
    );
    const response = await fetch(versionInfo.source, {
      next: { revalidate: 3600 * 24 }, // Revalidate once a day
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Bible data for ${versionId}: ${response.statusText}`
      );
    }

    const sourceData = await response.json();
    let data: BibleData;

    if (versionInfo.format === 'nested-array') {
      data = transformNestedArray(sourceData);
    } else if (versionInfo.format === 'flat-object-array') {
      data = transformFlatObjectArray(sourceData);
    } else {
      throw new Error(
        `Unknown format for version ${versionId}: ${versionInfo.format}`
      );
    }

    bibleCache.set(versionId, data);
    console.log(
      `Successfully loaded and transformed Bible data for ${versionId}.`
    );
    return data;
  } catch (error) {
    console.error(
      `Failed to load or process Bible data for ${versionId}:`,
      error
    );
    return null;
  }
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

export async function getBooks(versionId: VersionId): Promise<string[]> {
  const data = await getVersionData(versionId);
  return data ? Object.keys(data) : [];
}

export async function getChapters(
  versionId: VersionId,
  book: string
): Promise<string[]> {
  const data = await getVersionData(versionId);
  // Sort chapters numerically
  return data && data[book]
    ? Object.keys(data[book]).sort((a, b) => parseInt(a) - parseInt(b))
    : [];
}

export async function getChapterText(
  versionId: VersionId,
  book: string,
  chapter: string
): Promise<BibleVerse | null> {
  const data = await getVersionData(versionId);
  return data?.[book]?.[chapter] || null;
}

export async function getVerse(
  versionId: VersionId,
  book: string,
  chapter: string,
  verse: string
): Promise<string | null> {
  const data = await getVersionData(versionId);
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

  const data = await getVersionData(versionId);
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

export async function validateVersion(versionId: VersionId) {
  console.log(`Starting validation for ${versionId}...`);
  const data = await getVersionData(versionId);
  if (!data) {
    return {
      versionId,
      error: 'Could not load data for this version.',
      checks: {},
    };
  }
  console.log(`Data for ${versionId} loaded, performing checks.`);

  const bookCount = Object.keys(data).length;
  const genesisChapterCount = data['Genesis']
    ? Object.keys(data['Genesis']).length
    : 0;
  const psalmsChapterCount = data['Psalms']
    ? Object.keys(data['Psalms']).length
    : 0;
  const revelationChapterCount = data['Revelation']
    ? Object.keys(data['Revelation']).length
    : 0;
  const hasGenesis1_1 = !!data?.['Genesis']?.['1']?.['1'];
  const hasRevelation22_21 = !!data?.['Revelation']?.['22']?.['21'];

  let totalVerseCount = 0;
  for (const book in data) {
    for (const chapter in data[book]) {
      totalVerseCount += Object.keys(data[book][chapter]).length;
    }
  }

  const checks = {
    bookCount: {
      description: 'Total number of books should be 66.',
      expected: 66,
      actual: bookCount,
      pass: bookCount === 66,
    },
    genesisChapters: {
      description: 'Genesis should have 50 chapters.',
      expected: 50,
      actual: genesisChapterCount,
      pass: genesisChapterCount === 50,
    },
    psalmsChapters: {
      description: 'Psalms should have 150 chapters.',
      expected: 150,
      actual: psalmsChapterCount,
      pass: psalmsChapterCount === 150,
    },
    revelationChapters: {
      description: 'Revelation should have 22 chapters.',
      expected: 22,
      actual: revelationChapterCount,
      pass: revelationChapterCount === 22,
    },
    hasFirstVerse: {
      description: 'Must contain Genesis 1:1.',
      expected: true,
      actual: hasGenesis1_1,
      pass: hasGenesis1_1,
    },
    hasLastVerse: {
      description: 'Must contain Revelation 22:21.',
      expected: true,
      actual: hasRevelation22_21,
      pass: hasRevelation22_21,
    },
    totalVerseCount: {
      description: 'Total verse count must be over 30,000 for KJV.',
      expected: '~31,102',
      actual: totalVerseCount,
      pass: totalVerseCount > 30000,
    },
  };
  console.log(
    `Validation checks for ${versionId} complete. Overall pass: ${Object.values(
      checks
    ).every(check => check.pass)}`
  );

  const overallPass = Object.values(checks).every(check => check.pass);

  return {
    versionId,
    overallPass,
    totalVerseCount,
    checks,
  };
}
