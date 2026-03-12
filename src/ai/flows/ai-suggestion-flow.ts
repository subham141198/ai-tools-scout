'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating search suggestions.
 * It uses Groq's Llama 3.1 8B for lightning-fast, free autocomplete suggestions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestionInputSchema = z.object({
  query: z.string().describe('The current partial search query.'),
});

const SuggestionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of up to 5 relevant search keywords or phrases.'),
});

export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;
export type SuggestionOutput = z.infer<typeof SuggestionOutputSchema>;

export async function aiSuggestions(input: SuggestionInput): Promise<SuggestionOutput> {
  return aiSuggestionFlow(input);
}

const suggestionPrompt = ai.definePrompt({
  name: 'suggestionPrompt',
  input: { schema: SuggestionInputSchema },
  output: { schema: SuggestionOutputSchema },
  config: {
    model: 'groq/llama-3.1-8b-instant',
  },
  prompt: `You are a search autocomplete assistant for "AI Tool Scout".
The user is typing: "{{query}}"

Predict 5 common and relevant search terms related to AI tools, professions, or productivity tasks that match this input. 
Keep suggestions short (2-4 words) and high-impact.

Return only the suggestions in the specified JSON format.`,
});

const aiSuggestionFlow = ai.defineFlow(
  {
    name: 'aiSuggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: SuggestionOutputSchema,
  },
  async (input) => {
    if (!input.query || input.query.length < 2) {
      return { suggestions: [] };
    }

    try {
      const { output } = await suggestionPrompt(input);
      return output || { suggestions: [] };
    } catch (error) {
      console.error("Groq Suggestion Error:", error);
      return { suggestions: [] };
    }
  }
);
