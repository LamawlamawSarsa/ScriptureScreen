
import {
  BIBLE_VERSIONS,
  LANGUAGES,
  type BibleVersion,
  type Language,
} from '@/lib/bible-versions';

type BibleVerseSet = { [verse: string]: string };
export type BibleData = { [book: string]: { [chapter:string]: BibleVerseSet } };

export type LanguageCode = 'en'; // Updated to be more specific
export type VersionId = string;

export const BIBLE_LANGUAGES = LANGUAGES;

// --- API Configuration ---
const API_URL =
  process.env.BIBLE_API_URL || 'https://rest.api.bible/v1';
const API_KEY = process.env.BIBLE_API_KEY;

// --- API Fetching Utility ---
async function fetchFromApi(path: string, params: Record<string, string> = {}) {
  if (!API_KEY) {
    console.error('BIBLE_API_KEY is not set in .env file.');
    throw new Error(
      'BIBLE_API_KEY is not set. Please add it to your .env file.'
    );
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${path}${queryString ? `?${queryString}` : ''}`;

  console.log(`Fetching from API: ${path}`);

  const response = await fetch(url, {
    headers: { 'api-key': API_KEY },
    // Cache API responses for 24 hours
    next: { revalidate: 3600 * 24 },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error:', errorBody);
    throw new Error(
      `Failed to fetch from Bible API: ${response.status} ${response.statusText}`
    );
  }
  const jsonResponse = await response.json();
  return jsonResponse.data;
}

// --- Data Access Functions ---

export function getAvailableLanguages(): Language[] {
  return LANGUAGES;
}

export function getVersionsForLanguage(langCode: LanguageCode): BibleVersion[] {
  return BIBLE_VERSIONS.filter(v => v.language.code === langCode);
}

export async function getBooks(
  versionId: VersionId
): Promise<{ id: string; name: string }[]> {
  const apiBooks = await fetchFromApi(`/bibles/${versionId}/books`);

  if (!Array.isArray(apiBooks)) return [];
  return apiBooks.map(book => ({
    id: book.id,
    name: book.name,
  }));
}

export async function getChapters(
  versionId: VersionId,
  bookId: string
): Promise<{ id: string; name: string }[]> {
  const apiChapters = await fetchFromApi(
    `/bibles/${versionId}/books/${bookId}/chapters`
  );

  if (!Array.isArray(apiChapters)) return [];
  return apiChapters.map(chapter => ({
    id: chapter.id,
    name: chapter.number,
  }));
}

export async function getChapterText(
  versionId: VersionId,
  chapterId: string
): Promise<{
  text: BibleVerseSet | null;
  bookName: string;
  chapterNumber: string;
}> {
  const apiChapter = await fetchFromApi(
    `/bibles/${versionId}/chapters/${chapterId}`,
    {
      'content-type': 'json',
    }
  );

  if (!apiChapter || !apiChapter.content) {
    return { text: null, bookName: '', chapterNumber: '' };
  }
  
  const verses: BibleVerseSet = {};
  
  if (Array.isArray(apiChapter.content)) {
    let currentVerse = '';
    for (const paragraph of apiChapter.content) {
      if (paragraph.type !== 'paragraph' || !Array.isArray(paragraph.content)) continue;

      for (const item of paragraph.content) {
        if (item.type === 'verse' && item.number) {
          currentVerse = item.number;
          if (!verses[currentVerse]) {
            verses[currentVerse] = '';
          }
        }

        if (item.text && currentVerse) {
          // The API sometimes includes verse numbers in the text, so we remove them
          const cleanedText = item.text.replace(/^\[\d+\]\s*/, '');
          verses[currentVerse] += cleanedText;
        }
      }
    }
  }

  // Clean up extra spaces
  for (const v in verses) {
    verses[v] = verses[v].replace(/\s+/g, ' ').trim();
  }

  // If parsing resulted in no verses, treat it as no content
  if (Object.keys(verses).length === 0) {
    return { text: null, bookName: '', chapterNumber: '' };
  }
  
  const reference = apiChapter.reference;
  const lastSpaceIndex = reference.lastIndexOf(' ');
  const bookName = reference.substring(0, lastSpaceIndex);

  return {
    text: verses,
    bookName: bookName,
    chapterNumber: apiChapter.number,
  };
}

export async function getVerse(
  versionId: VersionId,
  verseId: string
): Promise<{
  text: string;
  bookName: string;
  chapterNumber: string;
  verseNumber: string;
} | null> {
  const apiVerse = await fetchFromApi(`/bibles/${versionId}/verses/${verseId}`);

  if (!apiVerse || !apiVerse.content) {
    return null;
  }

  // content from the API is an HTML string
  const text = apiVerse.content.replace(/<[^>]*>?/gm, '').trim();

  const reference = apiVerse.reference; // e.g., "Genesis 1:1" or "1 John 1:1"
  const lastSpaceIndex = reference.lastIndexOf(' ');
  const bookName = reference.substring(0, lastSpaceIndex);
  const chapterAndVerse = reference.substring(lastSpaceIndex + 1);
  const [chapterNumber, verseNumber] = chapterAndVerse.split(':');

  return {
    text,
    bookName,
    chapterNumber,
    verseNumber,
  };
}

export type SearchResult = {
  id: string; // A unique ID for the search result
  book: string; // Book ID
  chapter: string; // Chapter ID
  verse: string; // Verse number
  bookName: string; // Human-readable book name
  text: string;
};

export async function search(
  versionId: VersionId,
  query: string
): Promise<SearchResult[]> {
  if (!query) return [];

  const response = await fetchFromApi(`/bibles/${versionId}/search`, { query });

  if (!response || !Array.isArray(response.verses)) return [];

  return response.verses.map((verse: any) => {
    const reference = verse.reference;
    const lastSpaceIndex = reference.lastIndexOf(' ');
    const bookName = reference.substring(0, lastSpaceIndex);
    
    return {
        id: verse.id,
        book: verse.bookId,
        chapter: verse.chapterId,
        verse: verse.verseId.split('.').pop() || '',
        bookName: bookName,
        text: verse.text,
      }
  });
}
