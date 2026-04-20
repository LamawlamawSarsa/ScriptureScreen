'use server';
/**
 * @fileOverview A Genkit flow for finding relevant Bible verses and providing spiritual insights.
 *
 * - contextualVerseFinder - A function that suggests Bible verses and insights based on keywords or a phrase.
 * - ContextualVerseFinderInput - The input type for the contextualVerseFinder function.
 * - ContextualVerseFinderOutput - The return type for the contextualVerseFinder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualVerseFinderInputSchema = z.object({
  keywordsOrPhrase: z
    .string()
    .describe('Keywords or a short phrase describing a topic or feeling.'),
});
export type ContextualVerseFinderInput = z.infer<
  typeof ContextualVerseFinderInputSchema
>;

const ContextualVerseFinderOutputSchema = z.object({
  verses: z
    .array(
      z.object({
        book: z.string().describe('The name of the Bible book.'),
        chapter: z.number().describe('The chapter number.'),
        verse: z.number().describe('The verse number.'),
        text: z.string().describe('The text of the Bible verse.'),
      })
    )
    .describe('An array of relevant Bible verses.'),
  spiritualInsight: z
    .string()
    .describe('A brief spiritual insight based on the suggested verses.'),
});
export type ContextualVerseFinderOutput = z.infer<
  typeof ContextualVerseFinderOutputSchema
>;

export async function contextualVerseFinder(
  input: ContextualVerseFinderInput
): Promise<ContextualVerseFinderOutput> {
  return contextualVerseFinderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualVerseFinderPrompt',
  input: {schema: ContextualVerseFinderInputSchema},
  output: {schema: ContextualVerseFinderOutputSchema},
  prompt: `You are a helpful and spiritually insightful AI assistant specializing in biblical knowledge.

Based on the user's input, suggest 3-5 relevant Bible verses that address the topic or feeling described. For each verse, provide the book, chapter, and verse number, along with the full text of the verse. After listing the verses, provide a brief, uplifting spiritual insight that connects these verses to the user's input.

User Input: {{{keywordsOrPhrase}}}`,
});

const contextualVerseFinderFlow = ai.defineFlow(
  {
    name: 'contextualVerseFinderFlow',
    inputSchema: ContextualVerseFinderInputSchema,
    outputSchema: ContextualVerseFinderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
