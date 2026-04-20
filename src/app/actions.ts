'use server';

import {
  contextualVerseFinder,
  type ContextualVerseFinderInput,
} from '@/ai/flows/contextual-verse-finder-flow';

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
