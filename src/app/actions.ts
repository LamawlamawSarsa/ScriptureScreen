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
  type VersionId,
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

export async function getBooks(versionId: VersionId) {
  return apiGetBooks(versionId);
}

export async function getChapters(versionId: VersionId, bookId: string) {
  return apiGetChapters(versionId, bookId);
}

export async function getChapterText(versionId: VersionId, chapterId: string) {
  return apiGetChapterText(versionId, chapterId);
}

export async function search(
  versionId: VersionId,
  query: string
): Promise<SearchResult[]> {
  return apiSearch(versionId, query);
}
