'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligent AI-powered search.
 * It uses LLM reasoning to match user queries with the most relevant tools
 * and provides a summary of why those tools were selected.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MOCK_TOOLS } from '@/lib/db';

const AiSearchInputSchema = z.object({
  query: z.string().describe('The search query entered by the user.'),
});

const AiSearchOutputSchema = z.object({
  recommendedToolIds: z.array(z.string()).describe('List of tool IDs from the database that match the query.'),
  aiExplanation: z.string().describe('A brief, helpful explanation of why these tools were selected for this specific query.'),
});

export type AiSearchInput = z.infer<typeof AiSearchInputSchema>;
export type AiSearchOutput = z.infer<typeof AiSearchOutputSchema>;

export async function aiSearch(input: AiSearchInput): Promise<AiSearchOutput> {
  return aiSearchFlow(input);
}

const aiSearchPrompt = ai.definePrompt({
  name: 'aiSearchPrompt',
  input: { 
    schema: AiSearchInputSchema.extend({
      toolsContext: z.array(z.any()).describe('A list of available tools and their descriptions.')
    }) 
  },
  output: { schema: AiSearchOutputSchema },
  prompt: `You are an expert AI search assistant for "AI Tool Scout", a comprehensive directory of AI tools.

The user is searching for: "{{query}}"

Below is the list of tools currently available in our directory:
{{#each toolsContext}}
- ID: {{id}}, Name: {{name}}, Tagline: {{tagline}}, Description: {{description}}, Categories: {{professions}}
{{/each}}

Your task:
1. Analyze the user's intent behind the query.
2. Identify which tools from the list above best satisfy the user's request. 
3. If no tools are a perfect match, identify the most relevant alternatives.
4. If the query is completely unrelated to any tool, return an empty list of IDs but still provide a helpful AI explanation.

Return a JSON object with:
- "recommendedToolIds": An array of IDs from the provided list.
- "aiExplanation": A natural, friendly explanation of why you recommended these specific tools or why you couldn't find a direct match.`,
});

const aiSearchFlow = ai.defineFlow(
  {
    name: 'aiSearchFlow',
    inputSchema: AiSearchInputSchema,
    outputSchema: AiSearchOutputSchema,
  },
  async (input) => {
    // We prepare a lightweight context of tools to stay within token limits
    const toolsContext = MOCK_TOOLS.map(t => ({
      id: t.id,
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      professions: t.professionCategories.join(', '),
    }));

    const { output } = await aiSearchPrompt({
      ...input,
      toolsContext,
    });

    if (!output) {
      throw new Error('AI failed to generate search results.');
    }

    return output;
  }
);
