'use server';
/**
 * @fileOverview This file defines a Genkit flow for discovering trending AI tools.
 * It uses Llama 3 via Groq for high-performance market research.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TrendingToolSchema = z.object({
  id: z.string().describe('Unique slug for the tool.'),
  name: z.string().describe('Name of the AI tool.'),
  tagline: z.string().describe('Catchy one-liner.'),
  description: z.string().describe('Brief description.'),
  websiteUrl: z.string().url().describe('Official website.'),
  pricingModel: z.enum(['Free', 'Paid', 'Freemium', 'Open Source']),
  rating: z.number().describe('Estimated user rating (0-5).'),
  logoUrl: z.string().describe('Placeholder logo URL.'),
  professionCategories: z.array(z.string()),
  workCategories: z.array(z.string()),
});

const AiTrendingToolsOutputSchema = z.object({
  tools: z.array(TrendingToolSchema).describe('List of trending AI tools found globally.'),
  marketSummary: z.string().describe('A brief summary of current AI market trends.'),
});

export type AiTrendingToolsOutput = z.infer<typeof AiTrendingToolsOutputSchema>;

export async function aiTrendingTools(): Promise<AiTrendingToolsOutput> {
  return aiTrendingToolsFlow();
}

const aiTrendingToolsPrompt = ai.definePrompt({
  name: 'aiTrendingToolsPrompt',
  output: { schema: AiTrendingToolsOutputSchema },
  config: {
    model: 'groq/llama-3.3-70b-versatile',
  },
  prompt: `You are a world-class AI market researcher. Identify 6 of the most trending AI tools available globally right now.

For each tool, provide:
1. Real name and tagline.
2. Short description.
3. Official URL.
4. Pricing model.
5. A placeholder logo URL: 'https://picsum.photos/seed/<slug>/400/400'.
6. Target professions and work categories.

Include a "marketSummary" explaining these trends.`,
});

const aiTrendingToolsFlow = ai.defineFlow(
  {
    name: 'aiTrendingToolsFlow',
    inputSchema: z.void(),
    outputSchema: AiTrendingToolsOutputSchema,
  },
  async () => {
    const { output } = await aiTrendingToolsPrompt();
    if (!output) throw new Error('AI could not identify trending tools.');
    return output;
  }
);
