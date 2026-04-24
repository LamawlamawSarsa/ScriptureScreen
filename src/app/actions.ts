'use server';

import {
  contextualVerseFinder,
  type ContextualVerseFinderInput,
} from '@/ai/flows/contextual-verse-finder-flow';
import {
  getBooks as apiGetBooks,
  getChapters as apiGetChapters,
  getChapterText as apiGetChapterText,
  search as apiSearch,
  type Version,
  type SearchResult,
} from '@/lib/bible';

export async function findContextualVerse(
  input: ContextualVerseFinderInput
) {
  try {
    const result = await contextualVerseFinder(input);
    return result;
  } catch (error) {
    console.error('Error in findContextualVerse server action:', error);
    throw new Error('Failed to get response from AI.');
  }
}

// These functions are now simple wrappers around synchronous local data functions.
// They are kept as async to maintain consistency in the calling components (hooks).
export async function getBooks(versionId: Version) {
  return apiGetBooks(versionId);
}

export async function getChapters(versionId: Version, bookName: string) {
  return apiGetChapters(versionId, bookName);
}

export async function getChapterText(
  versionId: Version,
  bookName: string,
  chapter: string
) {
  return apiGetChapterText(versionId, bookName, chapter);
}

export async function search(
  versionId: Version,
  query: string
): Promise<SearchResult[]> {
  return apiSearch(versionId, query);
}
