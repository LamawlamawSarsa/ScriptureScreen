import {
  BIBLE_VERSIONS,
  LANGUAGES,
  type BibleVersion,
  type Language,
} from '@/lib/bible-versions';

type BibleVerse = { [verse: string]: string };
export type BibleData = { [book: string]: { [chapter: string]: BibleVerse } };

export type LanguageCode = 'en'; // Updated to be more specific
export type VersionId = string;

export const BIBLE_LANGUAGES = LANGUAGES;

// --- API Configuration ---
// TODO: Add your Bible API URL and Key to the .env file
const API_URL =
  process.env.BIBLE_API_URL || 'https://api.scripture.api.bible/v1';
const API_KEY = process.env.BIBLE_API_KEY;

// --- API Fetching Utility ---
async function fetchFromApi(path: string, params: Record<string, string> = {}) {
  if (!API_KEY) {
    // In a real app, you might want to handle this more gracefully.
    // For now, we'll throw an error to make it clear what's missing.
    throw new Error(
      'BIBLE_API_KEY is not set. Please add it to your .env file.'
    );
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${path}?${queryString}`;

  console.log(`Fetching from API: ${url}`);

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
  // TODO: Adjust the path and response parsing based on your API's documentation.
  const apiBooks = await fetchFromApi(`/bibles/${versionId}/books`);

  // Assuming the API returns an array of objects like: { id: "GEN", name: "Genesis", ... }
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
  // TODO: Adjust the path and response parsing based on your API's documentation.
  const apiChapters = await fetchFromApi(
    `/bibles/${versionId}/books/${bookId}/chapters`
  );

  // Assuming the API returns an array of objects like: { id: "GEN.1", number: "1", ... }
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
  text: BibleVerse | null;
  bookName: string;
  chapterNumber: string;
}> {
  // TODO: Adjust the path and response parsing based on your API's documentation.
  // This example assumes content-type=json returns a structured format.
  // Many APIs return HTML-like strings that need more complex parsing.
  const apiChapter = await fetchFromApi(`/bibles/${versionId}/chapters/${chapterId}`, {
    'content-type': 'json',
  });

  if (!apiChapter || !apiChapter.content) {
    return { text: null, bookName: '', chapterNumber: '' };
  }

  // This parsing logic is HIGHLY DEPENDENT on the API response structure.
  // You WILL likely need to change this.
  const verses: BibleVerse = {};
  apiChapter.content.forEach((item: any) => {
    if (item.name === 'para' && Array.isArray(item.items)) {
      item.items.forEach((paraItem: any) => {
        if (
          paraItem.name === 'verse' &&
          paraItem.items &&
          paraItem.attrs?.number
        ) {
          const verseNum = paraItem.attrs.number;
          const verseText = paraItem.items
            .map((textItem: any) => textItem.text)
            .join('');
          verses[verseNum] = (verses[verseNum] || '') + verseText;
        }
      });
    }
  });

  const bookName =
    BIBLE_VERSIONS.find(v => v.id === versionId)?.name || 'Unknown';

  return {
    text: verses,
    bookName: bookName,
    chapterNumber: apiChapter.number,
  };
}

export async function getVerse(
  versionId: VersionId,
  verseId: string
): Promise<string | null> {
  // TODO: Implement this based on your API. This is a placeholder.
  // Many APIs fetch by chapter, so you might reuse getChapterText.
  console.warn('getVerse is not fully implemented for API usage yet.');
  return 'Verse fetching from API not implemented.';
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

  // TODO: Adjust path and response parsing. This assumes a specific search API structure.
  const response = await fetchFromApi(`/bibles/${versionId}/search`, { query });

  if (!response || !Array.isArray(response.verses)) return [];

  // This mapping is an example. You'll need to adapt it.
  return response.verses.map((verse: any) => ({
    id: verse.id,
    book: verse.bookId,
    chapter: verse.chapterId,
    verse: verse.verseId, // Assuming verseId is the number
    bookName: verse.bookId, // Placeholder, might need another lookup
    text: verse.text,
  }));
}
