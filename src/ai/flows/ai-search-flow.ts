'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligent global AI search.
 * It uses LLM reasoning to identify the best AI tools available worldwide
 * based on the user's query, providing detailed tool information and rationale.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSearchResultSchema = z.object({
  id: z.string().describe('A unique identifier for this tool (e.g., its name in lowercase-dashed).'),
  name: z.string().describe('The name of the AI tool.'),
  tagline: z.string().describe('A short, catchy tagline or hook.'),
  description: z.string().describe('A detailed description of what the tool does and its main benefits.'),
  websiteUrl: z.string().url().describe('The official website URL for the tool.'),
  pricingModel: z.enum(['Free', 'Paid', 'Freemium', 'Open Source']).describe('The pricing model of the tool.'),
  professionCategories: z.array(z.string()).describe('Categories or professions this tool is best for.'),
  workCategories: z.array(z.string()).describe('Types of work this tool helps with.'),
  rating: z.number().describe('An estimated or average user rating (0-5).'),
  logoUrl: z.string().optional().describe('A placeholder or predicted logo URL (can be from picsum for this prototype).'),
});

const AiSearchInputSchema = z.object({
  query: z.string().describe('The search query entered by the user.'),
});

const AiSearchOutputSchema = z.object({
  recommendedTools: z.array(AiSearchResultSchema).describe('List of AI tools found in the world that match the query.'),
  aiExplanation: z.string().describe('A brief, helpful explanation of why these tools were selected.'),
});

export type AiSearchInput = z.infer<typeof AiSearchInputSchema>;
export type AiSearchOutput = z.infer<typeof AiSearchOutputSchema>;

export async function aiSearch(input: AiSearchInput): Promise<AiSearchOutput> {
  return aiSearchFlow(input);
}

const aiSearchPrompt = ai.definePrompt({
  name: 'aiSearchPrompt',
  input: { schema: AiSearchInputSchema },
  output: { schema: AiSearchOutputSchema },
  prompt: `You are an expert AI search assistant for "AI Tool Scout". 

The user is looking for tools related to: "{{query}}"

Your task is to search your extensive knowledge of the global AI software landscape and recommend the most relevant, high-quality AI tools available today. DO NOT restrict yourself to any specific list; use your full training data to find the best solutions in the world.

For each tool, provide:
1. Name, tagline, and a rich description.
2. The official website URL.
3. Pricing model (Free, Paid, Freemium, or Open Source).
4. Categories of professions and work types it serves.
5. An estimated rating based on industry sentiment.
6. A generated logo URL using 'https://picsum.photos/seed/<tool-name-slug>/200/200'.

Return a structured JSON response with "recommendedTools" and a friendly "aiExplanation" detailing why these tools are the top picks for this query.`,
});

const aiSearchFlow = ai.defineFlow(
  {
    name: 'aiSearchFlow',
    inputSchema: AiSearchInputSchema,
    outputSchema: AiSearchOutputSchema,
  },
  async (input) => {
    const { output } = await aiSearchPrompt(input);

    if (!output) {
      throw new Error('AI failed to generate search results.');
    }

    return output;
  }
);
