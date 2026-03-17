'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligent global AI search.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSearchResultSchema = z.object({
  id: z.string().describe('A unique identifier for this tool (e.g., its name in lowercase-dashed).'),
  name: z.string().describe('The name of the AI tool.'),
  tagline: z.string().describe('A short, catchy tagline or hook.'),
  description: z.string().describe('A detailed description of what the tool does and its main benefits.'),
  websiteUrl: z.string().describe('The official website URL for the tool.'),
  pricingModel: z.string().describe('The pricing model of the tool (e.g. Free, Paid, Freemium, Open Source).'),
  professionCategories: z.array(z.string()).describe('Categories or professions this tool is best for.'),
  workCategories: z.array(z.string()).describe('Types of work this tool helps with.'),
  rating: z.number().describe('An estimated or average user rating (0-5).'),
  logoUrl: z.string().optional().describe('A placeholder logo URL.'),
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
  model: 'groq/llama-3.1-8b-instant',
  input: { schema: AiSearchInputSchema },
  output: { schema: AiSearchOutputSchema },
  prompt: `You are an expert AI search assistant for "Ainexa". 

The user is looking for tools related to: "{{query}}"

Search the global AI landscape and recommend the most relevant AI tools available today.

For each tool, provide:
1. Name, tagline, and a rich description.
2. The official website URL.
3. Pricing model.
4. Categories of professions and work types.
5. An estimated rating (0-5).
6. A generated logo URL: 'https://picsum.photos/seed/<tool-name-slug>/200/200'.

Return a structured JSON response with "recommendedTools" and a friendly "aiExplanation".`,
});

const aiSearchFlow = ai.defineFlow(
  {
    name: 'aiSearchFlow',
    inputSchema: AiSearchInputSchema,
    outputSchema: AiSearchOutputSchema,
  },
  async (input) => {
    const { output } = await aiSearchPrompt(input);
    if (!output) throw new Error('AI failed to generate search results.');
    return output;
  }
);
